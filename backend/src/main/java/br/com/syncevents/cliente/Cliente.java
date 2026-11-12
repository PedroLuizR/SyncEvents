package br.com.syncevents.cliente;

import java.util.EnumSet;
import java.util.Set;

import br.com.syncevents.common.TipoEvento;
import br.com.syncevents.usuario.Usuario;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String telefone;

    @Column(nullable = false)
    private String cidade;

    private String cpf;

    @Column(name = "foto_url")
    private String fotoUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "cliente_interesse", joinColumns = @JoinColumn(name = "cliente_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_evento", nullable = false)
    private Set<TipoEvento> interesses = EnumSet.noneOf(TipoEvento.class);

    protected Cliente() {
    }

    public Cliente(Usuario usuario, String nome, String telefone, String cidade) {
        this.usuario = usuario;
        this.nome = nome;
        this.telefone = telefone;
        this.cidade = cidade;
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getNome() {
        return nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getCidade() {
        return cidade;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public Set<TipoEvento> getInteresses() {
        return interesses;
    }

    public void setInteresses(Set<TipoEvento> interesses) {
        this.interesses.clear();
        if (interesses != null) {
            this.interesses.addAll(interesses);
        }
    }
}
