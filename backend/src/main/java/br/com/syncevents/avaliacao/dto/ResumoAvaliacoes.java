package br.com.syncevents.avaliacao.dto;

import java.math.BigDecimal;

/**
 * Média (1 casa decimal), total e % que recomendam (nota 4 ou 5).
 * Sem avaliações: média e recomendam nulos.
 */
public record ResumoAvaliacoes(BigDecimal media, long total, Integer recomendam) {
}
