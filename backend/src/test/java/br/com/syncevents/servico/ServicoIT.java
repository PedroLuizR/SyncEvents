package br.com.syncevents.servico;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.LinkedHashMap;
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

class ServicoIT extends IntegrationTest {

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
        outra = contas.empresa("Outra Empresa");
        cliente = contas.cliente();
    }

    Map<String, Object> servico(boolean rascunho) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("nome", "Decoração completa para casamentos");
        m.put("categoriaId", 1);
        m.put("descricao", "Projeto personalizado com conceito visual e montagem.");
        m.put("modeloPreco", "A_PARTIR_DE");
        m.put("precoMin", 2800);
        m.put("ativo", true);
        m.put("rascunho", rascunho);
        m.put("itensInclusos", List.of("Projeto e moodboard", "Arranjos florais"));
        return m;
    }

    long criar(Conta conta, Map<String, Object> corpo) throws Exception {
        String body = mvc.perform(post("/api/v1/servicos/me").header("Authorization", conta.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("id").asLong();
    }

    @Test
    void empresaCriaEditaDesativaERemoveServico() throws Exception {
        long id = criar(aurora, servico(false));

        mvc.perform(get("/api/v1/servicos/me").header("Authorization", aurora.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nome").value("Decoração completa para casamentos"))
                .andExpect(jsonPath("$[0].precoMin").value(2800.0))
                .andExpect(jsonPath("$[0].categoria.nome").value("Decoração"))
                .andExpect(jsonPath("$[0].itensInclusos", contains("Projeto e moodboard", "Arranjos florais")));

        // visível para clientes
        mvc.perform(get("/api/v1/empresas/" + aurora.perfilId() + "/servicos").header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$", hasSize(1)));

        // edita e desativa
        Map<String, Object> editado = servico(false);
        editado.put("nome", "Decoração premium");
        editado.put("modeloPreco", "FAIXA");
        editado.put("precoMin", 3000);
        editado.put("precoMax", 8000);
        editado.put("ativo", false);
        editado.put("itensInclusos", List.of("Somente projeto"));
        mvc.perform(put("/api/v1/servicos/" + id).header("Authorization", aurora.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(editado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Decoração premium"))
                .andExpect(jsonPath("$.precoMax").value(8000.0))
                .andExpect(jsonPath("$.ativo").value(false))
                .andExpect(jsonPath("$.itensInclusos", contains("Somente projeto")));

        // inativo some da lista pública e do detalhe para o cliente
        mvc.perform(get("/api/v1/empresas/" + aurora.perfilId() + "/servicos").header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(get("/api/v1/servicos/" + id).header("Authorization", cliente.bearer()))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/servicos/" + id).header("Authorization", aurora.bearer()))
                .andExpect(status().isOk());

        // remove
        mvc.perform(delete("/api/v1/servicos/" + id).header("Authorization", aurora.bearer()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/servicos/me").header("Authorization", aurora.bearer()))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void outraEmpresaNaoConsegueEditarNemRemover() throws Exception {
        long id = criar(aurora, servico(false));

        mvc.perform(put("/api/v1/servicos/" + id).header("Authorization", outra.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(servico(false))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.erro").value("ACESSO_NEGADO"))
                .andExpect(jsonPath("$.mensagem").value("Este serviço pertence a outra empresa"));
        mvc.perform(delete("/api/v1/servicos/" + id).header("Authorization", outra.bearer()))
                .andExpect(status().isForbidden());
        mvc.perform(multipart("/api/v1/servicos/" + id + "/fotos")
                        .file(new MockMultipartFile("arquivo", "f.png", "image/png", PNG))
                        .header("Authorization", outra.bearer()))
                .andExpect(status().isForbidden());

        // e o serviço continua lá
        mvc.perform(get("/api/v1/servicos/me").header("Authorization", aurora.bearer()))
                .andExpect(jsonPath("$", hasSize(1)));
        mvc.perform(get("/api/v1/servicos/me").header("Authorization", outra.bearer()))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void clienteNaoGerenciaServicos() throws Exception {
        mvc.perform(get("/api/v1/servicos/me").header("Authorization", cliente.bearer()))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/servicos/me").header("Authorization", cliente.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(servico(false))))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/servicos/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void rascunhoPodeSerIncompletoENaoApareceParaClientes() throws Exception {
        long id = criar(aurora, Map.of("nome", "Ideia de pacote", "categoriaId", 2, "rascunho", true));

        mvc.perform(get("/api/v1/servicos/" + id).header("Authorization", aurora.bearer()))
                .andExpect(jsonPath("$.rascunho").value(true))
                .andExpect(jsonPath("$.modeloPreco").value("SOB_CONSULTA"));
        mvc.perform(get("/api/v1/empresas/" + aurora.perfilId() + "/servicos").header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void publicarSemDadosObrigatoriosMostraMensagens() throws Exception {
        mvc.perform(post("/api/v1/servicos/me").header("Authorization", aurora.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("nome", "", "modeloPreco", "FIXO"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nome").value("Informe o nome do serviço"))
                .andExpect(jsonPath("$.campos.categoriaId").value("Escolha a categoria"));

        mvc.perform(post("/api/v1/servicos/me").header("Authorization", aurora.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("nome", "Buffet", "categoriaId", 2, "modeloPreco", "FIXO"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.descricao").value("Descreva o serviço"))
                .andExpect(jsonPath("$.campos.precoMin").value("Informe o valor"));
    }

    @Test
    void fotosDoServico() throws Exception {
        long id = criar(aurora, servico(false));
        String body = mvc.perform(multipart("/api/v1/servicos/" + id + "/fotos")
                        .file(new MockMultipartFile("arquivo", "f.png", "image/png", PNG))
                        .header("Authorization", aurora.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fotos", hasSize(1)))
                .andExpect(jsonPath("$.fotos[0].url", startsWith("/files/servicos/")))
                .andReturn().getResponse().getContentAsString();
        long fotoId = json.readTree(body).get("fotos").get(0).get("id").asLong();
        String url = json.readTree(body).get("fotos").get(0).get("url").asText();
        mvc.perform(get(url)).andExpect(status().isOk());

        mvc.perform(delete("/api/v1/servicos/" + id + "/fotos/" + fotoId).header("Authorization", aurora.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fotos", hasSize(0)));
        mvc.perform(get(url)).andExpect(status().isNotFound());
    }

    @Test
    void servicosDeEmpresaInexistenteRetorna404() throws Exception {
        mvc.perform(get("/api/v1/empresas/999999/servicos").header("Authorization", cliente.bearer()))
                .andExpect(status().isNotFound());
    }
}
