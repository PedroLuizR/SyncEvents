package br.com.syncevents.busca;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.syncevents.ContasDeTeste;
import br.com.syncevents.ContasDeTeste.Conta;
import br.com.syncevents.IntegrationTest;

/**
 * Cada teste usa uma cidade única para isolar os resultados (o banco é compartilhado).
 * Categorias do seed: 1 Decoração, 2 Buffet, 3 Fotografia.
 */
class BuscaIT extends IntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Autowired
    JdbcTemplate jdbc;

    ContasDeTeste contas;
    String cidade;
    Conta cliente;

    @BeforeEach
    void setUp() throws Exception {
        contas = new ContasDeTeste(mvc, json);
        cidade = "Cidadeteste" + System.nanoTime() + ", SP";
        cliente = contas.cliente(cidade);
    }

    void servico(Conta empresa, String nome, long categoriaId, Integer precoMin, boolean ativo) throws Exception {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("nome", nome);
        m.put("categoriaId", categoriaId);
        m.put("descricao", "Descrição do serviço");
        m.put("modeloPreco", precoMin == null ? "SOB_CONSULTA" : "A_PARTIR_DE");
        m.put("precoMin", precoMin);
        m.put("ativo", ativo);
        m.put("rascunho", false);
        mvc.perform(post("/api/v1/servicos/me").header("Authorization", empresa.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(m)))
                .andExpect(status().isCreated());
    }

    @Test
    void buscarDecoracaoTrazAEmpresaDaCategoriaEAQueTemServicoComEsseNome() throws Exception {
        contas.empresa("Ateliê Alfa", cidade, "1");                       // categoria Decoração
        Conta buffet = contas.empresa("Buffet Beta", cidade, "2");        // serviço com "decoração" no nome
        servico(buffet, "Decoração de mesas para buffet", 2, 900, true);
        Conta foto = contas.empresa("Foto Gama", cidade, "3");            // nada a ver
        servico(foto, "Ensaio fotográfico", 3, 500, true);
        Conta inativo = contas.empresa("Som Delta", cidade, "2");         // serviço inativo não conta
        servico(inativo, "Decoração com luzes", 2, 700, false);

        for (String q : List.of("decoração", "DECORACAO", "Decoração para casamento".substring(0, 9))) {
            mvc.perform(get("/api/v1/empresas").param("q", q).param("cidade", cidade)
                            .header("Authorization", cliente.bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.total").value(2))
                    // categoria (peso 3) vem antes de nome de serviço (peso 2)
                    .andExpect(jsonPath("$.conteudo[*].nomeFantasia", contains("Ateliê Alfa", "Buffet Beta")));
        }
    }

    @Test
    void variosTermosPrecisamAparecer() throws Exception {
        Conta a = contas.empresa("Ateliê Alfa", cidade, "1");
        servico(a, "Decoração completa para casamentos", 1, 2800, true);
        contas.empresa("Jardim Ômega", cidade, "1");

        mvc.perform(get("/api/v1/empresas").param("q", "decoração para casamento").param("cidade", cidade)
                        .header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.conteudo[0].nomeFantasia").value("Ateliê Alfa"))
                .andExpect(jsonPath("$.conteudo[0].precoAPartirDe").value(2800.0))
                .andExpect(jsonPath("$.conteudo[0].categorias[0].nome").value("Decoração"));
    }

    @Test
    void filtraPorCategoriaECidadeEOrdenaPorPreco() throws Exception {
        Conta cara = contas.empresa("Cara", cidade, "2");
        servico(cara, "Buffet premium", 2, 9000, true);
        Conta barata = contas.empresa("Barata", cidade, "2");
        servico(barata, "Buffet simples", 2, 1500, true);
        contas.empresa("Sem preço", cidade, "2");
        contas.empresa("Outra categoria", cidade, "3");
        contas.empresa("Outra cidade", "Lugarnenhum" + System.nanoTime(), "2");

        mvc.perform(get("/api/v1/empresas").param("categoriaId", "2").param("cidade", cidade)
                        .param("ordenar", "preco").header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.conteudo[*].nomeFantasia", contains("Barata", "Cara", "Sem preço")))
                .andExpect(jsonPath("$.conteudo[2].precoAPartirDe").doesNotExist());
    }

    @Test
    void paginacao() throws Exception {
        for (int i = 0; i < 5; i++) {
            contas.empresa("Empresa " + i, cidade, "1");
        }
        mvc.perform(get("/api/v1/empresas").param("cidade", cidade).param("size", "2").param("page", "0")
                        .header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.conteudo", hasSize(2)))
                .andExpect(jsonPath("$.total").value(5))
                .andExpect(jsonPath("$.totalPaginas").value(3))
                .andExpect(jsonPath("$.ultima").value(false));
        mvc.perform(get("/api/v1/empresas").param("cidade", cidade).param("size", "2").param("page", "2")
                        .header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.conteudo", hasSize(1)))
                .andExpect(jsonPath("$.ultima").value(true));
    }

    @Test
    void semResultadosDevolvePaginaVazia() throws Exception {
        mvc.perform(get("/api/v1/empresas").param("q", "xyzinexistente").header("Authorization", cliente.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conteudo", hasSize(0)))
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void recomendadasPriorizaACidadeDoCliente() throws Exception {
        Conta local = contas.empresa("Local", cidade, "1");
        servico(local, "Serviço local", 1, 1000, true);
        contas.empresa("Sem serviço", cidade, "1"); // sem serviço publicado não é recomendada

        String body = mvc.perform(get("/api/v1/empresas/recomendadas").header("Authorization", cliente.bearer()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        var lista = json.readTree(body);
        assertThat(lista.get(0).get("nomeFantasia").asText()).isEqualTo("Local");
        for (var e : lista) {
            assertThat(e.get("nomeFantasia").asText()).isNotEqualTo("Sem serviço");
        }
    }

    @Test
    void perfilPublicoComServicosVisiveisERegistroDeVisualizacao() throws Exception {
        Conta empresa = contas.empresa("Ateliê Público", cidade, "1", "3");
        servico(empresa, "Visível", 1, 1000, true);
        servico(empresa, "Inativo", 1, 1000, false);

        mvc.perform(get("/api/v1/empresas/" + empresa.perfilId()).header("Authorization", cliente.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomeFantasia").value("Ateliê Público"))
                .andExpect(jsonPath("$.telefoneWhatsapp").value("11987654321"))
                .andExpect(jsonPath("$.categorias[*].nome", containsInAnyOrder("Decoração", "Fotografia")))
                .andExpect(jsonPath("$.servicos[*].nome", contains("Visível")))
                .andExpect(jsonPath("$.indicadores.servicos").value(1))
                .andExpect(jsonPath("$.totalAvaliacoes").value(0))
                .andExpect(jsonPath("$.cnpj").doesNotExist());

        // a própria empresa abrindo o perfil não conta como visualização
        mvc.perform(get("/api/v1/empresas/" + empresa.perfilId()).header("Authorization", empresa.bearer()))
                .andExpect(status().isOk());

        Integer views = jdbc.queryForObject(
                "select count(*) from visualizacao_perfil where empresa_id = ? and cliente_id is not null",
                Integer.class, empresa.perfilId());
        assertThat(views).isEqualTo(1);
    }

    @Test
    void perfilInexistenteRetorna404() throws Exception {
        mvc.perform(get("/api/v1/empresas/99999999").header("Authorization", cliente.bearer()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensagem").value("Empresa não encontrada"));
    }

    @Test
    void buscaERecomendadasSaoDoCliente() throws Exception {
        Conta empresa = contas.empresa("Qualquer", cidade, "1");
        mvc.perform(get("/api/v1/empresas").header("Authorization", empresa.bearer()))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/empresas/recomendadas").header("Authorization", empresa.bearer()))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/empresas")).andExpect(status().isUnauthorized());
    }
}
