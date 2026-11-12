package br.com.syncevents.busca;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class FiltroBuscaTest {

    @Test
    void separaTermosSemAcentoEIgnoraPalavrasVazias() {
        assertThat(FiltroBusca.termos("  Decoração para CASAMENTO ")).containsExactly("decoracao", "casamento");
        assertThat(FiltroBusca.termos("som e luz")).containsExactly("som", "luz");
        assertThat(FiltroBusca.termos("")).isEmpty();
        assertThat(FiltroBusca.termos(null)).isEmpty();
    }

    @Test
    void normalizaCidadeEPaginacao() {
        FiltroBusca f = FiltroBusca.de(null, 1L, "São Paulo, SP", "preco", -3, 500);
        assertThat(f.cidade()).isEqualTo("sao paulo");
        assertThat(f.pagina()).isZero();
        assertThat(f.tamanho()).isEqualTo(FiltroBusca.TAMANHO_MAXIMO);
        assertThat(f.ordenacao()).isEqualTo(OrdenacaoBusca.PRECO);
    }

    @Test
    void ordenacaoDesconhecidaViraRelevancia() {
        assertThat(OrdenacaoBusca.de("qualquer")).isEqualTo(OrdenacaoBusca.RELEVANCIA);
        assertThat(OrdenacaoBusca.de(null)).isEqualTo(OrdenacaoBusca.RELEVANCIA);
    }
}
