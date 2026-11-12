package br.com.syncevents.common.validacao;

/** Utilitários para documentos e telefones brasileiros. */
public final class Documentos {

    private Documentos() {
    }

    public static String apenasDigitos(String valor) {
        return valor == null ? null : valor.replaceAll("\\D", "");
    }

    /** CNPJ com 14 dígitos e dígitos verificadores corretos. */
    public static boolean cnpjValido(String valor) {
        String cnpj = apenasDigitos(valor);
        if (cnpj == null || cnpj.length() != 14 || cnpj.chars().distinct().count() == 1) {
            return false;
        }
        int[] pesos1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] pesos2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        return digito(cnpj, pesos1) == cnpj.charAt(12) - '0'
                && digito(cnpj, pesos2) == cnpj.charAt(13) - '0';
    }

    private static int digito(String cnpj, int[] pesos) {
        int soma = 0;
        for (int i = 0; i < pesos.length; i++) {
            soma += (cnpj.charAt(i) - '0') * pesos[i];
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    /** Telefone com DDD: 10 (fixo) ou 11 (celular) dígitos. */
    public static boolean telefoneValido(String valor) {
        String d = apenasDigitos(valor);
        return d != null && (d.length() == 10 || d.length() == 11) && d.charAt(0) != '0';
    }
}
