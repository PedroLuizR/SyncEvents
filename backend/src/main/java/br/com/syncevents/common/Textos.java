package br.com.syncevents.common;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Normalizações de texto usadas pelos services. */
public final class Textos {

    private static final Pattern CIDADE_UF = Pattern.compile(".*,\\s*([A-Za-z]{2})\\s*$");

    private Textos() {
    }

    public static String vazioParaNulo(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    public static String normalizarEspacos(String valor) {
        return valor.trim().replaceAll("\\s+", " ");
    }

    /** "São Paulo, SP" → "SP"; sem UF → null. */
    public static String extrairUf(String cidade) {
        Matcher m = CIDADE_UF.matcher(cidade);
        return m.matches() ? m.group(1).toUpperCase(Locale.ROOT) : null;
    }
}
