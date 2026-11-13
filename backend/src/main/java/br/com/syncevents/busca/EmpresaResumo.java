package br.com.syncevents.busca;

import java.math.BigDecimal;
import java.util.List;

import br.com.syncevents.categoria.CategoriaResponse;

/**
 * Card de empresa nas listas (busca e recomendados).
 *
 * @param nota            média das avaliações com 1 casa (null sem avaliações)
 * @param precoAPartirDe  menor preço entre os serviços publicados com preço
 */
public record EmpresaResumo(
        Long id,
        String nomeFantasia,
        String logoUrl,
        String capaUrl,
        String cidade,
        List<CategoriaResponse> categorias,
        BigDecimal nota,
        long totalAvaliacoes,
        BigDecimal precoAPartirDe) {
}
