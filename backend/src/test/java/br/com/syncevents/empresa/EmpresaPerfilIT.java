package br.com.syncevents.empresa;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.syncevents.ContasDeTeste;
import br.com.syncevents.ContasDeTeste.Conta;
import br.com.syncevents.IntegrationTest;

class EmpresaPerfilIT extends IntegrationTest {

    static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 1, 2, 3};

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    Conta aurora;
    Conta outra;
    Conta cliente;

    @BeforeEach
    void setUp() throws Exception {
        var contas = new ContasDeTeste(mvc, json);
        aurora = contas.empresa("Ateliê Aurora");
        outra = contas.empresa("Outra");
        cliente = contas.cliente();
    }

    MockMultipartFile png() {
        return new MockMultipartFile("arquivo", "f.png", "image/png", PNG);
    }

    @Test
    void verEEditarOProprioPerfil() throws Exception {
        mvc.perform(get("/api/v1/empresas/me").header("Authorization", aurora.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomeFantasia").value("Ateliê Aurora"))
                .andExpect(jsonPath("$.codigo", matchesPattern("\\d{6}")))
                .andExpect(jsonPath("$.email").value(aurora.email()))
                .andExpect(jsonPath("$.portfolio", hasSize(0)));

        var corpo = Map.of(
                "nomeFantasia", "Ateliê Aurora Eventos",
                "telefone", "(21) 99876-5432",
                "cidade", "Rio de Janeiro, RJ",
                "endereco", "Rua das Flores, 100",
                "descricao", "Decoração autoral",
                "categoriaIds", List.of(3, 1));
        mvc.perform(put("/api/v1/empresas/me").header("Authorization", aurora.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomeFantasia").value("Ateliê Aurora Eventos"))
                .andExpect(jsonPath("$.telefone").value("21998765432"))
                .andExpect(jsonPath("$.uf").value("RJ"))
                .andExpect(jsonPath("$.endereco").value("Rua das Flores, 100"))
                .andExpect(jsonPath("$.categorias[*].nome", contains("Decoração", "Fotografia")));

        // reflete no /auth/me
        mvc.perform(get("/api/v1/auth/me").header("Authorization", aurora.bearer()))
                .andExpect(jsonPath("$.nome").value("Ateliê Aurora Eventos"));
    }

    @Test
    void edicaoValidaCampos() throws Exception {
        var corpo = Map.of("nomeFantasia", "", "telefone", "123", "cidade", "SP", "categoriaIds", List.of());
        mvc.perform(put("/api/v1/empresas/me").header("Authorization", aurora.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nomeFantasia").value("Informe o nome fantasia"))
                .andExpect(jsonPath("$.campos.telefone").value("Telefone inválido. Use (00) 00000-0000"))
                .andExpect(jsonPath("$.campos.categoriaIds").value("Escolha ao menos uma categoria"));
    }

    @Test
    void logoCapaEPortfolio() throws Exception {
        mvc.perform(multipart("/api/v1/empresas/me/logo").file(png()).header("Authorization", aurora.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logoUrl", startsWith("/files/logos/")));
        mvc.perform(multipart("/api/v1/empresas/me/capa").file(png()).header("Authorization", aurora.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.capaUrl", startsWith("/files/capas/")));

        mvc.perform(multipart("/api/v1/empresas/me/portfolio").file(png()).header("Authorization", aurora.bearer()))
                .andExpect(status().isOk());
        String body = mvc.perform(multipart("/api/v1/empresas/me/portfolio").file(png())
                        .header("Authorization", aurora.bearer()))
                .andExpect(jsonPath("$.portfolio", hasSize(2)))
                .andReturn().getResponse().getContentAsString();
        long fotoId = json.readTree(body).get("portfolio").get(0).get("id").asLong();

        // outra empresa não remove foto que não é dela
        mvc.perform(delete("/api/v1/empresas/me/portfolio/" + fotoId).header("Authorization", outra.bearer()))
                .andExpect(status().isNotFound());

        mvc.perform(delete("/api/v1/empresas/me/portfolio/" + fotoId).header("Authorization", aurora.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.portfolio", hasSize(1)));
    }

    @Test
    void clienteNaoAcessaRotasDeEmpresa() throws Exception {
        mvc.perform(get("/api/v1/empresas/me").header("Authorization", cliente.bearer()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.erro").value("ACESSO_NEGADO"));
        mvc.perform(multipart("/api/v1/empresas/me/portfolio").file(png()).header("Authorization", cliente.bearer()))
                .andExpect(status().isForbidden());
    }
}
