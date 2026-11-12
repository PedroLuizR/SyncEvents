package br.com.syncevents.config;

import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configurações próprias da aplicação (prefixo {@code app}). */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Cors cors, Storage storage, Jwt jwt) {

    public record Cors(List<String> allowedOrigins) {
    }

    /** Pasta local dos uploads, servida em /files/**. */
    public record Storage(String diretorio) {
    }

    /** Segredo (mín. 32 caracteres) e validade do token. */
    public record Jwt(String segredo, Duration validade) {
    }
}
