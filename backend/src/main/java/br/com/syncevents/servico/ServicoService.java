package br.com.syncevents.servico;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.categoria.Categoria;
import br.com.syncevents.categoria.CategoriaRepository;
import br.com.syncevents.common.ApiException;
import br.com.syncevents.common.Textos;
import br.com.syncevents.empresa.Empresa;
import br.com.syncevents.empresa.EmpresaRepository;
import br.com.syncevents.empresa.EmpresaService;
import br.com.syncevents.servico.dto.ServicoRequest;
import br.com.syncevents.servico.dto.ServicoResponse;
import br.com.syncevents.solicitacao.SolicitacaoRepository;
import br.com.syncevents.storage.StorageService;
import br.com.syncevents.usuario.TipoUsuario;

@Service
public class ServicoService {

    static final int MAX_FOTOS = 6;

    private final ServicoRepository repository;
    private final CategoriaRepository categoriaRepository;
    private final EmpresaRepository empresaRepository;
    private final EmpresaService empresaService;
    private final StorageService storage;
    private final SolicitacaoRepository solicitacaoRepository;

    public ServicoService(ServicoRepository repository, CategoriaRepository categoriaRepository,
            EmpresaRepository empresaRepository, EmpresaService empresaService, StorageService storage,
            SolicitacaoRepository solicitacaoRepository) {
        this.repository = repository;
        this.categoriaRepository = categoriaRepository;
        this.empresaRepository = empresaRepository;
        this.empresaService = empresaService;
        this.storage = storage;
        this.solicitacaoRepository = solicitacaoRepository;
    }

    @Transactional(readOnly = true)
    public List<ServicoResponse> listarMeus(UsuarioAutenticado usuario) {
        Empresa empresa = empresaService.daUsuario(usuario);
        return repository.listarDaEmpresa(empresa.getId()).stream().map(ServicoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public List<ServicoResponse> listarVisiveisDaEmpresa(Long empresaId) {
        if (!empresaRepository.existsById(empresaId)) {
            throw ApiException.naoEncontrado("Empresa não encontrada");
        }
        return repository.listarVisiveisDaEmpresa(empresaId).stream().map(ServicoResponse::de).toList();
    }

    /** A dona vê qualquer serviço seu; os demais só veem serviços ativos e publicados. */
    @Transactional(readOnly = true)
    public ServicoResponse buscar(UsuarioAutenticado usuario, Long id) {
        Servico servico = repository.buscarComDetalhes(id)
                .orElseThrow(() -> ApiException.naoEncontrado("Serviço não encontrado"));
        if (!servico.isVisivel() && !ehDona(usuario, servico)) {
            throw ApiException.naoEncontrado("Serviço não encontrado");
        }
        return ServicoResponse.de(servico);
    }

    @Transactional
    public ServicoResponse criar(UsuarioAutenticado usuario, ServicoRequest req) {
        Empresa empresa = empresaService.daUsuario(usuario);
        Servico servico = new Servico(empresa);
        aplicar(servico, req);
        return ServicoResponse.de(repository.save(servico));
    }

    @Transactional
    public ServicoResponse atualizar(UsuarioAutenticado usuario, Long id, ServicoRequest req) {
        Servico servico = daDona(usuario, id);
        aplicar(servico, req);
        return ServicoResponse.de(repository.saveAndFlush(servico));
    }

    @Transactional
    public void excluir(UsuarioAutenticado usuario, Long id) {
        Servico servico = daDona(usuario, id);
        if (solicitacaoRepository.servicoTemSolicitacoes(id)) {
            throw ApiException.conflito("Este serviço aparece em solicitações de clientes. Desative-o em vez de excluir.");
        }
        List<String> urls = servico.getFotos().stream().map(ServicoFoto::getUrl).toList();
        repository.delete(servico);
        urls.forEach(storage::remover);
    }

    @Transactional
    public ServicoResponse adicionarFoto(UsuarioAutenticado usuario, Long id, MultipartFile arquivo) {
        Servico servico = daDona(usuario, id);
        if (servico.getFotos().size() >= MAX_FOTOS) {
            throw ApiException.campoInvalido("fotos", "No máximo " + MAX_FOTOS + " fotos por serviço");
        }
        if (arquivo == null || arquivo.isEmpty()) {
            throw ApiException.campoInvalido("arquivo", "Envie uma imagem");
        }
        servico.adicionarFoto(storage.salvarImagem(arquivo, "servicos"));
        return ServicoResponse.de(repository.saveAndFlush(servico));
    }

    @Transactional
    public ServicoResponse removerFoto(UsuarioAutenticado usuario, Long id, Long fotoId) {
        Servico servico = daDona(usuario, id);
        ServicoFoto foto = servico.getFotos().stream().filter(f -> f.getId().equals(fotoId)).findFirst()
                .orElseThrow(() -> ApiException.naoEncontrado("Foto não encontrada"));
        servico.getFotos().remove(foto);
        storage.remover(foto.getUrl());
        return ServicoResponse.de(repository.saveAndFlush(servico));
    }

    // ---------------------------------------------------------------------

    /** Carrega o serviço garantindo que pertence à empresa logada (404 se não existe, 403 se é de outra). */
    private Servico daDona(UsuarioAutenticado usuario, Long id) {
        Empresa empresa = empresaService.daUsuario(usuario);
        Servico servico = repository.buscarComDetalhes(id)
                .orElseThrow(() -> ApiException.naoEncontrado("Serviço não encontrado"));
        if (!servico.getEmpresa().getId().equals(empresa.getId())) {
            throw ApiException.acessoNegado("Este serviço pertence a outra empresa");
        }
        return servico;
    }

    private boolean ehDona(UsuarioAutenticado usuario, Servico servico) {
        if (usuario == null || usuario.tipo() != TipoUsuario.EMPRESA) {
            return false;
        }
        return servico.getEmpresa().getUsuario().getId().equals(usuario.id());
    }

    void aplicar(Servico servico, ServicoRequest req) {
        boolean rascunho = Boolean.TRUE.equals(req.rascunho());
        Map<String, String> erros = validarPublicacao(req, rascunho);
        if (!erros.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDACAO", "Dados inválidos", erros);
        }
        Categoria categoria = categoriaRepository.findById(req.categoriaId())
                .orElseThrow(() -> ApiException.campoInvalido("categoriaId", "Categoria inválida"));

        ModeloPreco modelo = req.modeloPreco() != null ? req.modeloPreco() : ModeloPreco.SOB_CONSULTA;
        servico.setCategoria(categoria);
        servico.setNome(Textos.normalizarEspacos(req.nome()));
        servico.setDescricao(Textos.vazioParaNulo(req.descricao()));
        servico.setModeloPreco(modelo);
        servico.setPrecoMin(modelo == ModeloPreco.SOB_CONSULTA ? null : req.precoMin());
        servico.setPrecoMax(modelo == ModeloPreco.FAIXA ? req.precoMax() : null);
        servico.setAtivo(req.ativo() == null || req.ativo());
        servico.setRascunho(rascunho);
        servico.substituirItens(req.itensInclusos());
    }

    /** Regras para publicar. Rascunho só exige nome e categoria (Bean Validation). */
    static Map<String, String> validarPublicacao(ServicoRequest req, boolean rascunho) {
        Map<String, String> erros = new LinkedHashMap<>();
        BigDecimal min = req.precoMin();
        BigDecimal max = req.precoMax();
        if (req.modeloPreco() == ModeloPreco.FAIXA && min != null && max != null && max.compareTo(min) < 0) {
            erros.put("precoMax", "O valor máximo deve ser maior ou igual ao mínimo");
        }
        if (rascunho) {
            return erros;
        }
        if (req.descricao() == null || req.descricao().isBlank()) {
            erros.put("descricao", "Descreva o serviço");
        }
        if (req.modeloPreco() == null) {
            erros.put("modeloPreco", "Escolha o modelo de preço");
        } else if (req.modeloPreco() != ModeloPreco.SOB_CONSULTA && (min == null || min.signum() <= 0)) {
            erros.put("precoMin", "Informe o valor");
        }
        if (req.modeloPreco() == ModeloPreco.FAIXA && (max == null || max.signum() <= 0)) {
            erros.putIfAbsent("precoMax", "Informe o valor máximo");
        }
        return erros;
    }
}
