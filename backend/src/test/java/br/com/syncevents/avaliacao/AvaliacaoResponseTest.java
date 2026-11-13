package br.com.syncevents.avaliacao;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import br.com.syncevents.avaliacao.dto.AvaliacaoResponse;

class AvaliacaoResponseTest {

    @Test
    void nomePublicoMostraSoAInicialDoSobrenome() throws Exception {
        var m = AvaliacaoResponse.class.getDeclaredMethod("nomePublico", String.class);
        m.setAccessible(true);
        assertThat(m.invoke(null, "Marina Alves")).isEqualTo("Marina A.");
        assertThat(m.invoke(null, "João da Silva Santos")).isEqualTo("João S.");
        assertThat(m.invoke(null, "Ana")).isEqualTo("Ana");
    }
}
