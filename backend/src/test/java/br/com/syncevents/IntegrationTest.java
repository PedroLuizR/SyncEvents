package br.com.syncevents;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Base dos testes de integração.
 * <p>
 * Por padrão sobe um PostgreSQL 16 com Testcontainers (precisa de Docker).
 * Se a variável {@code TEST_DB_URL} estiver definida, usa esse banco no lugar
 * (com {@code TEST_DB_USER} / {@code TEST_DB_PASSWORD}), útil em CI sem Docker.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTest {

    private static PostgreSQLContainer<?> postgres;

    @DynamicPropertySource
    static void datasource(DynamicPropertyRegistry registry) {
        String url = System.getenv("TEST_DB_URL");
        if (url != null && !url.isBlank()) {
            registry.add("spring.datasource.url", () -> url);
            registry.add("spring.datasource.username", () -> env("TEST_DB_USER", "syncevents"));
            registry.add("spring.datasource.password", () -> env("TEST_DB_PASSWORD", "syncevents"));
            return;
        }
        PostgreSQLContainer<?> container = container();
        registry.add("spring.datasource.url", container::getJdbcUrl);
        registry.add("spring.datasource.username", container::getUsername);
        registry.add("spring.datasource.password", container::getPassword);
    }

    private static synchronized PostgreSQLContainer<?> container() {
        if (postgres == null) {
            postgres = new PostgreSQLContainer<>("postgres:16-alpine");
            postgres.start(); // reutilizado por todas as classes de teste; o Ryuk encerra no fim
        }
        return postgres;
    }

    private static String env(String nome, String padrao) {
        String valor = System.getenv(nome);
        return valor == null || valor.isBlank() ? padrao : valor;
    }
}
