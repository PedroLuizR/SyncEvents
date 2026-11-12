package br.com.syncevents.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnviarMensagemRequest(
        @NotBlank(message = "Escreva uma mensagem") @Size(max = 2000, message = "Mensagem muito longa") String conteudo) {
}
