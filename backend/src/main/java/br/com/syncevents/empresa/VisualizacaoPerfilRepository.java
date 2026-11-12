package br.com.syncevents.empresa;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface VisualizacaoPerfilRepository extends JpaRepository<VisualizacaoPerfil, Long> {

    @Query("select count(v) from VisualizacaoPerfil v where v.empresaId = ?1 and v.criadoEm >= ?2 and v.criadoEm < ?3")
    long contarNoPeriodo(Long empresaId, Instant inicio, Instant fim);

    @Modifying
    @Query(value = "INSERT INTO visualizacao_perfil (empresa_id, cliente_id) VALUES (?1, ?2)", nativeQuery = true)
    void registrar(Long empresaId, Long clienteId);
}
