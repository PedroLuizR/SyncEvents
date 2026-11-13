package br.com.syncevents.avaliacao;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.syncevents.ContasDeTeste;
import br.com.syncevents.ContasDeTeste.Conta;
import br.com.syncevents.IntegrationTest;

class AvaliacaoIT extends IntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    ContasDeTeste contas;
    Conta empresa;
    Conta cliente;
    String cidade;

    @BeforeEach
    void setUp() throws Exception {
        contas = new ContasDeTeste(mvc, json);
        cidade = "Avaliacidade" + System.nanoTime() + ", SP";
        empresa = contas.empresa("Ateliê Avaliado", cidade, "1");
        cliente = contas.cliente(cidade);
    }

    long pedido(Conta c, Conta e) throws Exception {
        var corpo = Map.of("empresaId", e.perfilId(), "tipoEvento", "CASAMENTO",
                "dataEvento", LocalDate.now().plusDays(10).toString(), "qtdConvidados", 50, "local", "Sítio",
                "aceiteContato", true);
        String body = mvc.perform(post("/api/v1/solicitacoes").header("Authorization", c.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("id").asLong();
    }

    /** Leva a solicitação até CONCLUIDA pelo fluxo real (proposta → aceite → conclusão). */
    long concluido(Conta c, Conta e) throws Exception {
        long id = pedido(c, e);
        String body = mvc.perform(post("/api/v1/solicitacoes/" + id + "/propostas").header("Authorization", e.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("valor", 3000, "descricao", "Pacote"))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long propostaId = json.readTree(body).get("propostaAtual").get("id").asLong();
        mvc.perform(patch("/api/v1/propostas/" + propostaId).header("Authorization", c.bearer())
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"ACEITA\"}")).andExpect(status().isOk());
        mvc.perform(patch("/api/v1/solicitacoes/" + id + "/status").header("Authorization", e.bearer())
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"CONCLUIDA\"}")).andExpect(status().isOk());
        return id;
    }

    ResultActions avaliar(Conta c, long solicitacaoId, int nota, List<String> destaques, String comentario)
            throws Exception {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("solicitacaoId", solicitacaoId);
        m.put("nota", nota);
        m.put("destaques", destaques);
        m.put("comentario", comentario);
        return mvc.perform(post("/api/v1/avaliacoes").header("Authorization", c.bearer())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(m)));
    }

    @Test
    void avaliaEventoConcluidoEAtualizaAMedia() throws Exception {
        long s1 = concluido(cliente, empresa);
        avaliar(cliente, s1, 5, List.of("QUALIDADE", "PONTUALIDADE", "QUALIDADE"), "  Equipe impecável!  ")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nota").value(5))
                .andExpect(jsonPath("$.comentario").value("Equipe impecável!"))
                .andExpect(jsonPath("$.destaques", contains("PONTUALIDADE", "QUALIDADE")))
                .andExpect(jsonPath("$.autor.nome").value("Marina A."));

        Conta outro = contas.cliente(cidade);
        long s2 = concluido(outro, empresa);
        avaliar(outro, s2, 4, null, null).andExpect(status().isCreated());

        // média 4,5 no perfil, na lista e na busca
        mvc.perform(get("/api/v1/empresas/" + empresa.perfilId()).header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.nota").value(4.5))
                .andExpect(jsonPath("$.totalAvaliacoes").value(2))
                .andExpect(jsonPath("$.indicadores.recomendam").value(100))
                .andExpect(jsonPath("$.indicadores.eventosRealizados").value(2));
        mvc.perform(get("/api/v1/empresas/" + empresa.perfilId() + "/avaliacoes").header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.resumo.media").value(4.5))
                .andExpect(jsonPath("$.resumo.total").value(2))
                .andExpect(jsonPath("$.avaliacoes.conteudo", hasSize(2)))
                .andExpect(jsonPath("$.avaliacoes.conteudo[0].nota").value(4)); // mais recente primeiro
        mvc.perform(get("/api/v1/empresas").param("cidade", cidade).header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.conteudo[0].nota").value(4.5))
                .andExpect(jsonPath("$.conteudo[0].totalAvaliacoes").value(2));

        // a solicitação passa a vir marcada como avaliada
        mvc.perform(get("/api/v1/solicitacoes/" + s1).header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.avaliada").value(true));
        mvc.perform(get("/api/v1/solicitacoes/me").header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$[0].avaliada").value(true));
    }

    @Test
    void naoPodeAvaliarDuasVezes() throws Exception {
        long s = concluido(cliente, empresa);
        avaliar(cliente, s, 5, null, null).andExpect(status().isCreated());
        avaliar(cliente, s, 1, null, "mudei de ideia").andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value("Você já avaliou este evento"));
    }

    @Test
    void naoPodeAvaliarSemTerConcluido() throws Exception {
        long s = pedido(cliente, empresa);
        avaliar(cliente, s, 5, null, null).andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value("Só é possível avaliar depois que o evento for concluído"));
        mvc.perform(get("/api/v1/solicitacoes/" + s).header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.avaliada").value(false));
    }

    @Test
    void soOClienteDaSolicitacaoAvalia() throws Exception {
        long s = concluido(cliente, empresa);
        avaliar(contas.cliente(cidade), s, 5, null, null).andExpect(status().isForbidden());
        avaliar(empresa, s, 5, null, null).andExpect(status().isForbidden());
    }

    @Test
    void validaNota() throws Exception {
        long s = concluido(cliente, empresa);
        avaliar(cliente, s, 6, null, null).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nota").value("Escolha uma nota de 1 a 5"));
        avaliar(cliente, s, 0, null, null).andExpect(status().isBadRequest());
    }

    @Test
    void ordenaPorMelhorNota() throws Exception {
        Conta pior = contas.empresa("Empresa Nota Três", cidade, "1");
        avaliar(cliente, concluido(cliente, empresa), 5, null, null).andExpect(status().isCreated());
        avaliar(cliente, concluido(cliente, pior), 3, null, null).andExpect(status().isCreated());
        contas.empresa("Empresa Sem Nota", cidade, "1");

        mvc.perform(get("/api/v1/empresas").param("cidade", cidade).param("ordenar", "nota")
                        .header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.conteudo[*].nomeFantasia",
                        contains("Ateliê Avaliado", "Empresa Nota Três", "Empresa Sem Nota")));
    }

    @Test
    void empresaSemAvaliacoes() throws Exception {
        mvc.perform(get("/api/v1/empresas/" + empresa.perfilId() + "/avaliacoes").header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.resumo.total").value(0))
                .andExpect(jsonPath("$.resumo.media").doesNotExist())
                .andExpect(jsonPath("$.avaliacoes.conteudo", hasSize(0)));
        mvc.perform(get("/api/v1/empresas/99999999/avaliacoes").header("Authorization", cliente.bearer()))
                .andExpect(status().isNotFound());
    }
}
