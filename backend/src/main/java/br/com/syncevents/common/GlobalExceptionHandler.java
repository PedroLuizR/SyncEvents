package br.com.syncevents.common;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.validation.ConstraintViolationException;

/** Converte qualquer exceção no formato {@link ApiErro}. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErro> handleApi(ApiException ex) {
        return resposta(ex.getStatus(), new ApiErro(ex.getStatus().value(), ex.getCodigo(), ex.getMessage(), ex.getCampos()));
    }

    /** Cobre @Valid em @RequestBody (MethodArgumentNotValidException) e em @ModelAttribute. */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiErro> handleValidacao(BindException ex) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        ex.getBindingResult().getGlobalErrors()
                .forEach(ge -> campos.putIfAbsent(ge.getObjectName(), ge.getDefaultMessage()));
        return validacao(campos);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErro> handleConstraint(ConstraintViolationException ex) {
        Map<String, String> campos = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(v -> {
            String caminho = v.getPropertyPath().toString();
            String campo = caminho.contains(".") ? caminho.substring(caminho.lastIndexOf('.') + 1) : caminho;
            campos.putIfAbsent(campo, v.getMessage());
        });
        return validacao(campos);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErro> handleCorpoInvalido(HttpMessageNotReadableException ex) {
        return erro(HttpStatus.BAD_REQUEST, "REQUISICAO_INVALIDA", "Corpo da requisição inválido ou mal formatado");
    }

    @ExceptionHandler({MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiErro> handleParametro(Exception ex) {
        return erro(HttpStatus.BAD_REQUEST, "REQUISICAO_INVALIDA", "Parâmetro ausente ou inválido");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErro> handleUpload(MaxUploadSizeExceededException ex) {
        return erro(HttpStatus.PAYLOAD_TOO_LARGE, "ARQUIVO_GRANDE", "Arquivo maior que o permitido");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErro> handleAcessoNegado(AccessDeniedException ex) {
        return erro(HttpStatus.FORBIDDEN, "ACESSO_NEGADO", "Você não tem permissão para acessar este recurso");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErro> handleRotaInexistente(NoResourceFoundException ex) {
        return erro(HttpStatus.NOT_FOUND, "NAO_ENCONTRADO", "Recurso não encontrado");
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErro> handleMetodo(HttpRequestMethodNotSupportedException ex) {
        return erro(HttpStatus.METHOD_NOT_ALLOWED, "METODO_NAO_PERMITIDO", "Método não permitido para esta rota");
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErro> handleMediaType(HttpMediaTypeNotSupportedException ex) {
        return erro(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "TIPO_NAO_SUPORTADO", "Tipo de conteúdo não suportado");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErro> handleGenerico(Exception ex) {
        log.error("Erro inesperado", ex);
        return erro(HttpStatus.INTERNAL_SERVER_ERROR, "ERRO_INTERNO", "Erro interno. Tente novamente mais tarde.");
    }

    private ResponseEntity<ApiErro> validacao(Map<String, String> campos) {
        return resposta(HttpStatus.BAD_REQUEST, new ApiErro(400, "VALIDACAO", "Dados inválidos", campos));
    }

    private ResponseEntity<ApiErro> erro(HttpStatus status, String codigo, String mensagem) {
        return resposta(status, ApiErro.de(status.value(), codigo, mensagem));
    }

    private ResponseEntity<ApiErro> resposta(HttpStatus status, ApiErro corpo) {
        return ResponseEntity.status(status).body(corpo);
    }
}
