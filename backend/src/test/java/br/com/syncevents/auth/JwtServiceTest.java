package br.com.syncevents.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import br.com.syncevents.config.AppProperties;
import br.com.syncevents.usuario.TipoUsuario;
import br.com.syncevents.usuario.Usuario;

class JwtServiceTest {

    static AppProperties props(String segredo, Duration validade) {
        return new AppProperties(null, null, new AppProperties.Jwt(segredo, validade));
    }

    static Usuario usuario(long id, TipoUsuario tipo) {
        Usuario u = new Usuario("ana@teste.com", "hash", tipo);
        ReflectionTestUtils.setField(u, "id", id);
        return u;
    }

    JwtService service = new JwtService(props("segredo-de-teste-com-mais-de-32-caracteres", Duration.ofHours(1)));

    @Test
    void geraEValidaToken() {
        String token = service.gerar(usuario(7L, TipoUsuario.EMPRESA));
        assertThat(service.validar(token)).contains(new UsuarioAutenticado(7L, "ana@teste.com", TipoUsuario.EMPRESA));
    }

    @Test
    void rejeitaTokenAdulteradoOuDeOutraChave() {
        String token = service.gerar(usuario(7L, TipoUsuario.CLIENTE));
        var outro = new JwtService(props("outro-segredo-diferente-com-mais-de-32-chars", Duration.ofHours(1)));
        assertThat(outro.validar(token)).isEmpty();
        assertThat(service.validar(token + "x")).isEmpty();
        assertThat(service.validar("lixo")).isEmpty();
    }

    @Test
    void rejeitaTokenExpirado() {
        var expirado = new JwtService(props("segredo-de-teste-com-mais-de-32-caracteres", Duration.ofSeconds(-5)));
        assertThat(service.validar(expirado.gerar(usuario(1L, TipoUsuario.CLIENTE)))).isEmpty();
    }

    @Test
    void exigeSegredoLongo() {
        assertThatThrownBy(() -> new JwtService(props("curto", null))).isInstanceOf(IllegalStateException.class);
    }
}
