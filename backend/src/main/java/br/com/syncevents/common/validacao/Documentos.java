package br.com.syncevents.common.validacao;

/** Utilitários para documentos e telefones brasileiros. */
public final class Documentos {

    private Documentos() {
    }

    public static String apenasDigitos(String valor) {
        return valor == null ? null : valor.replaceAll("\\D", "");
    }

    /**
     * CNPJ com 14 dígitos (com ou sem máscara). Os dígitos verificadores
     * <b>não</b> são conferidos, por decisão do projeto (ver docs/decisoes.md).
     */
    public static boolean cnpjValido(String valor) {
        if (valor == null || !valor.matches("[\\d./\\-\\s]+")) {
            return false;
        }
        return apenasDigitos(valor).length() == 14;
    }

    /** Telefone com DDD: 10 (fixo) ou 11 (celular) dígitos. */
    public static boolean telefoneValido(String valor) {
        String d = apenasDigitos(valor);
        return d != null && (d.length() == 10 || d.length() == 11) && d.charAt(0) != '0';
    }
}
