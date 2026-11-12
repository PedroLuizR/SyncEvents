package br.com.syncevents.solicitacao.dto;

import java.math.BigDecimal;
import java.time.Instant;

import br.com.syncevents.solicitacao.Proposta;
import br.com.syncevents.solicitacao.StatusProposta;

public record PropostaResponse(Long id, BigDecimal valor, String descricao, StatusProposta status, Instant criadoEm) {

    public static PropostaResponse de(Proposta p) {
        return new PropostaResponse(p.getId(), p.getValor(), p.getDescricao(), p.getStatus(), p.getCriadoEm());
    }
}
