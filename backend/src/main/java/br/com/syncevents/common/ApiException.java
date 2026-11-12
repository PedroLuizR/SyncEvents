package br.com.syncevents.common;

import java.util.Map;

import org.springframework.http.HttpStatus;

/** Exceção base de negócio, convertida em {@link ApiErro} pelo handler global. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String codigo;
    private final transient Map<String, String> campos;

    public ApiException(HttpStatus status, String codigo, String mensagem) {
        this(status, codigo, mensagem, null);
    }

    public ApiException(HttpStatus status, String codigo, String mensagem, Map<String, String> campos) {
        super(mensagem);
        this.status = status;
        this.codigo = codigo;
        this.campos = campos;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCodigo() {
        return codigo;
    }

    public Map<String, String> getCampos() {
        return campos;
    }

    /** 404: recurso inexistente (ou de outra pessoa, para não vazar existência). */
    public static ApiException naoEncontrado(String mensagem) {
        return new ApiException(HttpStatus.NOT_FOUND, "NAO_ENCONTRADO", mensagem);
    }

    /** 403: o usuário não tem permissão sobre o recurso. */
    public static ApiException acessoNegado(String mensagem) {
        return new ApiException(HttpStatus.FORBIDDEN, "ACESSO_NEGADO", mensagem);
    }

    /** 409: conflito de estado (ex.: transição de status inválida). */
    public static ApiException conflito(String mensagem) {
        return new ApiException(HttpStatus.CONFLICT, "CONFLITO", mensagem);
    }

    /** 400 com erro em um campo específico (ex.: e-mail já cadastrado). */
    public static ApiException campoInvalido(String campo, String mensagem) {
        return new ApiException(HttpStatus.BAD_REQUEST, "VALIDACAO", "Dados inválidos", Map.of(campo, mensagem));
    }
}
