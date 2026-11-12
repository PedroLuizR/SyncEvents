package br.com.syncevents.empresa;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.categoria.Categoria;
import br.com.syncevents.categoria.CategoriaRepository;
import br.com.syncevents.common.ApiException;
import br.com.syncevents.common.Textos;
import br.com.syncevents.common.validacao.Documentos;
import br.com.syncevents.empresa.dto.EmpresaPerfilResponse;
import br.com.syncevents.empresa.dto.EmpresaUpdateRequest;
import br.com.syncevents.storage.StorageService;
import br.com.syncevents.usuario.TipoUsuario;

@Service
public class EmpresaService {

    static final int MAX_FOTOS_PORTFOLIO = 12;

    private final EmpresaRepository empresaRepository;
    private final PortfolioFotoRepository portfolioRepository;
    private final CategoriaRepository categoriaRepository;
    private final StorageService storage;

    public EmpresaService(EmpresaRepository empresaRepository, PortfolioFotoRepository portfolioRepository,
            CategoriaRepository categoriaRepository, StorageService storage) {
        this.empresaRepository = empresaRepository;
        this.portfolioRepository = portfolioRepository;
        this.categoriaRepository = categoriaRepository;
        this.storage = storage;
    }

    /** Empresa do usuário logado; 403 se o usuário não for uma empresa. */
    @Transactional(readOnly = true)
    public Empresa daUsuario(UsuarioAutenticado usuario) {
        if (usuario == null || usuario.tipo() != TipoUsuario.EMPRESA) {
            throw ApiException.acessoNegado("Disponível apenas para empresas");
        }
        return empresaRepository.findByUsuarioId(usuario.id())
                .orElseThrow(() -> ApiException.acessoNegado("Disponível apenas para empresas"));
    }

    @Transactional(readOnly = true)
    public EmpresaPerfilResponse meuPerfil(UsuarioAutenticado usuario) {
        return perfil(daUsuario(usuario));
    }

    @Transactional
    public EmpresaPerfilResponse atualizar(UsuarioAutenticado usuario, EmpresaUpdateRequest req) {
        Empresa empresa = daUsuario(usuario);
        Set<Long> ids = new HashSet<>(req.categoriaIds());
        List<Categoria> categorias = categoriaRepository.findAllById(ids);
        if (categorias.size() != ids.size()) {
            throw ApiException.campoInvalido("categoriaIds", "Categoria inválida");
        }
        String cidade = req.cidade().trim();
        empresa.setNomeFantasia(req.nomeFantasia().trim());
        empresa.setTelefoneWhatsapp(Documentos.apenasDigitos(req.telefone()));
        empresa.setCidade(cidade);
        empresa.setUf(Textos.extrairUf(cidade));
        empresa.setEndereco(Textos.vazioParaNulo(req.endereco()));
        empresa.setDescricao(Textos.vazioParaNulo(req.descricao()));
        empresa.setCategorias(new HashSet<>(categorias));
        return perfil(empresaRepository.save(empresa));
    }

    @Transactional
    public EmpresaPerfilResponse enviarLogo(UsuarioAutenticado usuario, MultipartFile arquivo) {
        Empresa empresa = daUsuario(usuario);
        String antiga = empresa.getLogoUrl();
        empresa.setLogoUrl(storage.salvarImagem(exigirArquivo(arquivo), "logos"));
        storage.remover(antiga);
        return perfil(empresa);
    }

    @Transactional
    public EmpresaPerfilResponse enviarCapa(UsuarioAutenticado usuario, MultipartFile arquivo) {
        Empresa empresa = daUsuario(usuario);
        String antiga = empresa.getCapaUrl();
        empresa.setCapaUrl(storage.salvarImagem(exigirArquivo(arquivo), "capas"));
        storage.remover(antiga);
        return perfil(empresa);
    }

    @Transactional
    public EmpresaPerfilResponse adicionarPortfolio(UsuarioAutenticado usuario, MultipartFile arquivo) {
        Empresa empresa = daUsuario(usuario);
        if (portfolioRepository.countByEmpresaId(empresa.getId()) >= MAX_FOTOS_PORTFOLIO) {
            throw ApiException.campoInvalido("portfolio", "No máximo " + MAX_FOTOS_PORTFOLIO + " fotos no portfólio");
        }
        String url = storage.salvarImagem(exigirArquivo(arquivo), "portfolio");
        portfolioRepository.save(new PortfolioFoto(empresa, url,
                portfolioRepository.maiorOrdem(empresa.getId()) + 1));
        return perfil(empresa);
    }

    @Transactional
    public EmpresaPerfilResponse removerPortfolio(UsuarioAutenticado usuario, Long fotoId) {
        Empresa empresa = daUsuario(usuario);
        PortfolioFoto foto = portfolioRepository.findByIdAndEmpresaId(fotoId, empresa.getId())
                .orElseThrow(() -> ApiException.naoEncontrado("Foto não encontrada"));
        portfolioRepository.delete(foto);
        storage.remover(foto.getUrl());
        return perfil(empresa);
    }

    private EmpresaPerfilResponse perfil(Empresa empresa) {
        return EmpresaPerfilResponse.de(empresa,
                portfolioRepository.findByEmpresaIdOrderByOrdemAscIdAsc(empresa.getId()));
    }

    static MultipartFile exigirArquivo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw ApiException.campoInvalido("arquivo", "Envie uma imagem");
        }
        return arquivo;
    }
}
