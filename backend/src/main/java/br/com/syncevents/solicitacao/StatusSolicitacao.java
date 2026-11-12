package br.com.syncevents.solicitacao;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Máquina de estados da solicitação de orçamento.
 *
 * <pre>
 * PENDENTE ─► EM_ANALISE ─► EM_NEGOCIACAO (proposta enviada) ─► ACEITA ─► CONCLUIDA
 *     └───────────┴──────────────┴──► RECUSADA (pela empresa)
 *     └───────────┴──────────────┴──► CANCELADA (pelo cliente, antes de ACEITA)
 * </pre>
 */
public enum StatusSolicitacao {
    PENDENTE,
    EM_ANALISE,
    EM_NEGOCIACAO,
    ACEITA,
    CONCLUIDA,
    RECUSADA,
    CANCELADA;

    /** Transições que a empresa faz diretamente (PATCH /status). */
    private static final Map<StatusSolicitacao, Set<StatusSolicitacao>> PELA_EMPRESA = Map.of(
            PENDENTE, EnumSet.of(EM_ANALISE, RECUSADA),
            EM_ANALISE, EnumSet.of(RECUSADA),
            EM_NEGOCIACAO, EnumSet.of(RECUSADA),
            ACEITA, EnumSet.of(CONCLUIDA));

    public boolean empresaPodeMudarPara(StatusSolicitacao destino) {
        return PELA_EMPRESA.getOrDefault(this, Set.of()).contains(destino);
    }

    /** A empresa pode enviar proposta enquanto a negociação está aberta. */
    public boolean aceitaProposta() {
        return this == PENDENTE || this == EM_ANALISE || this == EM_NEGOCIACAO;
    }

    /** O cliente pode cancelar antes de aceitar uma proposta. */
    public boolean clientePodeCancelar() {
        return this == PENDENTE || this == EM_ANALISE || this == EM_NEGOCIACAO;
    }

    public boolean finalizada() {
        return this == CONCLUIDA || this == RECUSADA || this == CANCELADA;
    }
}
