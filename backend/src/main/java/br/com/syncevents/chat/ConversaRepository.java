package br.com.syncevents.chat;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ConversaRepository extends JpaRepository<Conversa, Long> {

    @Query("select c from Conversa c where c.solicitacao.id = ?1")
    Optional<Conversa> findBySolicitacaoId(Long solicitacaoId);
}
