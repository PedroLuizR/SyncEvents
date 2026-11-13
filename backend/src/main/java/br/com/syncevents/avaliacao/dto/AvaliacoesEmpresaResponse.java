package br.com.syncevents.avaliacao.dto;

import br.com.syncevents.common.Pagina;

public record AvaliacoesEmpresaResponse(ResumoAvaliacoes resumo, Pagina<AvaliacaoResponse> avaliacoes) {
}
