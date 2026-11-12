package br.com.syncevents.common;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Formato padrão de erro da API:
 * {@code { "status": 400, "erro": "VALIDACAO", "mensagem": "Dados inválidos", "campos": {...} }}
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErro(int status, String erro, String mensagem, Map<String, String> campos) {

    public static ApiErro de(int status, String erro, String mensagem) {
        return new ApiErro(status, erro, mensagem, null);
    }
}
