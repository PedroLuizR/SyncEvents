package br.com.syncevents.usuario;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @Query("select u from Usuario u where lower(u.email) = lower(?1)")
    Optional<Usuario> findByEmail(String email);

    @Query("select count(u) > 0 from Usuario u where lower(u.email) = lower(?1)")
    boolean existsByEmail(String email);
}
