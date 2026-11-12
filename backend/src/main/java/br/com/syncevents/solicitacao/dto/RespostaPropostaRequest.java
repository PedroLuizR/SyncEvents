package br.com.syncevents.solicitacao.dto;

import br.com.syncevents.solicitacao.StatusProposta;
import jakarta.validation.constraints.NotNull;

/** Resposta do cliente: ACEITA ou RECUSADA. */
public record RespostaPropostaRequest(@NotNull(message = "Informe a resposta") StatusProposta status) {
}
