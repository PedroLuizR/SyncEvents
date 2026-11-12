package br.com.syncevents.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.syncevents.IntegrationTest;
import br.com.syncevents.TestData;

class AuthIT extends IntegrationTest {

    static final String SENHA = "Senha@123";
    static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 1, 2, 3};

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    MockMultipartHttpServletRequestBuilder cadastroCliente(String email) {
        return (MockMultipartHttpServletRequestBuilder) multipart("/api/v1/auth/cadastro/cliente")
                .param("nome", "Marina Alves")
                .param("email", email)
                .param("telefone", "(11) 98765-4321")
                .param("cidade", "São Paulo, SP")
                .param("senha", SENHA)
                .param("interesses", "CASAMENTO", "ANIVERSARIO")
                .param("aceiteTermos", "true");
    }

    MockMultipartHttpServletRequestBuilder cadastroEmpresa(String email, String cnpj) {
        return (MockMultipartHttpServletRequestBuilder) multipart("/api/v1/auth/cadastro/empresa")
                .param("nomeFantasia", "Ateliê Aurora")
                .param("cnpj", cnpj)
                .param("email", email)
                .param("telefone", "(11) 3456-7890")
                .param("cidade", "São Paulo, SP")
                .param("categoriaIds", "1", "3")
                .param("descricao", "Decoração autoral para casamentos")
                .param("senha", SENHA)
                .param("aceiteTermos", "true");
    }

    String login(String loginValor, String senha, String tipo) throws Exception {
        return json.writeValueAsString(new java.util.LinkedHashMap<>(java.util.Map.of(
                "login", loginValor, "senha", senha, "tipo", tipo)));
    }

    JsonNode entrar(String loginValor, String tipo) throws Exception {
        String body = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(login(loginValor, SENHA, tipo)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body);
    }

    // ---------- categorias ----------

    @Test
    void categoriasSaoPublicas() throws Exception {
        mvc.perform(get("/api/v1/categorias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(6)))
                .andExpect(jsonPath("$[0].nome").value("Decoração"))
                .andExpect(jsonPath("$[0].icone").value("star"))
                .andExpect(jsonPath("$[5].nome").value("Bebidas"));
    }

    // ---------- ID01: cadastro de cliente ----------

    @Test
    void cadastraClienteELogaComSucesso() throws Exception {
        String email = TestData.email("marina");
        mvc.perform(cadastroCliente(email)
                        .file(new MockMultipartFile("foto", "eu.png", "image/png", PNG))
                        .param("cpf", "123.456.789-00"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.tipo").value("CLIENTE"))
                .andExpect(jsonPath("$.nome").value("Marina Alves"))
                .andExpect(jsonPath("$.telefone").value("11987654321"))
                .andExpect(jsonPath("$.interesses", hasSize(2)))
                .andExpect(jsonPath("$.fotoUrl", startsWith("/files/clientes/")))
                .andExpect(jsonPath("$.senha").doesNotExist());

        JsonNode resp = entrar(email.toUpperCase(), "CLIENTE");
        assertThat(resp.get("token").asText()).isNotBlank();
        assertThat(resp.get("usuario").get("tipo").asText()).isEqualTo("CLIENTE");

        mvc.perform(get(resp.get("usuario").get("fotoUrl").asText())).andExpect(status().isOk());

        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + resp.get("token").asText()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.cidade").value("São Paulo, SP"));
    }

    @Test
    void emailDuplicadoMostraMensagemClara() throws Exception {
        String email = TestData.email("dup");
        mvc.perform(cadastroCliente(email)).andExpect(status().isCreated());
        mvc.perform(cadastroCliente(email.toUpperCase()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("VALIDACAO"))
                .andExpect(jsonPath("$.campos.email").value("E-mail já cadastrado"));
    }

    @Test
    void senhaFracaENomeInvalidoSaoRecusados() throws Exception {
        mvc.perform(multipart("/api/v1/auth/cadastro/cliente")
                        .param("nome", "Marina 2")
                        .param("email", TestData.email("fraca"))
                        .param("telefone", "11987654321")
                        .param("cidade", "Recife")
                        .param("senha", "12345678")
                        .param("aceiteTermos", "true"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.senha").value(
                        "A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial"))
                .andExpect(jsonPath("$.campos.nome").value("O nome deve conter apenas letras e espaços"));
    }

    @Test
    void camposObrigatoriosETermos() throws Exception {
        mvc.perform(multipart("/api/v1/auth/cadastro/cliente").param("aceiteTermos", "false"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nome").value("Informe seu nome completo"))
                .andExpect(jsonPath("$.campos.email").value("Informe seu e-mail"))
                .andExpect(jsonPath("$.campos.telefone").value("Informe seu celular"))
                .andExpect(jsonPath("$.campos.cidade").value("Informe sua cidade"))
                .andExpect(jsonPath("$.campos.senha").value("Crie uma senha"))
                .andExpect(jsonPath("$.campos.aceiteTermos").value("Aceite os Termos de Uso para continuar"));
    }

    @Test
    void fotoQueNaoEImagemERecusada() throws Exception {
        mvc.perform(cadastroCliente(TestData.email("pdf"))
                        .file(new MockMultipartFile("foto", "x.pdf", "application/pdf", new byte[] {1})))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.arquivo").value("Envie uma imagem PNG, JPG ou WEBP"));
    }

    // ---------- ID02: cadastro de empresa ----------

    @Test
    void cadastraEmpresaComCodigoDeSeisDigitosELogaPorCnpj() throws Exception {
        String email = TestData.email("aurora");
        String cnpj = TestData.cnpjValido();
        mvc.perform(cadastroEmpresa(email, TestData.mascararCnpj(cnpj))
                        .file(new MockMultipartFile("logo", "logo.png", "image/png", PNG))
                        .param("endereco", "Rua das Flores, 100"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo").value("EMPRESA"))
                .andExpect(jsonPath("$.codigo", matchesPattern("\\d{6}")))
                .andExpect(jsonPath("$.categorias[*].nome").value(org.hamcrest.Matchers.contains("Decoração", "Fotografia")))
                .andExpect(jsonPath("$.fotoUrl", startsWith("/files/logos/")));

        JsonNode porCnpj = entrar(TestData.mascararCnpj(cnpj), "EMPRESA");
        assertThat(porCnpj.get("usuario").get("email").asText()).isEqualTo(email);
        JsonNode porEmail = entrar(email, "EMPRESA");
        assertThat(porEmail.get("usuario").get("codigo").asText()).matches("\\d{6}");
    }

    @Test
    void cnpjInvalidoMostraMensagemClara() throws Exception {
        mvc.perform(cadastroEmpresa(TestData.email("inv"), "11.222.333/0001-82"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.cnpj").value("CNPJ inválido"));
    }

    @Test
    void cnpjDuplicadoERecusado() throws Exception {
        String cnpj = TestData.cnpjValido();
        mvc.perform(cadastroEmpresa(TestData.email("a"), cnpj)).andExpect(status().isCreated());
        mvc.perform(cadastroEmpresa(TestData.email("b"), TestData.mascararCnpj(cnpj)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.cnpj").value("CNPJ já cadastrado"));
    }

    @Test
    void empresaPrecisaDeCategoriaValida() throws Exception {
        mvc.perform(cadastroEmpresa(TestData.email("semcat"), TestData.cnpjValido()).param("categoriaIds", "999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.categoriaIds").value("Categoria inválida"));
    }

    // ---------- ID03: login ----------

    @Test
    void loginErradoMostraMensagemClara() throws Exception {
        String email = TestData.email("errado");
        mvc.perform(cadastroCliente(email)).andExpect(status().isCreated());

        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(login(email, "Outra@123", "CLIENTE")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro").value("CREDENCIAIS_INVALIDAS"))
                .andExpect(jsonPath("$.mensagem").value("E-mail ou senha incorretos"));

        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(login(email, SENHA, "EMPRESA")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensagem").value("Esta conta é de cliente. Entre pela aba Cliente."));
    }

    @Test
    void loginSemCamposRetorna400() throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.login").value("Informe seu e-mail"))
                .andExpect(jsonPath("$.campos.senha").value("Informe sua senha"));
    }

    @Test
    void meExigeTokenValido() throws Exception {
        mvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer token.invalido.aqui"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro").value("NAO_AUTENTICADO"));
    }
}
