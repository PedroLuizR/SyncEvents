package br.com.syncevents.auth.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import br.com.syncevents.common.TipoEvento;
import br.com.syncevents.common.validacao.NomePessoa;
import br.com.syncevents.common.validacao.SenhaForte;
import br.com.syncevents.common.validacao.Telefone;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Cadastro de cliente (multipart/form-data).
 * Etapa 1: nome, e-mail, celular, cidade, senha, interesses, aceite.
 * Etapa 2 (opcional): CPF (sem validação) e foto.
 */
public record CadastroClienteRequest(
        @NotBlank(message = "Informe seu nome completo") @Size(max = 120, message = "Nome muito longo") @NomePessoa String nome,
        @NotBlank(message = "Informe seu e-mail") @Email(message = "E-mail inválido") @Size(max = 255) String email,
        @NotBlank(message = "Informe seu celular") @Telefone String telefone,
        @NotBlank(message = "Informe sua cidade") @Size(max = 120, message = "Cidade muito longa") String cidade,
        @NotBlank(message = "Crie uma senha") @Size(max = 72, message = "Senha muito longa") @SenhaForte String senha,
        List<TipoEvento> interesses,
        @NotNull(message = "Aceite os Termos de Uso para continuar") @AssertTrue(message = "Aceite os Termos de Uso para continuar") Boolean aceiteTermos,
        @Size(max = 14, message = "CPF muito longo") String cpf,
        MultipartFile foto) {
}
