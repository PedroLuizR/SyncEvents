package br.com.syncevents.solicitacao;

import static br.com.syncevents.solicitacao.StatusSolicitacao.ACEITA;
import static br.com.syncevents.solicitacao.StatusSolicitacao.CANCELADA;
import static br.com.syncevents.solicitacao.StatusSolicitacao.CONCLUIDA;
import static br.com.syncevents.solicitacao.StatusSolicitacao.EM_ANALISE;
import static br.com.syncevents.solicitacao.StatusSolicitacao.EM_NEGOCIACAO;
import static br.com.syncevents.solicitacao.StatusSolicitacao.PENDENTE;
import static br.com.syncevents.solicitacao.StatusSolicitacao.RECUSADA;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.EnumSet;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class StatusSolicitacaoTest {

    @Test
    void transicoesValidasDaEmpresa() {
        assertThat(PENDENTE.empresaPodeMudarPara(EM_ANALISE)).isTrue();
        assertThat(PENDENTE.empresaPodeMudarPara(RECUSADA)).isTrue();
        assertThat(EM_ANALISE.empresaPodeMudarPara(RECUSADA)).isTrue();
        assertThat(EM_NEGOCIACAO.empresaPodeMudarPara(RECUSADA)).isTrue();
        assertThat(ACEITA.empresaPodeMudarPara(CONCLUIDA)).isTrue();
    }

    @Test
    void transicoesInvalidasDaEmpresa() {
        assertThat(PENDENTE.empresaPodeMudarPara(CONCLUIDA)).isFalse();
        assertThat(PENDENTE.empresaPodeMudarPara(ACEITA)).isFalse();
        assertThat(PENDENTE.empresaPodeMudarPara(EM_NEGOCIACAO)).as("só via proposta").isFalse();
        assertThat(EM_ANALISE.empresaPodeMudarPara(PENDENTE)).isFalse();
        assertThat(ACEITA.empresaPodeMudarPara(RECUSADA)).isFalse();
        for (StatusSolicitacao destino : StatusSolicitacao.values()) {
            assertThat(CONCLUIDA.empresaPodeMudarPara(destino)).isFalse();
            assertThat(RECUSADA.empresaPodeMudarPara(destino)).isFalse();
            assertThat(CANCELADA.empresaPodeMudarPara(destino)).isFalse();
        }
    }

    @ParameterizedTest
    @EnumSource(StatusSolicitacao.class)
    void propostaECancelamentoSoComNegociacaoAberta(StatusSolicitacao s) {
        Set<StatusSolicitacao> abertas = EnumSet.of(PENDENTE, EM_ANALISE, EM_NEGOCIACAO);
        assertThat(s.aceitaProposta()).isEqualTo(abertas.contains(s));
        assertThat(s.clientePodeCancelar()).isEqualTo(abertas.contains(s));
        assertThat(s.finalizada()).isEqualTo(EnumSet.of(CONCLUIDA, RECUSADA, CANCELADA).contains(s));
    }

    @Test
    void variacaoPercentual() {
        assertThat(SolicitacaoService.variacao(118, 100)).isEqualTo(18);
        assertThat(SolicitacaoService.variacao(50, 100)).isEqualTo(-50);
        assertThat(SolicitacaoService.variacao(5, 0)).isNull();
    }

    @Test
    void filtroDeStatusPorVirgula() {
        assertThat(SolicitacaoService.filtroStatus("pendente, EM_ANALISE")).containsExactlyInAnyOrder(PENDENTE, EM_ANALISE);
        assertThat(SolicitacaoService.filtroStatus(null)).hasSize(StatusSolicitacao.values().length);
    }
}
