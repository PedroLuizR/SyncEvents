package br.com.syncevents.servico.dto;

import java.math.BigDecimal;
import java.util.List;

import br.com.syncevents.servico.ModeloPreco;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Criação/edição de serviço. Com {@code rascunho = true} só nome e categoria são exigidos;
 * para publicar, a descrição e o preço (conforme o modelo) também são obrigatórios.
 */
public record ServicoRequest(
        @NotBlank(message = "Informe o nome do serviço") @Size(max = 120, message = "Nome muito longo") String nome,
        @NotNull(message = "Escolha a categoria") Long categoriaId,
        @Size(max = 2000, message = "Descrição muito longa") String descricao,
        ModeloPreco modeloPreco,
        @DecimalMin(value = "0.00", message = "Valor inválido") @Digits(integer = 10, fraction = 2, message = "Valor inválido") BigDecimal precoMin,
        @DecimalMin(value = "0.00", message = "Valor inválido") @Digits(integer = 10, fraction = 2, message = "Valor inválido") BigDecimal precoMax,
        Boolean ativo,
        Boolean rascunho,
        @Size(max = 30, message = "No máximo 30 itens") List<@Size(max = 200, message = "Item muito longo") String> itensInclusos) {
}
