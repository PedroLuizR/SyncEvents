package br.com.syncevents.auth.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import br.com.syncevents.common.validacao.Cnpj;
import br.com.syncevents.common.validacao.SenhaForte;
import br.com.syncevents.common.validacao.Telefone;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Cadastro de empresa (multipart/form-data).
 * Etapa 1: logo (opcional), nome fantasia, CNPJ, e-mail comercial, telefone (WhatsApp), cidade, categorias, sobre.
 * Etapa 2: senha, endereço (opcional, sem verificação) e aceite.
 */
public record CadastroEmpresaRequest(
        @NotBlank(message = "Informe o nome fantasia") @Size(max = 120, message = "Nome muito longo") String nomeFantasia,
        @NotBlank(message = "Informe o CNPJ") @Cnpj String cnpj,
        @NotBlank(message = "Informe o e-mail comercial") @Email(message = "E-mail inválido") @Size(max = 255) String email,
        @NotBlank(message = "Informe o telefone") @Telefone String telefone,
        @NotBlank(message = "Informe a cidade") @Size(max = 120, message = "Cidade muito longa") String cidade,
        @NotEmpty(message = "Escolha ao menos uma categoria") List<Long> categoriaIds,
        @Size(max = 2000, message = "Descrição muito longa") String descricao,
        @Size(max = 255, message = "Endereço muito longo") String endereco,
        @NotBlank(message = "Crie uma senha") @Size(max = 72, message = "Senha muito longa") @SenhaForte String senha,
        @NotNull(message = "Aceite os Termos de Uso para continuar") @AssertTrue(message = "Aceite os Termos de Uso para continuar") Boolean aceiteTermos,
        MultipartFile logo) {
}
