package br.com.syncevents.servico;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    @EntityGraph(attributePaths = {"categoria", "empresa"})
    @Query("select s from Servico s where s.empresa.id = ?1 order by s.atualizadoEm desc, s.id desc")
    List<Servico> listarDaEmpresa(Long empresaId);

    @EntityGraph(attributePaths = {"categoria", "empresa"})
    @Query("""
            select s from Servico s
            where s.empresa.id = ?1 and s.ativo = true and s.rascunho = false
            order by s.criadoEm asc, s.id asc""")
    List<Servico> listarVisiveisDaEmpresa(Long empresaId);

    @EntityGraph(attributePaths = {"categoria", "empresa"})
    @Query("select s from Servico s where s.id = ?1")
    Optional<Servico> buscarComDetalhes(Long id);
}
