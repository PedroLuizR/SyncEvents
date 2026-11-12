package br.com.syncevents.seed;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.syncevents.IntegrationTest;
import br.com.syncevents.categoria.CategoriaRepository;
import br.com.syncevents.cliente.ClienteRepository;
import br.com.syncevents.empresa.CodigoEmpresaGenerator;
import br.com.syncevents.empresa.EmpresaRepository;
import br.com.syncevents.empresa.PortfolioFotoRepository;
import br.com.syncevents.servico.ServicoRepository;
import br.com.syncevents.storage.StorageService;
import br.com.syncevents.usuario.UsuarioRepository;

/** O seed não roda no perfil de teste; aqui ele é executado à mão para conferir o resultado. */
class DemoSeederIT extends IntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UsuarioRepository usuarios;
    @Autowired ClienteRepository clientes;
    @Autowired EmpresaRepository empresas;
    @Autowired CategoriaRepository categorias;
    @Autowired ServicoRepository servicos;
    @Autowired PortfolioFotoRepository portfolio;
    @Autowired CodigoEmpresaGenerator codigos;
    @Autowired PasswordEncoder encoder;
    @Autowired StorageService storage;

    @Test
    void criaOsDadosUmaVezEOClienteDemoConsegueBuscar() throws Exception {
        var seeder = new DemoSeeder(usuarios, clientes, empresas, categorias, servicos, portfolio, codigos, encoder,
                storage);
        seeder.semear();
        assertThat(seeder.semear()).as("segunda execução não duplica").isFalse();

        String body = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("login", DemoSeeder.EMAIL_CLIENTE,
                                "senha", DemoSeeder.SENHA, "tipo", "CLIENTE"))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String token = "Bearer " + json.readTree(body).get("token").asText();

        String busca = mvc.perform(get("/api/v1/empresas").param("q", "ateliê aurora").header("Authorization", token))
                .andExpect(jsonPath("$.conteudo[0].nomeFantasia").value("Ateliê Aurora Eventos"))
                .andExpect(jsonPath("$.conteudo[0].precoAPartirDe").value(2800.0))
                .andReturn().getResponse().getContentAsString();
        var aurora = json.readTree(busca).get("conteudo").get(0);

        mvc.perform(get(aurora.get("capaUrl").asText())).andExpect(status().isOk());
        mvc.perform(get("/api/v1/empresas/" + aurora.get("id").asLong()).header("Authorization", token))
                .andExpect(jsonPath("$.servicos.length()").value(2))
                .andExpect(jsonPath("$.portfolio.length()").value(4))
                .andExpect(jsonPath("$.servicos[0].fotos.length()").value(2));

        mvc.perform(get("/api/v1/empresas/recomendadas").header("Authorization", token))
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(5)));
    }
}
