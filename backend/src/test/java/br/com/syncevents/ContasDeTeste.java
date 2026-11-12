package br.com.syncevents;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Cria contas reais pela API e devolve o token, para os testes de integração. */
public final class ContasDeTeste {

    public record Conta(String token, long perfilId, String email) {
        public String bearer() {
            return "Bearer " + token;
        }
    }

    private final MockMvc mvc;
    private final ObjectMapper json;

    public ContasDeTeste(MockMvc mvc, ObjectMapper json) {
        this.mvc = mvc;
        this.json = json;
    }

    public Conta empresa(String nome) throws Exception {
        String email = TestData.email("emp");
        mvc.perform(multipart("/api/v1/auth/cadastro/empresa")
                        .param("nomeFantasia", nome)
                        .param("cnpj", TestData.cnpjValido())
                        .param("email", email)
                        .param("telefone", "11987654321")
                        .param("cidade", "São Paulo, SP")
                        .param("categoriaIds", "1")
                        .param("senha", "Senha@123")
                        .param("aceiteTermos", "true"))
                .andExpect(status().isCreated());
        return entrar(email, "EMPRESA");
    }

    public Conta cliente() throws Exception {
        String email = TestData.email("cli");
        mvc.perform(multipart("/api/v1/auth/cadastro/cliente")
                        .param("nome", "Marina Alves")
                        .param("email", email)
                        .param("telefone", "11987654321")
                        .param("cidade", "São Paulo, SP")
                        .param("senha", "Senha@123")
                        .param("aceiteTermos", "true"))
                .andExpect(status().isCreated());
        return entrar(email, "CLIENTE");
    }

    private Conta entrar(String email, String tipo) throws Exception {
        String body = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("login", email, "senha", "Senha@123", "tipo", tipo))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode r = json.readTree(body);
        return new Conta(r.get("token").asText(), r.get("usuario").get("perfilId").asLong(), email);
    }
}
