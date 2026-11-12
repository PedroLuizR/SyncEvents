package br.com.syncevents.solicitacao.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import br.com.syncevents.common.TipoEvento;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** ID08: pedido de orçamento do cliente para uma empresa. */
public record SolicitacaoRequest(
        @NotNull(message = "Informe a empresa") Long empresaId,
        @NotNull(message = "Escolha o tipo de evento") TipoEvento tipoEvento,
        @NotNull(message = "Informe a data do evento") @FutureOrPresent(message = "A data do evento não pode estar no passado") LocalDate dataEvento,
        @NotNull(message = "Informe o número de convidados") @Min(value = 1, message = "Informe ao menos 1 convidado") @Max(value = 100000, message = "Número de convidados muito alto") Integer qtdConvidados,
        @NotBlank(message = "Informe o local do evento") @Size(max = 200, message = "Local muito longo") String local,
        List<Long> servicoIds,
        @DecimalMin(value = "0.00", message = "Valor inválido") @Digits(integer = 10, fraction = 2, message = "Valor inválido") BigDecimal orcamentoMin,
        @DecimalMin(value = "0.00", message = "Valor inválido") @Digits(integer = 10, fraction = 2, message = "Valor inválido") BigDecimal orcamentoMax,
        @Size(max = 2000, message = "Mensagem muito longa") String mensagem,
        @NotNull(message = "Autorize o contato da empresa") @AssertTrue(message = "Autorize o contato da empresa para enviar") Boolean aceiteContato) {
}
