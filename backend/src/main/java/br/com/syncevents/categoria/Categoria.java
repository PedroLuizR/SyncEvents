package br.com.syncevents.categoria;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categoria")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    /** Nome do ícone (conjunto Feather) usado pelo app. */
    @Column(nullable = false)
    private String icone;

    protected Categoria() {
    }

    public Categoria(String nome, String icone) {
        this.nome = nome;
        this.icone = icone;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getIcone() {
        return icone;
    }
}
