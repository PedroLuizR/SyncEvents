package br.com.syncevents.chat;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {

    /** Mais recentes primeiro; com {@code antesDe} traz as anteriores a essa mensagem. */
    @EntityGraph(attributePaths = "proposta")
    @Query("""
            select m from Mensagem m
            where m.conversa.id = ?1 and (?2 is null or m.id < ?2)
            order by m.id desc""")
    List<Mensagem> historico(Long conversaId, Long antesDe, Pageable pagina);

    @EntityGraph(attributePaths = "proposta")
    Optional<Mensagem> findFirstByConversaIdOrderByIdDesc(Long conversaId);

    @EntityGraph(attributePaths = "proposta")
    Optional<Mensagem> findFirstByPropostaId(Long propostaId);

    @Query("select count(m) from Mensagem m where m.conversa.id = ?1 and m.remetenteUsuarioId <> ?2 and m.lida = false")
    long contarNaoLidas(Long conversaId, Long usuarioId);

    @Modifying(clearAutomatically = true)
    @Query("update Mensagem m set m.lida = true where m.conversa.id = ?1 and m.remetenteUsuarioId <> ?2 and m.lida = false")
    int marcarComoLidas(Long conversaId, Long usuarioId);
}
