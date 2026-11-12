package br.com.syncevents.empresa;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PortfolioFotoRepository extends JpaRepository<PortfolioFoto, Long> {

    List<PortfolioFoto> findByEmpresaIdOrderByOrdemAscIdAsc(Long empresaId);

    long countByEmpresaId(Long empresaId);

    Optional<PortfolioFoto> findByIdAndEmpresaId(Long id, Long empresaId);

    @Query("select coalesce(max(p.ordem), -1) from PortfolioFoto p where p.empresa.id = ?1")
    int maiorOrdem(Long empresaId);
}
