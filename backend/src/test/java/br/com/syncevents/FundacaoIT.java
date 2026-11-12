package br.com.syncevents;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;

class FundacaoIT extends IntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    JdbcTemplate jdbc;

    @Test
    void healthEstaUp() throws Exception {
        mvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void flywayAplicouAsMigrations() {
        Integer versoes = jdbc.queryForObject(
                "select count(*) from flyway_schema_history where success", Integer.class);
        assertThat(versoes).isPositive();
        String semAcento = jdbc.queryForObject("select unaccent('Decoração')", String.class);
        assertThat(semAcento).isEqualTo("Decoracao");
    }

    @Test
    void openApiEstaPublico() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("SyncEvents API"));
    }

    @Test
    void rotaProtegidaSemTokenRetorna401NoFormatoPadrao() throws Exception {
        mvc.perform(get("/api/v1/solicitacoes/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.erro").value("NAO_AUTENTICADO"))
                .andExpect(jsonPath("$.mensagem").value("Faça login para continuar"));
    }

    @Test
    void corsPermiteOrigemConfigurada() throws Exception {
        mvc.perform(options("/api/v1/categorias")
                        .header("Origin", "http://localhost:8081")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:8081"));
    }

    @Test
    void corsBloqueiaOrigemDesconhecida() throws Exception {
        mvc.perform(options("/api/v1/categorias")
                        .header("Origin", "http://malicioso.example")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    void rotaPublicaInexistenteRetorna404NoFormatoPadrao() throws Exception {
        mvc.perform(get("/api/v1/categorias/nao-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("NAO_ENCONTRADO"));
    }

    @Test
    void openApiDeclaraAutenticacaoBearer() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.bearerFormat").value("JWT"));
    }
}
