package br.com.syncevents.solicitacao.dto;

import br.com.syncevents.solicitacao.StatusSolicitacao;
import jakarta.validation.constraints.NotNull;

public record StatusRequest(@NotNull(message = "Informe o novo status") StatusSolicitacao status) {
}
