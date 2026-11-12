package br.com.syncevents;

import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

/** Gera dados únicos para os testes (o banco é compartilhado entre as classes). */
public final class TestData {

    private static final AtomicInteger SEQ = new AtomicInteger();

    private TestData() {
    }

    public static String email(String prefixo) {
        return prefixo + "." + System.nanoTime() + "." + SEQ.incrementAndGet() + "@teste.com";
    }

    /** CNPJ aleatório com dígitos verificadores corretos (só dígitos). */
    public static String cnpjValido() {
        StringBuilder base = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            base.append(ThreadLocalRandom.current().nextInt(10));
        }
        base.append("0001");
        base.append(dv(base.toString(), new int[] {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}));
        base.append(dv(base.toString(), new int[] {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}));
        return base.toString();
    }

    public static String mascararCnpj(String d) {
        return "%s.%s.%s/%s-%s".formatted(d.substring(0, 2), d.substring(2, 5), d.substring(5, 8),
                d.substring(8, 12), d.substring(12));
    }

    private static int dv(String s, int[] pesos) {
        int soma = 0;
        for (int i = 0; i < pesos.length; i++) {
            soma += (s.charAt(i) - '0') * pesos[i];
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
