package br.com.syncevents.common.validacao;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.ReportAsSingleViolation;
import jakarta.validation.constraints.Pattern;

/** Nome de pessoa: apenas letras (com acento) e espaços. */
@Documented
@Constraint(validatedBy = {})
@Pattern(regexp = "^[\\p{L}]+(?:[ '\\-][\\p{L}]+)*$")
@ReportAsSingleViolation
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface NomePessoa {

    String message() default "O nome deve conter apenas letras e espaços";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
