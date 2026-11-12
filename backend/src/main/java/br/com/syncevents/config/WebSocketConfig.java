package br.com.syncevents.config;

import java.util.List;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import br.com.syncevents.auth.JwtService;
import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.chat.ChatService;
import br.com.syncevents.common.ApiException;

/**
 * Chat em tempo real: STOMP sobre WebSocket em /ws.
 * <ul>
 * <li>CONNECT exige {@code Authorization: Bearer <jwt>} no cabeçalho STOMP;</li>
 * <li>SUBSCRIBE em /topic/conversas/{id} e SEND em /app/conversas/{id} só para participantes.</li>
 * </ul>
 */
@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final String PREFIXO_TOPICO = "/topic/conversas/";
    private static final String PREFIXO_APP = "/app/conversas/";

    private final JwtService jwtService;
    private final ChatService chatService;
    private final AppProperties props;

    /** {@code @Lazy}: o ChatService depende do broker que esta configuração cria. */
    public WebSocketConfig(JwtService jwtService, @Lazy ChatService chatService, AppProperties props) {
        this.jwtService = jwtService;
        this.chatService = chatService;
        this.props = props;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        List<String> origens = props.cors() != null && props.cors().allowedOrigins() != null
                ? props.cors().allowedOrigins()
                : List.of();
        // apps nativos não mandam Origin; o navegador (web/Expo) precisa estar na lista de CORS
        registry.addEndpoint("/ws").setAllowedOriginPatterns(origens.toArray(String[]::new));
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic").setHeartbeatValue(new long[] {10000, 10000})
                .setTaskScheduler(taskScheduler());
    }

    private org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler taskScheduler() {
        var ts = new org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler();
        ts.setPoolSize(1);
        ts.setThreadNamePrefix("ws-heartbeat-");
        ts.initialize();
        return ts;
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (acc == null || acc.getCommand() == null) {
                    return message;
                }
                if (acc.getCommand() == StompCommand.CONNECT) {
                    String header = acc.getFirstNativeHeader("Authorization");
                    String token = header != null && header.startsWith("Bearer ") ? header.substring(7).trim() : null;
                    UsuarioAutenticado u = token == null ? null : jwtService.validar(token).orElse(null);
                    if (u == null) {
                        throw new MessageDeliveryException("Token inválido ou ausente");
                    }
                    acc.setUser(new UsernamePasswordAuthenticationToken(u, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + u.tipo().name()))));
                } else if (acc.getCommand() == StompCommand.SUBSCRIBE) {
                    verificar(acc, acc.getDestination(), PREFIXO_TOPICO);
                } else if (acc.getCommand() == StompCommand.SEND) {
                    verificar(acc, acc.getDestination(), PREFIXO_APP);
                }
                return message;
            }
        });
    }

    private void verificar(StompHeaderAccessor acc, String destino, String prefixo) {
        if (destino == null || !destino.startsWith(prefixo)) {
            throw new MessageDeliveryException("Destino não permitido: " + destino);
        }
        Long conversaId;
        try {
            conversaId = Long.valueOf(destino.substring(prefixo.length()));
        } catch (NumberFormatException e) {
            throw new MessageDeliveryException("Destino inválido");
        }
        UsuarioAutenticado u = acc.getUser() instanceof UsernamePasswordAuthenticationToken t
                && t.getPrincipal() instanceof UsuarioAutenticado ua ? ua : null;
        try {
            chatService.daParticipante(u, conversaId);
        } catch (ApiException e) {
            throw new MessageDeliveryException("Acesso negado à conversa " + conversaId);
        }
    }
}
