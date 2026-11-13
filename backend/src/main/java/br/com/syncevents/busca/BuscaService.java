package br.com.syncevents.busca;

import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.avaliacao.AvaliacaoService;
import br.com.syncevents.avaliacao.dto.ResumoAvaliacoes;
import br.com.syncevents.categoria.CategoriaResponse;
import br.com.syncevents.cliente.Cliente;
import br.com.syncevents.cliente.ClienteRepository;
import br.com.syncevents.common.ApiException;
import br.com.syncevents.common.Pagina;
import br.com.syncevents.empresa.Empresa;
import br.com.syncevents.empresa.EmpresaRepository;
import br.com.syncevents.empresa.PortfolioFotoRepository;
import br.com.syncevents.empresa.VisualizacaoPerfilRepository;
import br.com.syncevents.servico.ServicoRepository;
import br.com.syncevents.servico.dto.FotoResponse;
import br.com.syncevents.servico.dto.ServicoResponse;
import br.com.syncevents.solicitacao.SolicitacaoRepository;
import br.com.syncevents.solicitacao.StatusSolicitacao;
import br.com.syncevents.usuario.TipoUsuario;

@Service
public class BuscaService {

    static final int LIMITE_RECOMENDADAS = 10;
    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

    private final BuscaRepository buscaRepository;
    private final EmpresaRepository empresaRepository;
    private final ClienteRepository clienteRepository;
    private final ServicoRepository servicoRepository;
    private final PortfolioFotoRepository portfolioRepository;
    private final VisualizacaoPerfilRepository visualizacaoRepository;
    private final SolicitacaoRepository solicitacaoRepository;
    private final AvaliacaoService avaliacaoService;

    public BuscaService(BuscaRepository buscaRepository, EmpresaRepository empresaRepository,
            ClienteRepository clienteRepository, ServicoRepository servicoRepository,
            PortfolioFotoRepository portfolioRepository, VisualizacaoPerfilRepository visualizacaoRepository,
            SolicitacaoRepository solicitacaoRepository, AvaliacaoService avaliacaoService) {
        this.buscaRepository = buscaRepository;
        this.empresaRepository = empresaRepository;
        this.clienteRepository = clienteRepository;
        this.servicoRepository = servicoRepository;
        this.portfolioRepository = portfolioRepository;
        this.visualizacaoRepository = visualizacaoRepository;
        this.solicitacaoRepository = solicitacaoRepository;
        this.avaliacaoService = avaliacaoService;
    }

    @Transactional(readOnly = true)
    public Pagina<EmpresaResumo> buscar(FiltroBusca filtro) {
        BuscaRepository.Resultado r = buscaRepository.buscar(filtro);
        return Pagina.de(r.empresas(), filtro.pagina(), filtro.tamanho(), r.total());
    }

    @Transactional(readOnly = true)
    public List<EmpresaResumo> recomendadas(UsuarioAutenticado usuario) {
        String cidade = clienteRepository.findByUsuarioId(usuario.id()).map(Cliente::getCidade).orElse(null);
        return buscaRepository.recomendadas(cidade, LIMITE_RECOMENDADAS);
    }

    /** Perfil público. Quando quem abre é um cliente, registra a visualização. */
    @Transactional
    public EmpresaPublicaResponse perfil(UsuarioAutenticado usuario, Long id) {
        Empresa e = empresaRepository.findComCategoriasById(id)
                .filter(emp -> emp.getUsuario().isAtivo())
                .orElseThrow(() -> ApiException.naoEncontrado("Empresa não encontrada"));

        if (usuario != null && usuario.tipo() == TipoUsuario.CLIENTE) {
            Long clienteId = clienteRepository.findByUsuarioId(usuario.id()).map(Cliente::getId).orElse(null);
            visualizacaoRepository.registrar(e.getId(), clienteId);
        }

        List<ServicoResponse> servicos = servicoRepository.listarVisiveisDaEmpresa(e.getId()).stream()
                .map(ServicoResponse::de).toList();
        List<FotoResponse> portfolio = portfolioRepository.findByEmpresaIdOrderByOrdemAscIdAsc(e.getId()).stream()
                .map(p -> new FotoResponse(p.getId(), p.getUrl(), p.getOrdem())).toList();
        long eventos = solicitacaoRepository.countByEmpresaIdAndStatus(e.getId(), StatusSolicitacao.CONCLUIDA);
        ResumoAvaliacoes avaliacoes = avaliacaoService.resumo(e.getId());
        var indicadores = new EmpresaPublicaResponse.Indicadores(eventos, servicos.size(), portfolio.size(),
                e.getCriadoEm().atZone(FUSO).getYear(), avaliacoes.recomendam());

        return new EmpresaPublicaResponse(e.getId(), e.getCodigo(), e.getNomeFantasia(), e.getDescricao(),
                e.getCidade(), e.getUf(), e.getEndereco(), e.getTelefoneWhatsapp(), e.getLogoUrl(), e.getCapaUrl(),
                e.getCategorias().stream().map(CategoriaResponse::de)
                        .sorted(Comparator.comparing(CategoriaResponse::id)).toList(),
                portfolio, servicos, avaliacoes.media(), avaliacoes.total(), indicadores);
    }
}
