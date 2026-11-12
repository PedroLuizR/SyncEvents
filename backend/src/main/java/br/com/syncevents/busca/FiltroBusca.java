package br.com.syncevents.busca;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Parâmetros já normalizados da busca de empresas. */
public record FiltroBusca(List<String> termos, Long categoriaId, String cidade, OrdenacaoBusca ordenacao, int pagina,
        int tamanho) {

    static final int TAMANHO_MAXIMO = 50;
    private static final Set<String> PALAVRAS_IGNORADAS = Set.of(
            "a", "o", "as", "os", "de", "da", "do", "das", "dos", "e", "em", "na", "no", "para", "pra", "com", "um",
            "uma", "por");

    public static FiltroBusca de(String q, Long categoriaId, String cidade, String ordenar, Integer pagina,
            Integer tamanho) {
        int p = pagina == null || pagina < 0 ? 0 : pagina;
        int t = tamanho == null || tamanho < 1 ? 20 : Math.min(tamanho, TAMANHO_MAXIMO);
        String c = cidade == null || cidade.isBlank() ? null : normalizar(cidade.split(",")[0]);
        return new FiltroBusca(termos(q), categoriaId, c, OrdenacaoBusca.de(ordenar), p, t);
    }

    /** "Decoração para casamento" → ["decoracao", "casamento"] (sem acento, minúsculo, sem palavras vazias). */
    static List<String> termos(String q) {
        if (q == null || q.isBlank()) {
            return List.of();
        }
        return Arrays.stream(normalizar(q).split("[^\\p{Alnum}]+"))
                .filter(t -> t.length() >= 2 && !PALAVRAS_IGNORADAS.contains(t))
                .distinct()
                .limit(6)
                .toList();
    }

    /** Minúsculo e sem acento (mesmo resultado do lower(unaccent(...)) do Postgres para o português). */
    static String normalizar(String texto) {
        return Normalizer.normalize(texto.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }
}
