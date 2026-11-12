package br.com.syncevents.solicitacao.dto;

/**
 * Indicadores do painel da empresa (tela 11) nos últimos {@code dias} dias, comparados com o período anterior.
 * Variações em % (null quando o período anterior foi zero). Taxa de resposta em % (null sem solicitações).
 */
public record DashboardResponse(
        int dias,
        long visualizacoes,
        Integer variacaoVisualizacoes,
        long solicitacoes,
        Integer variacaoSolicitacoes,
        Integer taxaResposta,
        long pendentes,
        int servicosAtivos,
        int servicosRascunho) {
}
