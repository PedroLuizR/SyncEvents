package br.com.syncevents.empresa;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {

    @EntityGraph(attributePaths = "categorias")
    Optional<Empresa> findByUsuarioId(Long usuarioId);

    @EntityGraph(attributePaths = "usuario")
    Optional<Empresa> findByCnpj(String cnpj);

    boolean existsByCnpj(String cnpj);

    @EntityGraph(attributePaths = {"categorias", "usuario"})
    @org.springframework.data.jpa.repository.Query("select e from Empresa e where e.id = ?1")
    Optional<Empresa> findComCategoriasById(Long id);

    boolean existsByCodigo(String codigo);
}
