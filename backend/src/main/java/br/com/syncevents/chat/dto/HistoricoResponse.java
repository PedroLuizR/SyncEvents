package br.com.syncevents.chat.dto;

import java.util.List;

/** Página do histórico em ordem cronológica; {@code temMais} indica que há mensagens mais antigas. */
public record HistoricoResponse(List<MensagemResponse> mensagens, boolean temMais) {
}
