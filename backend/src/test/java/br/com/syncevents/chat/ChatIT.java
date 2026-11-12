package br.com.syncevents.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.lang.reflect.Type;
import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.syncevents.ContasDeTeste;
import br.com.syncevents.ContasDeTeste.Conta;
import br.com.syncevents.IntegrationTest;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ChatIT extends IntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @LocalServerPort
    int porta;

    Conta empresa;
    Conta cliente;
    Conta intruso;
    long solicitacaoId;
    long conversaId;

    @BeforeEach
    void setUp() throws Exception {
        var contas = new ContasDeTeste(mvc, json);
        empresa = contas.empresa("Ateliê Chat");
        cliente = contas.cliente();
        intruso = contas.cliente();
        var pedido = Map.of("empresaId", empresa.perfilId(), "tipoEvento", "CASAMENTO",
                "dataEvento", LocalDate.now().plusMonths(3).toString(), "qtdConvidados", 80,
                "local", "Sítio", "aceiteContato", true);
        String body = mvc.perform(post("/api/v1/solicitacoes").header("Authorization", cliente.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(pedido)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        JsonNode s = json.readTree(body);
        solicitacaoId = s.get("id").asLong();
        conversaId = s.get("conversaId").asLong();
    }

    JsonNode enviarRest(Conta conta, String texto) throws Exception {
        return json.readTree(mvc.perform(post("/api/v1/conversas/" + conversaId + "/mensagens")
                        .header("Authorization", conta.bearer()).contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("conteudo", texto))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
    }

    @Test
    void conversaNasceComASolicitacaoEMensagensPorRest() throws Exception {
        enviarRest(cliente, "Olá! Vocês atendem em Cotia?");

        mvc.perform(get("/api/v1/conversas").header("Authorization", empresa.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(conversaId))
                .andExpect(jsonPath("$[0].solicitacaoId").value(solicitacaoId))
                .andExpect(jsonPath("$[0].contato.nome").value("Marina Alves"))
                .andExpect(jsonPath("$[0].ultimaMensagem.conteudo").value("Olá! Vocês atendem em Cotia?"))
                .andExpect(jsonPath("$[0].naoLidas").value(1));

        mvc.perform(get("/api/v1/conversas/" + conversaId).header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.contato.nome").value("Ateliê Chat"))
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andExpect(jsonPath("$.naoLidas").value(0));

        mvc.perform(patch("/api/v1/conversas/" + conversaId + "/lidas").header("Authorization", empresa.bearer()))
                .andExpect(jsonPath("$.marcadas").value(1));
        mvc.perform(get("/api/v1/conversas").header("Authorization", empresa.bearer()))
                .andExpect(jsonPath("$[0].naoLidas").value(0));
        mvc.perform(get("/api/v1/conversas/" + conversaId + "/mensagens").header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.mensagens[0].lida").value(true));
    }

    @Test
    void propostaApareceNoChatEAtualizaQuandoRespondida() throws Exception {
        String body = mvc.perform(post("/api/v1/solicitacoes/" + solicitacaoId + "/propostas")
                        .header("Authorization", empresa.bearer()).contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("valor", 10500, "descricao", "Pacote completo"))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long propostaId = json.readTree(body).get("propostaAtual").get("id").asLong();

        mvc.perform(get("/api/v1/conversas/" + conversaId + "/mensagens").header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.mensagens", hasSize(1)))
                .andExpect(jsonPath("$.mensagens[0].tipo").value("PROPOSTA"))
                .andExpect(jsonPath("$.mensagens[0].proposta.valor").value(10500.0))
                .andExpect(jsonPath("$.mensagens[0].proposta.status").value("ENVIADA"));

        mvc.perform(patch("/api/v1/propostas/" + propostaId).header("Authorization", cliente.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"ACEITA\"}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/v1/conversas/" + conversaId + "/mensagens").header("Authorization", empresa.bearer()))
                .andExpect(jsonPath("$.mensagens[0].proposta.status").value("ACEITA"));
    }

    @Test
    void historicoPaginado() throws Exception {
        for (int i = 1; i <= 35; i++) {
            enviarRest(i % 2 == 0 ? cliente : empresa, "msg " + i);
        }
        JsonNode p1 = json.readTree(mvc.perform(get("/api/v1/conversas/" + conversaId + "/mensagens")
                        .param("size", "30").header("Authorization", cliente.bearer()))
                .andReturn().getResponse().getContentAsString());
        assertThat(p1.get("mensagens")).hasSize(30);
        assertThat(p1.get("temMais").asBoolean()).isTrue();
        assertThat(p1.get("mensagens").get(0).get("conteudo").asText()).isEqualTo("msg 6");   // ordem cronológica
        assertThat(p1.get("mensagens").get(29).get("conteudo").asText()).isEqualTo("msg 35");

        long maisAntiga = p1.get("mensagens").get(0).get("id").asLong();
        mvc.perform(get("/api/v1/conversas/" + conversaId + "/mensagens").param("antesDe", String.valueOf(maisAntiga))
                        .param("size", "30").header("Authorization", cliente.bearer()))
                .andExpect(jsonPath("$.mensagens", hasSize(5)))
                .andExpect(jsonPath("$.mensagens[0].conteudo").value("msg 1"))
                .andExpect(jsonPath("$.temMais").value(false));
    }

    @Test
    void usuarioDeForaRecebe403() throws Exception {
        mvc.perform(get("/api/v1/conversas/" + conversaId).header("Authorization", intruso.bearer()))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/conversas/" + conversaId + "/mensagens").header("Authorization", intruso.bearer()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensagem").value("Você não participa desta conversa"));
        mvc.perform(post("/api/v1/conversas/" + conversaId + "/mensagens").header("Authorization", intruso.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"conteudo\":\"oi\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/v1/conversas/" + conversaId + "/lidas").header("Authorization", intruso.bearer()))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/conversas").header("Authorization", intruso.bearer()))
                .andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(post("/api/v1/conversas/" + conversaId + "/mensagens").header("Authorization", cliente.bearer())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"conteudo\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.conteudo").value("Escreva uma mensagem"));
    }

    // ------------------------------------------------------------- WebSocket (STOMP)

    WebSocketStompClient clienteStomp() {
        var stomp = new WebSocketStompClient(new StandardWebSocketClient());
        var conversor = new MappingJackson2MessageConverter();
        conversor.setObjectMapper(json);
        stomp.setMessageConverter(conversor);
        return stomp;
    }

    StompSession conectar(String token) throws Exception {
        StompHeaders connect = new StompHeaders();
        if (token != null) {
            connect.add("Authorization", "Bearer " + token);
        }
        return clienteStomp().connectAsync("ws://localhost:" + porta + "/ws", new WebSocketHttpHeaders(), connect,
                new StompSessionHandlerAdapter() {
                }).get(5, TimeUnit.SECONDS);
    }

    BlockingQueue<Map<String, Object>> assinar(StompSession sessao, long conversa) {
        BlockingQueue<Map<String, Object>> fila = new LinkedBlockingQueue<>();
        sessao.subscribe("/topic/conversas/" + conversa, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return Map.class;
            }

            @Override
            @SuppressWarnings("unchecked")
            public void handleFrame(StompHeaders headers, Object payload) {
                fila.add((Map<String, Object>) payload);
            }
        });
        return fila;
    }

    @Test
    void clienteEEmpresaTrocamMensagensEmTempoReal() throws Exception {
        StompSession sCliente = conectar(cliente.token());
        StompSession sEmpresa = conectar(empresa.token());
        var filaCliente = assinar(sCliente, conversaId);
        var filaEmpresa = assinar(sEmpresa, conversaId);
        Thread.sleep(300); // garante que as assinaturas foram registradas

        sCliente.send("/app/conversas/" + conversaId, Map.of("conteudo", "Olá, tudo bem?"));
        Map<String, Object> recebida = filaEmpresa.poll(5, TimeUnit.SECONDS);
        assertThat(recebida).isNotNull();
        assertThat(recebida.get("conteudo")).isEqualTo("Olá, tudo bem?");
        assertThat(filaCliente.poll(5, TimeUnit.SECONDS)).as("o remetente também recebe (eco)").isNotNull();

        // mensagem enviada por REST também chega em tempo real
        enviarRest(empresa, "Tudo ótimo! Vamos conversar.");
        assertThat(filaCliente.poll(5, TimeUnit.SECONDS).get("conteudo")).isEqualTo("Tudo ótimo! Vamos conversar.");

        // proposta chega como mensagem PROPOSTA
        mvc.perform(post("/api/v1/solicitacoes/" + solicitacaoId + "/propostas").header("Authorization", empresa.bearer())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("valor", 5000, "descricao", "Proposta inicial"))));
        Map<String, Object> proposta = filaCliente.poll(5, TimeUnit.SECONDS);
        assertThat(proposta.get("tipo")).isEqualTo("PROPOSTA");

        sCliente.disconnect();
        sEmpresa.disconnect();
    }

    @Test
    void semTokenOuDeForaNaoConecta() throws Exception {
        assertThatThrownBy(() -> {
            StompSession s = conectar(null);
            // alguns servidores aceitam o handshake e fecham logo após o ERROR do CONNECT
            Thread.sleep(500);
            assertThat(s.isConnected()).isFalse();
            throw new IllegalStateException("desconectado");
        }).isNotNull();

        StompSession sIntruso = conectar(intruso.token());
        var filaIntruso = assinar(sIntruso, conversaId);
        Thread.sleep(500);
        enviarRest(cliente, "segredo");
        assertThat(filaIntruso.poll(1, TimeUnit.SECONDS)).as("intruso não recebe mensagens").isNull();
        assertThat(sIntruso.isConnected()).as("assinatura negada encerra a sessão").isFalse();
    }

}
