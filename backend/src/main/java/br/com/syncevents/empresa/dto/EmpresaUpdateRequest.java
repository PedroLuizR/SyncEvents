package br.com.syncevents.empresa.dto;

import java.util.List;

import br.com.syncevents.common.validacao.Telefone;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

/** Edição do perfil (ID04). E-mail e CNPJ não são editáveis. */
public record EmpresaUpdateRequest(
        @NotBlank(message = "Informe o nome fantasia") @Size(max = 120, message = "Nome muito longo") String nomeFantasia,
        @NotBlank(message = "Informe o telefone") @Telefone String telefone,
        @NotBlank(message = "Informe a cidade") @Size(max = 120, message = "Cidade muito longa") String cidade,
        @Size(max = 255, message = "Endereço muito longo") String endereco,
        @Size(max = 2000, message = "Descrição muito longa") String descricao,
        @NotEmpty(message = "Escolha ao menos uma categoria") List<Long> categoriaIds) {
}
