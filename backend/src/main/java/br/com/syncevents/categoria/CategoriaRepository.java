package br.com.syncevents.categoria;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findAllByOrderByIdAsc();
}
