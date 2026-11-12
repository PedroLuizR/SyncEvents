package br.com.syncevents.auth;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import br.com.syncevents.config.AppProperties;
import br.com.syncevents.usuario.TipoUsuario;
import br.com.syncevents.usuario.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final String EMISSOR = "syncevents";

    private final SecretKey chave;
    private final Duration validade;

    public JwtService(AppProperties props) {
        AppProperties.Jwt jwt = props.jwt();
        if (jwt == null || jwt.segredo() == null || jwt.segredo().length() < 32) {
            throw new IllegalStateException("app.jwt.segredo deve ter no mínimo 32 caracteres");
        }
        this.chave = Keys.hmacShaKeyFor(jwt.segredo().getBytes(StandardCharsets.UTF_8));
        this.validade = jwt.validade() != null ? jwt.validade() : Duration.ofDays(7);
    }

    public String gerar(Usuario usuario) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .issuer(EMISSOR)
                .subject(usuario.getId().toString())
                .claim("email", usuario.getEmail())
                .claim("tipo", usuario.getTipo().name())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(validade)))
                .signWith(chave)
                .compact();
    }

    /** Valida o token e devolve o usuário; vazio se inválido ou expirado. */
    public Optional<UsuarioAutenticado> validar(String token) {
        try {
            Claims c = Jwts.parser().verifyWith(chave).requireIssuer(EMISSOR).build()
                    .parseSignedClaims(token).getPayload();
            return Optional.of(new UsuarioAutenticado(
                    Long.valueOf(c.getSubject()),
                    c.get("email", String.class),
                    TipoUsuario.valueOf(c.get("tipo", String.class))));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
