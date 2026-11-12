package br.com.syncevents.chat.dto;

import java.time.LocalDate;

import br.com.syncevents.common.TipoEvento;
import br.com.syncevents.solicitacao.StatusSolicitacao;

/**
 * Conversa vista por um dos participantes. {@code contato} é a outra parte (empresa para o cliente,
 * cliente para a empresa).
 */
public record ConversaResponse(
        Long id,
        Long solicitacaoId,
        Contato contato,
        StatusSolicitacao status,
        TipoEvento tipoEvento,
        LocalDate dataEvento,
        int qtdConvidados,
        String local,
        MensagemResponse ultimaMensagem,
        long naoLidas,
        /** id de usuário de quem está vendo, para o app saber quais mensagens são "minhas". */
        Long meuUsuarioId) {

    public record Contato(Long id, String nome, String fotoUrl, String cidade) {
    }
}
