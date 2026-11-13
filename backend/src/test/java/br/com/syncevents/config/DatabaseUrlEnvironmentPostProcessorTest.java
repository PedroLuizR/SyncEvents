package br.com.syncevents.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.env.MapPropertySource;

class DatabaseUrlEnvironmentPostProcessorTest {

    @Test
    void converteOFormatoDoRailway() {
        Map<String, Object> p = DatabaseUrlEnvironmentPostProcessor
                .converter("postgresql://postgres:s3nh%40forte@containers-us-west-1.railway.app:6543/railway");
        assertThat(p).containsEntry("spring.datasource.url",
                        "jdbc:postgresql://containers-us-west-1.railway.app:6543/railway")
                .containsEntry("spring.datasource.username", "postgres")
                .containsEntry("spring.datasource.password", "s3nh@forte");
    }

    @Test
    void aceitaPostgresSemPortaEComParametros() {
        Map<String, Object> p = DatabaseUrlEnvironmentPostProcessor
                .converter("postgres://u:p@db.exemplo.com/app?sslmode=require");
        assertThat(p).containsEntry("spring.datasource.url", "jdbc:postgresql://db.exemplo.com:5432/app?sslmode=require");
    }

    @Test
    void jdbcPassaDireto() {
        assertThat(DatabaseUrlEnvironmentPostProcessor.converter("jdbc:postgresql://h:5432/db"))
                .containsEntry("spring.datasource.url", "jdbc:postgresql://h:5432/db");
        assertThat(DatabaseUrlEnvironmentPostProcessor.converter("mysql://x")).isEmpty();
    }

    @Test
    void dbUrlTemPrioridade() {
        var env = new StandardEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("teste",
                Map.of("DATABASE_URL", "postgresql://u:p@h:5432/db", "DB_URL", "jdbc:postgresql://outro:5432/x")));
        new DatabaseUrlEnvironmentPostProcessor().postProcessEnvironment(env, null);
        assertThat(env.getPropertySources().contains(DatabaseUrlEnvironmentPostProcessor.FONTE)).isFalse();

        var env2 = new StandardEnvironment();
        env2.getPropertySources().addFirst(new MapPropertySource("teste",
                Map.of("DATABASE_URL", "postgresql://u:p@h:5432/db")));
        new DatabaseUrlEnvironmentPostProcessor().postProcessEnvironment(env2, null);
        assertThat(env2.getProperty("spring.datasource.url")).isEqualTo("jdbc:postgresql://h:5432/db");
        assertThat(env2.getProperty("spring.datasource.username")).isEqualTo("u");
    }
}
