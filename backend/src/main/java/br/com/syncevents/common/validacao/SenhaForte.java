package br.com.syncevents.common.validacao;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.regex.Pattern;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

/** Mínimo de 8 caracteres, com maiúscula, minúscula, número e caractere especial. */
@Documented
@Constraint(validatedBy = SenhaForte.Validador.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface SenhaForte {

    String message() default "A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    class Validador implements ConstraintValidator<SenhaForte, String> {

        private static final Pattern MAIUSCULA = Pattern.compile("\\p{Lu}");
        private static final Pattern MINUSCULA = Pattern.compile("\\p{Ll}");
        private static final Pattern NUMERO = Pattern.compile("\\d");
        private static final Pattern ESPECIAL = Pattern.compile("[^\\p{L}\\d\\s]");

        public static boolean forte(String senha) {
            return senha != null
                    && senha.length() >= 8
                    && MAIUSCULA.matcher(senha).find()
                    && MINUSCULA.matcher(senha).find()
                    && NUMERO.matcher(senha).find()
                    && ESPECIAL.matcher(senha).find();
        }

        @Override
        public boolean isValid(String valor, ConstraintValidatorContext ctx) {
            return valor == null || valor.isEmpty() || forte(valor);
        }
    }
}
