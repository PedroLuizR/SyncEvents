package br.com.syncevents.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configurações próprias da aplicação (prefixo {@code app}). */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Cors cors, Storage storage) {

    public record Cors(List<String> allowedOrigins) {
    }

    /** Pasta local dos uploads, servida em /files/** (Fase 2). */
    public record Storage(String diretorio) {
    }
}
