package br.com.syncevents.common.validacao;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import br.com.syncevents.TestData;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class ValidadoresTest {

    record Dados(@SenhaForte String senha, @Cnpj String cnpj, @Telefone String telefone, @NomePessoa String nome) {
    }

    static ValidatorFactory factory;
    static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    private Set<ConstraintViolation<Dados>> validar(Dados d) {
        return validator.validate(d);
    }

    // ---- Senha ----

    @ParameterizedTest
    @ValueSource(strings = {"Senha@123", "Abcdef1!", "Çãoção9#X", "Muito-Forte-2026"})
    void senhaForteAceita(String senha) {
        assertThat(SenhaForte.Validador.forte(senha)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {"Ab1!", "senha@123", "SENHA@123", "Senha1234", "Senha@abc", "        "})
    void senhaFracaRejeitada(String senha) {
        assertThat(SenhaForte.Validador.forte(senha)).isFalse();
        assertThat(validar(new Dados(senha, null, null, null)))
                .extracting(ConstraintViolation::getMessage)
                .containsExactly("A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial");
    }

    // ---- CNPJ ----

    @ParameterizedTest
    @ValueSource(strings = {"11.222.333/0001-81", "11222333000181", "11.222.333/0001-82", "00000000000000"})
    void cnpjComQuatorzeDigitosEAceitoSemConferirDigitoVerificador(String cnpj) {
        assertThat(Documentos.cnpjValido(cnpj)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {"1122233300018", "112223330001811", "abc", "11.222.333/0001-8X"})
    void cnpjInvalido(String cnpj) {
        assertThat(Documentos.cnpjValido(cnpj)).isFalse();
        assertThat(validar(new Dados(null, cnpj, null, null)))
                .extracting(ConstraintViolation::getMessage).containsExactly("O CNPJ deve ter 14 dígitos");
    }

    @Test
    void cnpjsGeradosNosTestesSaoValidos() {
        for (int i = 0; i < 50; i++) {
            assertThat(Documentos.cnpjValido(TestData.cnpjValido())).isTrue();
        }
    }

    // ---- Telefone ----

    @ParameterizedTest
    @ValueSource(strings = {"(11) 98765-4321", "11987654321", "(11) 3245-1234", "1132451234"})
    void telefoneValido(String tel) {
        assertThat(Documentos.telefoneValido(tel)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {"98765-4321", "(01) 98765-4321", "119876543210", "abc"})
    void telefoneInvalido(String tel) {
        assertThat(Documentos.telefoneValido(tel)).isFalse();
    }

    // ---- Nome ----

    @ParameterizedTest
    @ValueSource(strings = {"Marina Alves", "João da Silva", "Ângela Müller", "Ana-Clara D'Ávila"})
    void nomeValido(String nome) {
        assertThat(validar(new Dados(null, null, null, nome))).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"Marina 2", "Ana@Silva", " Marina", "Marina  Alves", "R2D2"})
    void nomeInvalido(String nome) {
        assertThat(validar(new Dados(null, null, null, nome)))
                .extracting(ConstraintViolation::getMessage)
                .containsExactly("O nome deve conter apenas letras e espaços");
    }

    @Test
    void nulosSaoAceitos() {
        assertThat(validar(new Dados(null, null, null, null))).isEmpty();
    }
}
