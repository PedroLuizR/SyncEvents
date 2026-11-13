package br.com.syncevents.avaliacao.dto;

import java.util.List;

import br.com.syncevents.avaliacao.Destaque;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** ID11: avaliação de um evento concluído. */
public record AvaliacaoRequest(
        @NotNull(message = "Informe a solicitação") Long solicitacaoId,
        @NotNull(message = "Escolha uma nota de 1 a 5") @Min(value = 1, message = "Escolha uma nota de 1 a 5") @Max(value = 5, message = "Escolha uma nota de 1 a 5") Integer nota,
        @Size(max = 1000, message = "Comentário muito longo") String comentario,
        List<Destaque> destaques) {
}
