package br.com.syncevents.solicitacao.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PropostaRequest(
        @NotNull(message = "Informe o valor") @DecimalMin(value = "0.01", message = "Informe o valor") @Digits(integer = 10, fraction = 2, message = "Valor inválido") BigDecimal valor,
        @NotBlank(message = "Descreva o que está incluso") @Size(max = 2000, message = "Descrição muito longa") String descricao) {
}
