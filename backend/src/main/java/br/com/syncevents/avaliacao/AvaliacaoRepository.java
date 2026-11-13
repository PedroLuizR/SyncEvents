package br.com.syncevents.avaliacao;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    boolean existsBySolicitacaoId(Long solicitacaoId);

    @Query("select a.solicitacao.id from Avaliacao a where a.solicitacao.id in ?1")
    List<Long> solicitacoesAvaliadas(Collection<Long> solicitacaoIds);

    @EntityGraph(attributePaths = {"cliente", "solicitacao"})
    Page<Avaliacao> findByEmpresaIdOrderByCriadoEmDescIdDesc(Long empresaId, Pageable pagina);

    /** [média, total, quantas com nota >= 4] */
    @Query("select avg(a.nota), count(a), sum(case when a.nota >= 4 then 1 else 0 end) from Avaliacao a where a.empresa.id = ?1")
    List<Object[]> resumo(Long empresaId);
}
