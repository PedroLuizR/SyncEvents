package br.com.syncevents.solicitacao;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "empresa", "empresa.usuario"})
    @Query("select s from Solicitacao s where s.id = ?1")
    Optional<Solicitacao> buscarComDetalhes(Long id);

    @EntityGraph(attributePaths = {"cliente", "empresa"})
    @Query("""
            select s from Solicitacao s
            where s.cliente.id = ?1 and s.status in ?2
            order by s.atualizadoEm desc, s.id desc""")
    List<Solicitacao> listarDoCliente(Long clienteId, Collection<StatusSolicitacao> status);

    @EntityGraph(attributePaths = {"cliente", "empresa"})
    @Query("""
            select s from Solicitacao s
            where s.empresa.id = ?1 and s.status in ?2
            order by s.criadoEm desc, s.id desc""")
    List<Solicitacao> listarDaEmpresa(Long empresaId, Collection<StatusSolicitacao> status);

    @Query("select count(s) from Solicitacao s where s.empresa.id = ?1 and s.criadoEm >= ?2 and s.criadoEm < ?3")
    long contarRecebidas(Long empresaId, Instant inicio, Instant fim);

    @Query("""
            select count(s) from Solicitacao s
            where s.empresa.id = ?1 and s.criadoEm >= ?2 and s.criadoEm < ?3
              and s.status <> br.com.syncevents.solicitacao.StatusSolicitacao.PENDENTE
              and s.status <> br.com.syncevents.solicitacao.StatusSolicitacao.CANCELADA""")
    long contarRespondidas(Long empresaId, Instant inicio, Instant fim);

    @Query("""
            select count(s) from Solicitacao s
            where s.empresa.id = ?1 and s.criadoEm >= ?2 and s.criadoEm < ?3
              and s.status = br.com.syncevents.solicitacao.StatusSolicitacao.CANCELADA""")
    long contarCanceladas(Long empresaId, Instant inicio, Instant fim);

    long countByEmpresaIdAndStatus(Long empresaId, StatusSolicitacao status);

    @Query(value = "select count(*) > 0 from solicitacao_servico where servico_id = ?1", nativeQuery = true)
    boolean servicoTemSolicitacoes(Long servicoId);
}
