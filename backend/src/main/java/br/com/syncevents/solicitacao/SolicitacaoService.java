package br.com.syncevents.solicitacao;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.avaliacao.AvaliacaoRepository;
import br.com.syncevents.chat.ChatService;
import br.com.syncevents.chat.Conversa;
import br.com.syncevents.chat.ConversaRepository;
import br.com.syncevents.cliente.Cliente;
import br.com.syncevents.cliente.ClienteRepository;
import br.com.syncevents.common.ApiException;
import br.com.syncevents.common.Textos;
import br.com.syncevents.empresa.Empresa;
import br.com.syncevents.empresa.EmpresaRepository;
import br.com.syncevents.empresa.EmpresaService;
import br.com.syncevents.empresa.VisualizacaoPerfilRepository;
import br.com.syncevents.servico.Servico;
import br.com.syncevents.servico.ServicoRepository;
import br.com.syncevents.solicitacao.dto.DashboardResponse;
import br.com.syncevents.solicitacao.dto.PropostaRequest;
import br.com.syncevents.solicitacao.dto.PropostaResponse;
import br.com.syncevents.solicitacao.dto.SolicitacaoRequest;
import br.com.syncevents.solicitacao.dto.SolicitacaoResponse;
import br.com.syncevents.storage.StorageService;
import br.com.syncevents.usuario.TipoUsuario;

@Service
public class SolicitacaoService {

    static final int MAX_ANEXOS = 5;
    static final int DIAS_PAINEL = 30;

    private final SolicitacaoRepository repository;
    private final PropostaRepository propostaRepository;
    private final ConversaRepository conversaRepository;
    private final ClienteRepository clienteRepository;
    private final EmpresaRepository empresaRepository;
    private final EmpresaService empresaService;
    private final ServicoRepository servicoRepository;
    private final VisualizacaoPerfilRepository visualizacaoRepository;
    private final StorageService storage;
    private final ChatService chatService;
    private final AvaliacaoRepository avaliacaoRepository;

    public SolicitacaoService(SolicitacaoRepository repository, PropostaRepository propostaRepository,
            ConversaRepository conversaRepository, ClienteRepository clienteRepository,
            EmpresaRepository empresaRepository, EmpresaService empresaService, ServicoRepository servicoRepository,
            VisualizacaoPerfilRepository visualizacaoRepository, StorageService storage, ChatService chatService,
            AvaliacaoRepository avaliacaoRepository) {
        this.repository = repository;
        this.propostaRepository = propostaRepository;
        this.conversaRepository = conversaRepository;
        this.clienteRepository = clienteRepository;
        this.empresaRepository = empresaRepository;
        this.empresaService = empresaService;
        this.servicoRepository = servicoRepository;
        this.visualizacaoRepository = visualizacaoRepository;
        this.storage = storage;
        this.chatService = chatService;
        this.avaliacaoRepository = avaliacaoRepository;
    }

    // ------------------------------------------------------------------ cliente

    /** ID08: cria a solicitação e, junto, a conversa entre cliente e empresa. */
    @Transactional
    public SolicitacaoResponse criar(UsuarioAutenticado usuario, SolicitacaoRequest req) {
        Cliente cliente = clienteDe(usuario);
        Empresa empresa = empresaRepository.findById(req.empresaId())
                .filter(e -> e.getUsuario().isAtivo())
                .orElseThrow(() -> ApiException.campoInvalido("empresaId", "Empresa não encontrada"));
        if (req.orcamentoMin() != null && req.orcamentoMax() != null
                && req.orcamentoMax().compareTo(req.orcamentoMin()) < 0) {
            throw ApiException.campoInvalido("orcamentoMax", "O valor máximo deve ser maior ou igual ao mínimo");
        }

        Solicitacao s = new Solicitacao(cliente, empresa);
        s.setTipoEvento(req.tipoEvento());
        s.setDataEvento(req.dataEvento());
        s.setQtdConvidados(req.qtdConvidados());
        s.setLocal(req.local().trim());
        s.setOrcamentoMin(req.orcamentoMin());
        s.setOrcamentoMax(req.orcamentoMax());
        s.setMensagem(Textos.vazioParaNulo(req.mensagem()));
        s.setAceiteContato(true);
        s.getServicos().addAll(servicosDaEmpresa(empresa, req.servicoIds()));
        repository.save(s);

        Conversa conversa = conversaRepository.save(new Conversa(s));
        return SolicitacaoResponse.detalhe(s, conversa.getId());
    }

    @Transactional
    public SolicitacaoResponse adicionarAnexo(UsuarioAutenticado usuario, Long id, MultipartFile arquivo) {
        Solicitacao s = doCliente(usuario, id);
        if (s.getStatus().finalizada()) {
            throw ApiException.conflito("Esta solicitação já foi encerrada");
        }
        if (s.getAnexos().size() >= MAX_ANEXOS) {
            throw ApiException.campoInvalido("anexos", "No máximo " + MAX_ANEXOS + " imagens de inspiração");
        }
        if (arquivo == null || arquivo.isEmpty()) {
            throw ApiException.campoInvalido("arquivo", "Envie uma imagem");
        }
        s.getAnexos().add(new SolicitacaoAnexo(s, storage.salvarImagem(arquivo, "inspiracoes")));
        repository.saveAndFlush(s);
        return detalhe(s);
    }

    @Transactional
    public SolicitacaoResponse cancelar(UsuarioAutenticado usuario, Long id) {
        Solicitacao s = doCliente(usuario, id);
        if (!s.getStatus().clientePodeCancelar()) {
            throw ApiException.conflito("Não é possível cancelar uma solicitação " + rotulo(s.getStatus()));
        }
        s.propostaEmAberto().ifPresent(p -> p.setStatus(StatusProposta.RECUSADA));
        s.setStatus(StatusSolicitacao.CANCELADA);
        repository.saveAndFlush(s);
        return detalhe(s);
    }

    /** Cliente aceita (solicitação vira ACEITA) ou recusa (empresa pode mandar outra proposta). */
    @Transactional
    public SolicitacaoResponse responderProposta(UsuarioAutenticado usuario, Long propostaId, StatusProposta resposta) {
        Proposta p = propostaRepository.findById(propostaId)
                .orElseThrow(() -> ApiException.naoEncontrado("Proposta não encontrada"));
        Solicitacao s = doCliente(usuario, p.getSolicitacao().getId());
        if (resposta == StatusProposta.ENVIADA) {
            throw ApiException.campoInvalido("status", "Responda com ACEITA ou RECUSADA");
        }
        if (p.getStatus() != StatusProposta.ENVIADA || s.getStatus() != StatusSolicitacao.EM_NEGOCIACAO) {
            throw ApiException.conflito("Esta proposta já foi respondida");
        }
        p.setStatus(resposta);
        if (resposta == StatusProposta.ACEITA) {
            s.setStatus(StatusSolicitacao.ACEITA);
        }
        repository.saveAndFlush(s);
        chatService.propostaAtualizada(p);
        return detalhe(s);
    }

    // ------------------------------------------------------------------ empresa

    /** ID10: EM_ANALISE, RECUSADA ou CONCLUIDA, conforme a máquina de estados (409 se inválida). */
    @Transactional
    public SolicitacaoResponse mudarStatus(UsuarioAutenticado usuario, Long id, StatusSolicitacao destino) {
        Solicitacao s = daEmpresa(usuario, id);
        if (!s.getStatus().empresaPodeMudarPara(destino)) {
            throw ApiException.conflito("Não é possível mudar de " + rotulo(s.getStatus()) + " para " + rotulo(destino));
        }
        if (destino == StatusSolicitacao.RECUSADA) {
            s.propostaEmAberto().ifPresent(p -> p.setStatus(StatusProposta.RECUSADA));
        }
        s.setStatus(destino);
        repository.saveAndFlush(s);
        return detalhe(s);
    }

    /** Envia proposta: a solicitação passa para EM_NEGOCIACAO e a proposta aparece no chat. */
    @Transactional
    public SolicitacaoResponse enviarProposta(UsuarioAutenticado usuario, Long id, PropostaRequest req) {
        Solicitacao s = daEmpresa(usuario, id);
        if (!s.getStatus().aceitaProposta()) {
            throw ApiException.conflito("Não é possível enviar proposta para uma solicitação " + rotulo(s.getStatus()));
        }
        if (s.propostaEmAberto().isPresent()) {
            throw ApiException.conflito("Já existe uma proposta aguardando a resposta do cliente");
        }
        s.adicionarProposta(req.valor(), req.descricao().trim());
        s.setStatus(StatusSolicitacao.EM_NEGOCIACAO);
        Solicitacao salva = repository.saveAndFlush(s);
        // o merge devolve cópias gerenciadas: pega a proposta já persistida
        Proposta proposta = salva.getPropostas().get(salva.getPropostas().size() - 1);
        chatService.registrarProposta(salva, proposta);
        return detalhe(salva);
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard(UsuarioAutenticado usuario) {
        Empresa e = empresaService.daUsuario(usuario);
        Instant agora = Instant.now();
        Instant inicio = agora.minus(Duration.ofDays(DIAS_PAINEL));
        Instant inicioAnterior = inicio.minus(Duration.ofDays(DIAS_PAINEL));

        long views = visualizacaoRepository.contarNoPeriodo(e.getId(), inicio, agora);
        long viewsAntes = visualizacaoRepository.contarNoPeriodo(e.getId(), inicioAnterior, inicio);
        long recebidas = repository.contarRecebidas(e.getId(), inicio, agora);
        long recebidasAntes = repository.contarRecebidas(e.getId(), inicioAnterior, inicio);
        long respondidas = repository.contarRespondidas(e.getId(), inicio, agora);
        long canceladas = repository.contarCanceladas(e.getId(), inicio, agora);
        long base = recebidas - canceladas;

        List<Servico> servicos = servicoRepository.listarDaEmpresa(e.getId());
        int ativos = (int) servicos.stream().filter(Servico::isVisivel).count();
        int rascunhos = (int) servicos.stream().filter(Servico::isRascunho).count();

        return new DashboardResponse(DIAS_PAINEL, views, variacao(views, viewsAntes), recebidas,
                variacao(recebidas, recebidasAntes), base > 0 ? (int) Math.round(respondidas * 100.0 / base) : null,
                repository.countByEmpresaIdAndStatus(e.getId(), StatusSolicitacao.PENDENTE), ativos, rascunhos);
    }

    // ------------------------------------------------------------------ ambos

    /** Cliente: as suas. Empresa: as recebidas. {@code status} aceita lista separada por vírgula. */
    @Transactional(readOnly = true)
    public List<SolicitacaoResponse> listarMinhas(UsuarioAutenticado usuario, String status) {
        Set<StatusSolicitacao> filtro = filtroStatus(status);
        List<Solicitacao> lista = usuario.tipo() == TipoUsuario.CLIENTE
                ? repository.listarDoCliente(clienteDe(usuario).getId(), filtro)
                : repository.listarDaEmpresa(empresaService.daUsuario(usuario).getId(), filtro);
        Set<Long> avaliadas = lista.isEmpty() ? Set.of()
                : new java.util.HashSet<>(avaliacaoRepository.solicitacoesAvaliadas(
                        lista.stream().map(Solicitacao::getId).toList()));
        return lista.stream()
                .map(s -> SolicitacaoResponse.resumo(s,
                        s.getPropostas().isEmpty() ? null
                                : PropostaResponse.de(s.getPropostas().get(s.getPropostas().size() - 1)),
                        avaliadas.contains(s.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public SolicitacaoResponse buscar(UsuarioAutenticado usuario, Long id) {
        Solicitacao s = repository.buscarComDetalhes(id)
                .orElseThrow(() -> ApiException.naoEncontrado("Solicitação não encontrada"));
        if (!participa(usuario, s)) {
            throw ApiException.acessoNegado("Você não participa desta solicitação");
        }
        return detalhe(s);
    }

    // ------------------------------------------------------------------ apoio

    private SolicitacaoResponse detalhe(Solicitacao s) {
        Long conversaId = conversaRepository.findBySolicitacaoId(s.getId()).map(Conversa::getId).orElse(null);
        return SolicitacaoResponse.detalhe(s, conversaId, avaliacaoRepository.existsBySolicitacaoId(s.getId()));
    }

    private Cliente clienteDe(UsuarioAutenticado usuario) {
        if (usuario == null || usuario.tipo() != TipoUsuario.CLIENTE) {
            throw ApiException.acessoNegado("Disponível apenas para clientes");
        }
        return clienteRepository.findByUsuarioId(usuario.id())
                .orElseThrow(() -> ApiException.acessoNegado("Disponível apenas para clientes"));
    }

    private Solicitacao doCliente(UsuarioAutenticado usuario, Long id) {
        Cliente c = clienteDe(usuario);
        Solicitacao s = repository.buscarComDetalhes(id)
                .orElseThrow(() -> ApiException.naoEncontrado("Solicitação não encontrada"));
        if (!s.getCliente().getId().equals(c.getId())) {
            throw ApiException.acessoNegado("Você não participa desta solicitação");
        }
        return s;
    }

    private Solicitacao daEmpresa(UsuarioAutenticado usuario, Long id) {
        Empresa e = empresaService.daUsuario(usuario);
        Solicitacao s = repository.buscarComDetalhes(id)
                .orElseThrow(() -> ApiException.naoEncontrado("Solicitação não encontrada"));
        if (!s.getEmpresa().getId().equals(e.getId())) {
            throw ApiException.acessoNegado("Esta solicitação foi enviada para outra empresa");
        }
        return s;
    }

    private static boolean participa(UsuarioAutenticado usuario, Solicitacao s) {
        if (usuario == null) {
            return false;
        }
        return usuario.tipo() == TipoUsuario.CLIENTE
                ? s.getCliente().getUsuario().getId().equals(usuario.id())
                : s.getEmpresa().getUsuario().getId().equals(usuario.id());
    }

    private List<Servico> servicosDaEmpresa(Empresa empresa, List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        Set<Long> unicos = new HashSet<>(ids);
        List<Servico> servicos = servicoRepository.findAllById(unicos);
        boolean validos = servicos.size() == unicos.size()
                && servicos.stream().allMatch(sv -> sv.getEmpresa().getId().equals(empresa.getId()) && sv.isVisivel());
        if (!validos) {
            throw ApiException.campoInvalido("servicoIds", "Escolha serviços oferecidos por esta empresa");
        }
        return servicos;
    }

    static Set<StatusSolicitacao> filtroStatus(String status) {
        if (status == null || status.isBlank()) {
            return EnumSet.allOf(StatusSolicitacao.class);
        }
        try {
            return Arrays.stream(status.split(","))
                    .map(v -> StatusSolicitacao.valueOf(v.trim().toUpperCase(Locale.ROOT)))
                    .collect(Collectors.toCollection(() -> EnumSet.noneOf(StatusSolicitacao.class)));
        } catch (IllegalArgumentException e) {
            throw ApiException.campoInvalido("status", "Status inválido");
        }
    }

    /** Variação percentual arredondada; null quando não há base de comparação. */
    static Integer variacao(long atual, long anterior) {
        if (anterior == 0) {
            return null;
        }
        return (int) Math.round((atual - anterior) * 100.0 / anterior);
    }

    static String rotulo(StatusSolicitacao s) {
        return switch (s) {
            case PENDENTE -> "pendente";
            case EM_ANALISE -> "em análise";
            case EM_NEGOCIACAO -> "em negociação";
            case ACEITA -> "aceita";
            case CONCLUIDA -> "concluída";
            case RECUSADA -> "recusada";
            case CANCELADA -> "cancelada";
        };
    }

}
