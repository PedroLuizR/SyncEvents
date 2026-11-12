package br.com.syncevents.common;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

class GlobalExceptionHandlerTest {

    record Entrada(@NotBlank(message = "Informe o nome") String nome,
            @NotBlank(message = "Informe o e-mail") @Email(message = "E-mail inválido") String email) {
    }

    @RestController
    static class ControllerDeTeste {

        @PostMapping("/teste")
        String criar(@Valid @RequestBody Entrada entrada) {
            return "ok";
        }

        @GetMapping("/teste/{tipo}")
        String falhar(@PathVariable String tipo) {
            throw switch (tipo) {
                case "404" -> ApiException.naoEncontrado("Empresa não encontrada");
                case "403" -> ApiException.acessoNegado("Este serviço pertence a outra empresa");
                case "409" -> ApiException.conflito("Transição de status inválida");
                case "campo" -> ApiException.campoInvalido("email", "E-mail já cadastrado");
                default -> new IllegalStateException("detalhe interno que não deve vazar");
            };
        }

        @GetMapping("/numero/{id}")
        String numero(@PathVariable Long id) {
            return "ok";
        }
    }

    MockMvc mvc;

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        mvc = MockMvcBuilders.standaloneSetup(new ControllerDeTeste())
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    void validacaoRetorna400ComCampos() throws Exception {
        mvc.perform(post("/teste").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"\",\"email\":\"invalido\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.erro").value("VALIDACAO"))
                .andExpect(jsonPath("$.mensagem").value("Dados inválidos"))
                .andExpect(jsonPath("$.campos.nome").value("Informe o nome"))
                .andExpect(jsonPath("$.campos.email").value("E-mail inválido"));
    }

    @Test
    void jsonMalFormadoRetorna400() throws Exception {
        mvc.perform(post("/teste").contentType(MediaType.APPLICATION_JSON).content("{nome:"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("REQUISICAO_INVALIDA"));
    }

    @Test
    void naoEncontradoRetorna404() throws Exception {
        mvc.perform(get("/teste/404"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("NAO_ENCONTRADO"))
                .andExpect(jsonPath("$.mensagem").value("Empresa não encontrada"))
                .andExpect(jsonPath("$.campos").doesNotExist());
    }

    @Test
    void acessoNegadoRetorna403() throws Exception {
        mvc.perform(get("/teste/403"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.erro").value("ACESSO_NEGADO"));
    }

    @Test
    void conflitoRetorna409() throws Exception {
        mvc.perform(get("/teste/409"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.erro").value("CONFLITO"));
    }

    @Test
    void erroDeCampoDeNegocioRetorna400ComCampo() throws Exception {
        mvc.perform(get("/teste/campo"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.email").value("E-mail já cadastrado"));
    }

    @Test
    void parametroComTipoErradoRetorna400() throws Exception {
        mvc.perform(get("/numero/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("REQUISICAO_INVALIDA"));
    }

    @Test
    void erroInesperadoRetorna500SemVazarDetalhes() throws Exception {
        mvc.perform(get("/teste/outro"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.erro").value("ERRO_INTERNO"))
                .andExpect(jsonPath("$.mensagem").value("Erro interno. Tente novamente mais tarde."));
    }
}
