package br.com.syncevents.categoria;

public record CategoriaResponse(Long id, String nome, String icone) {

    public static CategoriaResponse de(Categoria c) {
        return new CategoriaResponse(c.getId(), c.getNome(), c.getIcone());
    }
}
