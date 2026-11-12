package br.com.syncevents.common.validacao;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

/** CNPJ válido (com ou sem máscara). Nulo é considerado válido: combine com @NotBlank. */
@Documented
@Constraint(validatedBy = Cnpj.Validador.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface Cnpj {

    String message() default "CNPJ inválido";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    class Validador implements ConstraintValidator<Cnpj, String> {
        @Override
        public boolean isValid(String valor, ConstraintValidatorContext ctx) {
            return valor == null || valor.isBlank() || Documentos.cnpjValido(valor);
        }
    }
}
