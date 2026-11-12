package br.com.syncevents.busca;

import java.util.Locale;

public enum OrdenacaoBusca {
    RELEVANCIA,
    NOTA,
    PRECO;

    public static OrdenacaoBusca de(String valor) {
        if (valor == null || valor.isBlank()) {
            return RELEVANCIA;
        }
        try {
            return valueOf(valor.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return RELEVANCIA;
        }
    }
}
