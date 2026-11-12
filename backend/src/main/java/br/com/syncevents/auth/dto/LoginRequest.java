package br.com.syncevents.auth.dto;

import br.com.syncevents.usuario.TipoUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** {@code login} aceita e-mail; para {@code tipo=EMPRESA}, também aceita CNPJ. */
public record LoginRequest(
        @NotBlank(message = "Informe seu e-mail") String login,
        @NotBlank(message = "Informe sua senha") String senha,
        @NotNull(message = "Informe o tipo de conta") TipoUsuario tipo) {
}
