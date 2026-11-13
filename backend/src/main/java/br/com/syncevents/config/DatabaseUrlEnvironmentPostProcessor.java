package br.com.syncevents.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Aceita o banco no formato que serviços como Railway, Render, Fly.io e Heroku entregam:
 * {@code DATABASE_URL=postgresql://usuario:senha@host:porta/banco} (ou {@code postgres://...}).
 * <p>
 * Converte para {@code spring.datasource.url/username/password}. Se {@code DB_URL} (JDBC) estiver
 * definida, ela tem prioridade e nada é feito.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    static final String FONTE = "databaseUrl";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication application) {
        String databaseUrl = env.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank() || env.getProperty("DB_URL") != null) {
            return;
        }
        Map<String, Object> props = converter(databaseUrl);
        if (!props.isEmpty()) {
            env.getPropertySources().addFirst(new MapPropertySource(FONTE, props));
        }
    }

    /** {@code postgresql://u:s@host:5432/db?sslmode=require} → url JDBC, usuário e senha. */
    static Map<String, Object> converter(String databaseUrl) {
        Map<String, Object> props = new HashMap<>();
        String url = databaseUrl.trim();
        if (url.startsWith("jdbc:")) {
            props.put("spring.datasource.url", url);
            return props;
        }
        if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
            return props;
        }
        URI uri = URI.create(url.replaceFirst("^postgres(ql)?://", "http://"));
        int porta = uri.getPort() == -1 ? 5432 : uri.getPort();
        String jdbc = "jdbc:postgresql://" + uri.getHost() + ":" + porta + uri.getRawPath();
        if (uri.getRawQuery() != null) {
            jdbc += "?" + uri.getRawQuery();
        }
        props.put("spring.datasource.url", jdbc);
        String userInfo = uri.getRawUserInfo();
        if (userInfo != null) {
            String[] partes = userInfo.split(":", 2);
            props.put("spring.datasource.username", URLDecoder.decode(partes[0], StandardCharsets.UTF_8));
            if (partes.length > 1) {
                props.put("spring.datasource.password", URLDecoder.decode(partes[1], StandardCharsets.UTF_8));
            }
        }
        return props;
    }
}
