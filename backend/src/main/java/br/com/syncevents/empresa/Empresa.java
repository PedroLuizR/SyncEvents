package br.com.syncevents.empresa;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

import br.com.syncevents.categoria.Categoria;
import br.com.syncevents.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    /** Código público de 6 dígitos, exibido no perfil. */
    @Column(nullable = false, unique = true, updatable = false)
    private String codigo;

    @Column(name = "nome_fantasia", nullable = false)
    private String nomeFantasia;

    @Column(nullable = false, unique = true)
    private String cnpj;

    @Column(name = "telefone_whatsapp", nullable = false)
    private String telefoneWhatsapp;

    @Column(nullable = false)
    private String cidade;

    private String uf;

    private String endereco;

    private String descricao;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "capa_url")
    private String capaUrl;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "empresa_categoria",
            joinColumns = @JoinColumn(name = "empresa_id"),
            inverseJoinColumns = @JoinColumn(name = "categoria_id"))
    @OrderBy("id")
    private Set<Categoria> categorias = new LinkedHashSet<>();

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Empresa() {
    }

    public Empresa(Usuario usuario, String codigo, String nomeFantasia, String cnpj, String telefoneWhatsapp,
            String cidade) {
        this.usuario = usuario;
        this.codigo = codigo;
        this.nomeFantasia = nomeFantasia;
        this.cnpj = cnpj;
        this.telefoneWhatsapp = telefoneWhatsapp;
        this.cidade = cidade;
    }

    @PrePersist
    void prePersist() {
        if (criadoEm == null) {
            criadoEm = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public String getCnpj() {
        return cnpj;
    }

    public String getTelefoneWhatsapp() {
        return telefoneWhatsapp;
    }

    public String getCidade() {
        return cidade;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getCapaUrl() {
        return capaUrl;
    }

    public void setCapaUrl(String capaUrl) {
        this.capaUrl = capaUrl;
    }

    public void setNomeFantasia(String nomeFantasia) {
        this.nomeFantasia = nomeFantasia;
    }

    public void setTelefoneWhatsapp(String telefoneWhatsapp) {
        this.telefoneWhatsapp = telefoneWhatsapp;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public Set<Categoria> getCategorias() {
        return categorias;
    }

    public void setCategorias(Set<Categoria> categorias) {
        this.categorias.clear();
        if (categorias != null) {
            this.categorias.addAll(categorias);
        }
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }
}
