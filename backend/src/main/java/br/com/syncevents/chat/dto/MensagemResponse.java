package br.com.syncevents.chat.dto;

import java.time.Instant;

import br.com.syncevents.chat.Mensagem;
import br.com.syncevents.chat.TipoMensagem;
import br.com.syncevents.solicitacao.dto.PropostaResponse;

/**
 * Mensagem do chat. É também o que trafega no tópico STOMP {@code /topic/conversas/{id}}:
 * o app faz "upsert" pelo id (uma proposta respondida chega de novo com o status novo).
 */
public record MensagemResponse(
        Long id,
        Long conversaId,
        Long remetenteUsuarioId,
        TipoMensagem tipo,
        String conteudo,
        PropostaResponse proposta,
        boolean lida,
        Instant enviadaEm) {

    public static MensagemResponse de(Mensagem m) {
        return new MensagemResponse(m.getId(), m.getConversa().getId(), m.getRemetenteUsuarioId(), m.getTipo(),
                m.getConteudo(), m.getProposta() == null ? null : PropostaResponse.de(m.getProposta()), m.isLida(),
                m.getEnviadaEm());
    }
}
