package br.com.syncevents.chat;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.chat.dto.ConversaResponse;
import br.com.syncevents.chat.dto.EnviarMensagemRequest;
import br.com.syncevents.chat.dto.HistoricoResponse;
import br.com.syncevents.chat.dto.MensagemResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/conversas")
@Tag(name = "Chat")
public class ChatController {

    private final ChatService service;

    public ChatController(ChatService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "ID09: conversas do usuário, com última mensagem e não lidas")
    public List<ConversaResponse> listar(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.listar(usuario);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Cabeçalho da conversa (contato e contexto do orçamento)")
    public ConversaResponse buscar(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id) {
        return service.buscar(usuario, id);
    }

    @GetMapping("/{id}/mensagens")
    @Operation(summary = "Histórico paginado (antesDe = id da mensagem mais antiga que o app já tem)")
    public HistoricoResponse historico(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id,
            @RequestParam(required = false) Long antesDe, @RequestParam(required = false) Integer size) {
        return service.historico(usuario, id, antesDe, size);
    }

    @PostMapping("/{id}/mensagens")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Envia mensagem (fallback REST quando o WebSocket não está conectado)")
    public MensagemResponse enviar(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id,
            @Valid @RequestBody EnviarMensagemRequest req) {
        return service.enviarTexto(usuario, id, req.conteudo());
    }

    @PatchMapping("/{id}/lidas")
    @Operation(summary = "Marca como lidas as mensagens recebidas nesta conversa")
    public Map<String, Integer> lidas(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id) {
        return Map.of("marcadas", service.marcarComoLidas(usuario, id));
    }

    /** STOMP: o app envia para /app/conversas/{id}; o resultado sai em /topic/conversas/{id}. */
    @MessageMapping("/conversas/{id}")
    public void enviarPorWebSocket(@DestinationVariable Long id, @Payload EnviarMensagemRequest req, Principal principal) {
        service.enviarTexto(usuarioDe(principal), id, req.conteudo());
    }

    static UsuarioAutenticado usuarioDe(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken t
                && t.getPrincipal() instanceof UsuarioAutenticado u) {
            return u;
        }
        throw new org.springframework.security.access.AccessDeniedException("Não autenticado");
    }
}
