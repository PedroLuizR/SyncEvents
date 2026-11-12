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

/** Telefone com DDD, no formato (00) 00000-0000 ou só dígitos. */
@Documented
@Constraint(validatedBy = Telefone.Validador.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface Telefone {

    String message() default "Telefone inválido. Use (00) 00000-0000";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    class Validador implements ConstraintValidator<Telefone, String> {
        @Override
        public boolean isValid(String valor, ConstraintValidatorContext ctx) {
            return valor == null || valor.isBlank() || Documentos.telefoneValido(valor);
        }
    }
}
