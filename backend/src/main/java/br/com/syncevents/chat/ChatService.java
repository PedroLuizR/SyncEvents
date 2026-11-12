package br.com.syncevents.chat;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.chat.dto.ConversaResponse;
import br.com.syncevents.chat.dto.HistoricoResponse;
import br.com.syncevents.chat.dto.MensagemResponse;
import br.com.syncevents.cliente.ClienteRepository;
import br.com.syncevents.common.ApiException;
import br.com.syncevents.empresa.EmpresaRepository;
import br.com.syncevents.solicitacao.Proposta;
import br.com.syncevents.solicitacao.Solicitacao;
import br.com.syncevents.usuario.TipoUsuario;

@Service
public class ChatService {

    static final int TAMANHO_PADRAO = 30;
    static final int TAMANHO_MAXIMO = 100;

    private final ConversaRepository conversaRepository;
    private final MensagemRepository mensagemRepository;
    private final ClienteRepository clienteRepository;
    private final EmpresaRepository empresaRepository;
    private final SimpMessagingTemplate broker;

    public ChatService(ConversaRepository conversaRepository, MensagemRepository mensagemRepository,
            ClienteRepository clienteRepository, EmpresaRepository empresaRepository, SimpMessagingTemplate broker) {
        this.conversaRepository = conversaRepository;
        this.mensagemRepository = mensagemRepository;
        this.clienteRepository = clienteRepository;
        this.empresaRepository = empresaRepository;
        this.broker = broker;
    }

    public static String topico(Long conversaId) {
        return "/topic/conversas/" + conversaId;
    }

    @Transactional(readOnly = true)
    public List<ConversaResponse> listar(UsuarioAutenticado usuario) {
        List<Conversa> conversas = usuario.tipo() == TipoUsuario.CLIENTE
                ? clienteRepository.findByUsuarioId(usuario.id()).map(c -> conversaRepository.doCliente(c.getId()))
                        .orElse(List.of())
                : empresaRepository.findByUsuarioId(usuario.id()).map(e -> conversaRepository.daEmpresa(e.getId()))
                        .orElse(List.of());
        List<ConversaResponse> lista = new ArrayList<>(conversas.stream().map(c -> resposta(usuario, c)).toList());
        // conversas com mensagem mais recente primeiro
        lista.sort(Comparator.comparing((ConversaResponse r) -> r.ultimaMensagem() == null ? Instant.EPOCH
                : r.ultimaMensagem().enviadaEm()).reversed());
        return lista;
    }

    @Transactional(readOnly = true)
    public ConversaResponse buscar(UsuarioAutenticado usuario, Long id) {
        return resposta(usuario, daParticipante(usuario, id));
    }

    @Transactional(readOnly = true)
    public HistoricoResponse historico(UsuarioAutenticado usuario, Long id, Long antesDe, Integer tamanho) {
        daParticipante(usuario, id);
        int t = tamanho == null || tamanho < 1 ? TAMANHO_PADRAO : Math.min(tamanho, TAMANHO_MAXIMO);
        List<Mensagem> pagina = mensagemRepository.historico(id, antesDe, PageRequest.of(0, t + 1));
        boolean temMais = pagina.size() > t;
        List<MensagemResponse> mensagens = new ArrayList<>(
                pagina.stream().limit(t).map(MensagemResponse::de).toList());
        Collections.reverse(mensagens);
        return new HistoricoResponse(mensagens, temMais);
    }

    /** Envia texto (REST ou STOMP) e publica no tópico da conversa depois do commit. */
    @Transactional
    public MensagemResponse enviarTexto(UsuarioAutenticado usuario, Long id, String conteudo) {
        Conversa conversa = daParticipante(usuario, id);
        String texto = conteudo == null ? "" : conteudo.trim();
        if (texto.isEmpty()) {
            throw ApiException.campoInvalido("conteudo", "Escreva uma mensagem");
        }
        if (texto.length() > 2000) {
            throw ApiException.campoInvalido("conteudo", "Mensagem muito longa");
        }
        Mensagem m = mensagemRepository.save(new Mensagem(conversa, usuario.id(), TipoMensagem.TEXTO, texto, null));
        MensagemResponse resposta = MensagemResponse.de(m);
        publicarDepoisDoCommit(resposta);
        return resposta;
    }

    /** Chamado pelo fluxo de orçamento: a proposta vira uma mensagem do tipo PROPOSTA no chat. */
    @Transactional
    public void registrarProposta(Solicitacao s, Proposta proposta) {
        conversaRepository.findBySolicitacaoId(s.getId()).ifPresent(conversa -> {
            Mensagem m = mensagemRepository.save(new Mensagem(conversa, s.getEmpresa().getUsuario().getId(),
                    TipoMensagem.PROPOSTA, proposta.getDescricao(), proposta));
            publicarDepoisDoCommit(MensagemResponse.de(m));
        });
    }

    /** Proposta aceita/recusada: republica a mensagem para o card mudar de status nos dois lados. */
    @Transactional
    public void propostaAtualizada(Proposta proposta) {
        mensagemRepository.findFirstByPropostaId(proposta.getId())
                .ifPresent(m -> publicarDepoisDoCommit(MensagemResponse.de(m)));
    }

    @Transactional
    public int marcarComoLidas(UsuarioAutenticado usuario, Long id) {
        daParticipante(usuario, id);
        return mensagemRepository.marcarComoLidas(id, usuario.id());
    }

    /** 404 se a conversa não existe; 403 se o usuário não participa. */
    @Transactional(readOnly = true)
    public Conversa daParticipante(UsuarioAutenticado usuario, Long id) {
        Conversa c = conversaRepository.buscarComParticipantes(id)
                .orElseThrow(() -> ApiException.naoEncontrado("Conversa não encontrada"));
        if (!participa(usuario, c)) {
            throw ApiException.acessoNegado("Você não participa desta conversa");
        }
        return c;
    }

    public boolean participa(UsuarioAutenticado usuario, Conversa c) {
        if (usuario == null) {
            return false;
        }
        Solicitacao s = c.getSolicitacao();
        return usuario.tipo() == TipoUsuario.CLIENTE
                ? s.getCliente().getUsuario().getId().equals(usuario.id())
                : s.getEmpresa().getUsuario().getId().equals(usuario.id());
    }

    private ConversaResponse resposta(UsuarioAutenticado usuario, Conversa c) {
        Solicitacao s = c.getSolicitacao();
        boolean cliente = usuario.tipo() == TipoUsuario.CLIENTE;
        var contato = cliente
                ? new ConversaResponse.Contato(s.getEmpresa().getId(), s.getEmpresa().getNomeFantasia(),
                        s.getEmpresa().getLogoUrl(), s.getEmpresa().getCidade())
                : new ConversaResponse.Contato(s.getCliente().getId(), s.getCliente().getNome(),
                        s.getCliente().getFotoUrl(), s.getCliente().getCidade());
        MensagemResponse ultima = mensagemRepository.findFirstByConversaIdOrderByIdDesc(c.getId())
                .map(MensagemResponse::de).orElse(null);
        return new ConversaResponse(c.getId(), s.getId(), contato, s.getStatus(), s.getTipoEvento(),
                s.getDataEvento(), s.getQtdConvidados(), s.getLocal(), ultima,
                mensagemRepository.contarNaoLidas(c.getId(), usuario.id()), usuario.id());
    }

    private void publicarDepoisDoCommit(MensagemResponse m) {
        Runnable publicar = () -> broker.convertAndSend(topico(m.conversaId()), m);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    publicar.run();
                }
            });
        } else {
            publicar.run();
        }
    }
}
