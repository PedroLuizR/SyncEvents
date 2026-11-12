package br.com.syncevents.common;

import java.util.List;

/** Página de resultados. {@code pagina} começa em 0. */
public record Pagina<T>(List<T> conteudo, int pagina, int tamanho, long total, int totalPaginas, boolean ultima) {

    public static <T> Pagina<T> de(List<T> conteudo, int pagina, int tamanho, long total) {
        int totalPaginas = tamanho == 0 ? 0 : (int) Math.ceil((double) total / tamanho);
        return new Pagina<>(conteudo, pagina, tamanho, total, totalPaginas, pagina + 1 >= totalPaginas);
    }
}
