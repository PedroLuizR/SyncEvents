package br.com.syncevents.chat;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ConversaRepository extends JpaRepository<Conversa, Long> {

    @Query("select c from Conversa c where c.solicitacao.id = ?1")
    Optional<Conversa> findBySolicitacaoId(Long solicitacaoId);

    @EntityGraph(attributePaths = {"solicitacao", "solicitacao.cliente", "solicitacao.cliente.usuario",
        "solicitacao.empresa", "solicitacao.empresa.usuario"})
    @Query("select c from Conversa c where c.id = ?1")
    Optional<Conversa> buscarComParticipantes(Long id);

    @EntityGraph(attributePaths = {"solicitacao", "solicitacao.cliente", "solicitacao.empresa"})
    @Query("select c from Conversa c where c.clienteId = ?1")
    List<Conversa> doCliente(Long clienteId);

    @EntityGraph(attributePaths = {"solicitacao", "solicitacao.cliente", "solicitacao.empresa"})
    @Query("select c from Conversa c where c.empresaId = ?1")
    List<Conversa> daEmpresa(Long empresaId);
}
