package br.com.syncevents.solicitacao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.syncevents.ContasDeTeste;
import br.com.syncevents.ContasDeTeste.Conta;
import br.com.syncevents.IntegrationTest;

class SolicitacaoIT extends IntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    Conta empresa;
    Conta outraEmpresa;
    Conta cliente;
    Conta outroCliente;
    long servicoId;

    @BeforeEach
    void setUp() throws Exception {
        var contas = new ContasDeTeste(mvc, json);
        empresa = contas.empresa("Ateliê Aurora");
        outraEmpresa = contas.empresa("Outra");
        cliente = contas.cliente();
        outroCliente = contas.cliente();
        servicoId = criarServico(empresa, "Decoração completa");
    }

    long criarServico(Conta conta, String nome) throws Exception {
        var corpo = Map.of("nome", nome, "categoriaId", 1, "descricao", "x", "modeloPreco", "A_PARTIR_DE",
                "precoMin", 2800, "rascunho", false);
        String body = mvc.perform(post("/api/v1/servicos/me").header("Authorization", conta.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("id").asLong();
    }

    Map<String, Object> pedido() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("empresaId", empresa.perfilId());
        m.put("tipoEvento", "CASAMENTO");
        m.put("dataEvento", LocalDate.now().plusMonths(6).toString());
        m.put("qtdConvidados", 120);
        m.put("local", "Espaço Jardim das Oliveiras, Cotia");
        m.put("servicoIds", List.of(servicoId));
        m.put("orcamentoMin", 8000);
        m.put("orcamentoMax", 12000);
        m.put("mensagem", "Queremos uma celebração ao ar livre.");
        m.put("aceiteContato", true);
        return m;
    }

    ResultActions enviar(Conta conta, Object corpo) throws Exception {
        return mvc.perform(post("/api/v1/solicitacoes").header("Authorization", conta.bearer())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo)));
    }

    long criarSolicitacao() throws Exception {
        String body = enviar(cliente, pedido()).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("id").asLong();
    }

    ResultActions mudarStatus(Conta conta, long id, String novo) throws Exception {
        return mvc.perform(patch("/api/v1/solicitacoes/" + id + "/status").header("Authorization", conta.bearer())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("status", novo))));
    }

    ResultActions proposta(Conta conta, long id, int valor) throws Exception {
        return mvc.perform(post("/api/v1/solicitacoes/" + id + "/propostas").header("Authorization", conta.bearer())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("valor", valor, "descricao", "Projeto completo com montagem"))));
    }

    ResultActions responder(Conta conta, long propostaId, String resposta) throws Exception {
        return mvc.perform(patch("/api/v1/propostas/" + propostaId).header("Authorization", conta.bearer())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("status", resposta))));
    }

    JsonNode detalhe(Conta conta, long id) throws Exception {
        return json.readTree(mvc.perform(get("/api/v1/solicitacoes/" + id).header("Authorization", conta.bearer()))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
    }

    @Test
    void fluxoCompletoAteConcluir() throws Exception {
        // cliente envia; a conversa nasce junto
        String body = enviar(cliente, pedido())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andExpect(jsonPath("$.conversaId", notNullValue()))
                .andExpect(jsonPath("$.servicos[*].nome", contains("Decoração completa")))
                .andExpect(jsonPath("$.empresa.nomeFantasia").value("Ateliê Aurora"))
                .andReturn().getResponse().getContentAsString();
        long id = json.readTree(body).get("id").asLong();

        // empresa vê nas recebidas
        mvc.perform(get("/api/v1/solicitacoes/me").param("status", "PENDENTE").header("Authorization", empresa.bearer()))
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].cliente.nome").value("Marina Alves"));

        mudarStatus(empresa, id, "EM_ANALISE").andExpect(status().isOk()).andExpect(jsonPath("$.status").value("EM_ANALISE"));

        // proposta → EM_NEGOCIACAO; segunda proposta com uma em aberto → 409
        String comProposta = proposta(empresa, id, 10500).andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("EM_NEGOCIACAO"))
                .andExpect(jsonPath("$.propostaAtual.valor").value(10500.0))
                .andExpect(jsonPath("$.propostaAtual.status").value("ENVIADA"))
                .andReturn().getResponse().getContentAsString();
        long p1 = json.readTree(comProposta).get("propostaAtual").get("id").asLong();
        proposta(empresa, id, 9000).andExpect(status().isConflict());

        // cliente recusa: segue em negociação e a empresa pode propor de novo
        responder(cliente, p1, "RECUSADA").andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EM_NEGOCIACAO"))
                .andExpect(jsonPath("$.propostas[0].status").value("RECUSADA"));
        String nova = proposta(empresa, id, 9800).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long p2 = json.readTree(nova).get("propostaAtual").get("id").asLong();
        responder(cliente, p1, "ACEITA").andExpect(status().isConflict()); // proposta antiga

        // cliente aceita → ACEITA (e o cliente vê a atualização)
        responder(cliente, p2, "ACEITA").andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ACEITA"));
        mvc.perform(get("/api/v1/solicitacoes/me").param("status", "EM_NEGOCIACAO,ACEITA")
                        .header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$[0].status").value("ACEITA"))
                .andExpect(jsonPath("$[0].propostaAtual.valor").value(9800.0));

        // depois de aceita, o cliente não cancela
        mvc.perform(patch("/api/v1/solicitacoes/" + id + "/cancelar").header("Authorization", cliente.bearer()))
                .andExpect(status().isConflict());

        mudarStatus(empresa, id, "CONCLUIDA").andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CONCLUIDA"));

        // conta no perfil público e o serviço não pode mais ser excluído
        mvc.perform(get("/api/v1/empresas/" + empresa.perfilId()).header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.indicadores.eventosRealizados").value(1));
        mvc.perform(delete("/api/v1/servicos/" + servicoId).header("Authorization", empresa.bearer()))
                .andExpect(status().isConflict());
    }

    @Test
    void transicoesInvalidasRetornam409() throws Exception {
        long id = criarSolicitacao();
        mudarStatus(empresa, id, "CONCLUIDA").andExpect(status().isConflict())
                .andExpect(jsonPath("$.erro").value("CONFLITO"))
                .andExpect(jsonPath("$.mensagem").value("Não é possível mudar de pendente para concluída"));
        mudarStatus(empresa, id, "ACEITA").andExpect(status().isConflict());
        mudarStatus(empresa, id, "EM_NEGOCIACAO").andExpect(status().isConflict());

        mudarStatus(empresa, id, "RECUSADA").andExpect(status().isOk());
        mudarStatus(empresa, id, "EM_ANALISE").andExpect(status().isConflict());
        proposta(empresa, id, 1000).andExpect(status().isConflict());
        mvc.perform(patch("/api/v1/solicitacoes/" + id + "/cancelar").header("Authorization", cliente.bearer()))
                .andExpect(status().isConflict());
    }

    @Test
    void clienteCancelaAntesDeAceitar() throws Exception {
        long id = criarSolicitacao();
        proposta(empresa, id, 5000).andExpect(status().isCreated());
        mvc.perform(patch("/api/v1/solicitacoes/" + id + "/cancelar").header("Authorization", cliente.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADA"))
                .andExpect(jsonPath("$.propostas[0].status").value("RECUSADA"));
    }

    @Test
    void apenasEnvolvidosAcessam() throws Exception {
        long id = criarSolicitacao();
        mvc.perform(get("/api/v1/solicitacoes/" + id).header("Authorization", outroCliente.bearer()))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/solicitacoes/" + id).header("Authorization", outraEmpresa.bearer()))
                .andExpect(status().isForbidden());
        mudarStatus(outraEmpresa, id, "EM_ANALISE").andExpect(status().isForbidden());
        proposta(outraEmpresa, id, 1000).andExpect(status().isForbidden());
        mvc.perform(patch("/api/v1/solicitacoes/" + id + "/cancelar").header("Authorization", outroCliente.bearer()))
                .andExpect(status().isForbidden());

        // papéis trocados
        mudarStatus(cliente, id, "EM_ANALISE").andExpect(status().isForbidden());
        enviar(empresa, pedido()).andExpect(status().isForbidden());

        // listas não vazam
        mvc.perform(get("/api/v1/solicitacoes/me").header("Authorization", outroCliente.bearer()))
                .andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(get("/api/v1/solicitacoes/me").header("Authorization", outraEmpresa.bearer()))
                .andExpect(jsonPath("$", hasSize(0)));
        assertThat(detalhe(empresa, id).get("cliente").get("email").asText()).isEqualTo(cliente.email());
    }

    @Test
    void validacoesDoPedido() throws Exception {
        Map<String, Object> m = pedido();
        m.put("dataEvento", LocalDate.now().minusDays(1).toString());
        m.put("qtdConvidados", 0);
        m.put("local", "");
        m.put("aceiteContato", false);
        enviar(cliente, m).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.dataEvento").value("A data do evento não pode estar no passado"))
                .andExpect(jsonPath("$.campos.qtdConvidados").value("Informe ao menos 1 convidado"))
                .andExpect(jsonPath("$.campos.local").value("Informe o local do evento"))
                .andExpect(jsonPath("$.campos.aceiteContato").value("Autorize o contato da empresa para enviar"));

        Map<String, Object> servicoDeOutra = pedido();
        servicoDeOutra.put("servicoIds", List.of(criarServico(outraEmpresa, "Alheio")));
        enviar(cliente, servicoDeOutra).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.servicoIds").value("Escolha serviços oferecidos por esta empresa"));

        Map<String, Object> faixa = pedido();
        faixa.put("orcamentoMin", 20000);
        enviar(cliente, faixa).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.orcamentoMax").exists());
    }

    @Test
    void anexosDeInspiracao() throws Exception {
        long id = criarSolicitacao();
        var png = new MockMultipartFile("arquivo", "i.png", "image/png", new byte[] {(byte) 0x89, 'P', 'N', 'G'});
        mvc.perform(multipart("/api/v1/solicitacoes/" + id + "/anexos").file(png).header("Authorization", cliente.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.anexos", hasSize(1)))
                .andExpect(jsonPath("$.anexos[0].url", startsWith("/files/inspiracoes/")));
        mvc.perform(multipart("/api/v1/solicitacoes/" + id + "/anexos").file(png).header("Authorization", outroCliente.bearer()))
                .andExpect(status().isForbidden());
    }

    @Test
    void painelDaEmpresa() throws Exception {
        long a = criarSolicitacao();
        long b = criarSolicitacao();
        criarSolicitacao();
        long cancelada = criarSolicitacao();
        mudarStatus(empresa, a, "EM_ANALISE");
        proposta(empresa, b, 3000);
        mvc.perform(patch("/api/v1/solicitacoes/" + cancelada + "/cancelar").header("Authorization", cliente.bearer()));
        mvc.perform(get("/api/v1/empresas/" + empresa.perfilId()).header("Authorization", cliente.bearer()));

        mvc.perform(get("/api/v1/empresas/me/dashboard").header("Authorization", empresa.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dias").value(30))
                .andExpect(jsonPath("$.solicitacoes").value(4))
                .andExpect(jsonPath("$.visualizacoes").value(1))
                // respondidas: a e b (2) de 3 não canceladas
                .andExpect(jsonPath("$.taxaResposta").value(67))
                .andExpect(jsonPath("$.pendentes").value(1))
                .andExpect(jsonPath("$.servicosAtivos").value(1))
                .andExpect(jsonPath("$.variacaoSolicitacoes").doesNotExist());

        mvc.perform(get("/api/v1/empresas/me/dashboard").header("Authorization", cliente.bearer()))
                .andExpect(status().isForbidden());
    }
}
