package br.com.syncevents.busca;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import br.com.syncevents.categoria.CategoriaResponse;

/**
 * Consultas de descoberta em SQL (busca textual sem acento, relevância e agregações).
 * Avaliações entram na Fase 6: até lá a nota é nula e o total é zero.
 */
@Repository
public class BuscaRepository {

    /** Serviço visível para clientes. */
    private static final String SERVICO_VISIVEL = "s.empresa_id = e.id AND s.ativo AND NOT s.rascunho";

    private static final String PRECO_A_PARTIR_DE = """
            (SELECT min(s.preco_min) FROM servico s
              WHERE %s AND s.modelo_preco <> 'SOB_CONSULTA' AND s.preco_min IS NOT NULL)""".formatted(SERVICO_VISIVEL);

    private final NamedParameterJdbcTemplate jdbc;

    public BuscaRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record Resultado(List<EmpresaResumo> empresas, long total) {
    }

    public Resultado buscar(FiltroBusca f) {
        MapSqlParameterSource params = new MapSqlParameterSource();
        List<String> where = new ArrayList<>();
        where.add("u.ativo");

        // Cada termo precisa aparecer em algum lugar; a relevância soma os pesos de onde apareceu.
        List<String> relevancia = new ArrayList<>();
        for (int i = 0; i < f.termos().size(); i++) {
            String p = "t" + i;
            params.addValue(p, "%" + f.termos().get(i) + "%");
            String nome = "lower(unaccent(e.nome_fantasia)) LIKE :" + p;
            String categoria = "EXISTS (SELECT 1 FROM empresa_categoria ec JOIN categoria c ON c.id = ec.categoria_id "
                    + "WHERE ec.empresa_id = e.id AND lower(unaccent(c.nome)) LIKE :" + p + ")";
            String servico = "EXISTS (SELECT 1 FROM servico s WHERE " + SERVICO_VISIVEL
                    + " AND lower(unaccent(s.nome)) LIKE :" + p + ")";
            String descricao = "(lower(unaccent(coalesce(e.descricao, ''))) LIKE :" + p
                    + " OR EXISTS (SELECT 1 FROM servico s WHERE " + SERVICO_VISIVEL
                    + " AND lower(unaccent(coalesce(s.descricao, ''))) LIKE :" + p + "))";
            where.add("(" + String.join(" OR ", nome, categoria, servico, descricao) + ")");
            relevancia.add("(CASE WHEN " + nome + " THEN 4 ELSE 0 END) + (CASE WHEN " + categoria
                    + " THEN 3 ELSE 0 END) + (CASE WHEN " + servico + " THEN 2 ELSE 0 END) + (CASE WHEN " + descricao
                    + " THEN 1 ELSE 0 END)");
        }
        if (f.categoriaId() != null) {
            params.addValue("categoriaId", f.categoriaId());
            where.add("EXISTS (SELECT 1 FROM empresa_categoria ec WHERE ec.empresa_id = e.id "
                    + "AND ec.categoria_id = :categoriaId)");
        }
        if (f.cidade() != null) {
            params.addValue("cidade", f.cidade() + "%");
            where.add("lower(unaccent(e.cidade)) LIKE :cidade");
        }

        String from = " FROM empresa e JOIN usuario u ON u.id = e.usuario_id WHERE " + String.join(" AND ", where);
        Long total = jdbc.queryForObject("SELECT count(*)" + from, params, Long.class);

        String colRelevancia = relevancia.isEmpty() ? "0" : String.join(" + ", relevancia);
        String ordem = switch (f.ordenacao()) {
            case PRECO -> "preco_a_partir_de ASC NULLS LAST, e.nome_fantasia";
            // sem avaliações ainda: "melhor nota" usa relevância/nome até a Fase 6
            case NOTA, RELEVANCIA -> "relevancia DESC, servicos_visiveis DESC, e.nome_fantasia";
        };
        params.addValue("limite", f.tamanho());
        params.addValue("offset", (long) f.pagina() * f.tamanho());
        String sql = "SELECT e.id, e.nome_fantasia, e.logo_url, e.capa_url, e.cidade, "
                + PRECO_A_PARTIR_DE + " AS preco_a_partir_de, "
                + "(SELECT count(*) FROM servico s WHERE " + SERVICO_VISIVEL + ") AS servicos_visiveis, "
                + colRelevancia + " AS relevancia"
                + from + " ORDER BY " + ordem + " LIMIT :limite OFFSET :offset";
        return new Resultado(mapear(sql, params), total == null ? 0 : total);
    }

    /** Recomendados: mesma cidade do cliente primeiro, depois quem tem mais serviços publicados. */
    public List<EmpresaResumo> recomendadas(String cidade, int limite) {
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("cidade", cidade == null ? "" : FiltroBusca.normalizar(cidade.split(",")[0]) + "%")
                .addValue("limite", limite);
        String sql = "SELECT e.id, e.nome_fantasia, e.logo_url, e.capa_url, e.cidade, "
                + PRECO_A_PARTIR_DE + " AS preco_a_partir_de, "
                + "(SELECT count(*) FROM servico s WHERE " + SERVICO_VISIVEL + ") AS servicos_visiveis "
                + "FROM empresa e JOIN usuario u ON u.id = e.usuario_id WHERE u.ativo "
                + "AND EXISTS (SELECT 1 FROM servico s WHERE " + SERVICO_VISIVEL + ") "
                + "ORDER BY (CASE WHEN :cidade <> '' AND lower(unaccent(e.cidade)) LIKE :cidade THEN 0 ELSE 1 END), "
                + "servicos_visiveis DESC, e.criado_em DESC LIMIT :limite";
        return mapear(sql, params);
    }

    private List<EmpresaResumo> mapear(String sql, MapSqlParameterSource params) {
        Map<Long, Object[]> linhas = new LinkedHashMap<>();
        jdbc.query(sql, params, rs -> {
            linhas.put(rs.getLong("id"), new Object[] {
                rs.getString("nome_fantasia"), rs.getString("logo_url"), rs.getString("capa_url"),
                rs.getString("cidade"), rs.getBigDecimal("preco_a_partir_de")});
        });
        if (linhas.isEmpty()) {
            return List.of();
        }
        Map<Long, List<CategoriaResponse>> categorias = categoriasDe(linhas.keySet());
        List<EmpresaResumo> lista = new ArrayList<>();
        linhas.forEach((id, l) -> lista.add(new EmpresaResumo(id, (String) l[0], (String) l[1], (String) l[2],
                (String) l[3], categorias.getOrDefault(id, List.of()), null, 0, (BigDecimal) l[4])));
        return lista;
    }

    private Map<Long, List<CategoriaResponse>> categoriasDe(java.util.Collection<Long> ids) {
        Map<Long, List<CategoriaResponse>> mapa = new HashMap<>();
        jdbc.query("""
                SELECT ec.empresa_id, c.id, c.nome, c.icone FROM empresa_categoria ec
                JOIN categoria c ON c.id = ec.categoria_id
                WHERE ec.empresa_id IN (:ids) ORDER BY c.id""",
                new MapSqlParameterSource("ids", ids),
                rs -> {
                    mapa.computeIfAbsent(rs.getLong("empresa_id"), k -> new ArrayList<>())
                            .add(new CategoriaResponse(rs.getLong("id"), rs.getString("nome"), rs.getString("icone")));
                });
        return mapa;
    }
}
