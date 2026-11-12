package br.com.syncevents.servico;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import br.com.syncevents.categoria.Categoria;
import br.com.syncevents.empresa.Empresa;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "servico")
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false, updatable = false)
    private Empresa empresa;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false)
    private String nome;

    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "modelo_preco", nullable = false)
    private ModeloPreco modeloPreco;

    @Column(name = "preco_min", precision = 12, scale = 2)
    private BigDecimal precoMin;

    @Column(name = "preco_max", precision = 12, scale = 2)
    private BigDecimal precoMax;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(nullable = false)
    private boolean rascunho;

    @OneToMany(mappedBy = "servico", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC, id ASC")
    private List<ServicoFoto> fotos = new ArrayList<>();

    @OneToMany(mappedBy = "servico", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC, id ASC")
    private List<ServicoItemIncluso> itensInclusos = new ArrayList<>();

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    protected Servico() {
    }

    public Servico(Empresa empresa) {
        this.empresa = empresa;
    }

    @PrePersist
    void prePersist() {
        Instant agora = Instant.now();
        criadoEm = agora;
        atualizadoEm = agora;
    }

    @PreUpdate
    void preUpdate() {
        atualizadoEm = Instant.now();
    }

    /** Visível para clientes: ativo e publicado (não rascunho). */
    public boolean isVisivel() {
        return ativo && !rascunho;
    }

    public void substituirItens(List<String> descricoes) {
        itensInclusos.clear();
        if (descricoes == null) {
            return;
        }
        int ordem = 0;
        for (String d : descricoes) {
            if (d != null && !d.isBlank()) {
                itensInclusos.add(new ServicoItemIncluso(this, d.trim(), ordem++));
            }
        }
    }

    public ServicoFoto adicionarFoto(String url) {
        int ordem = fotos.stream().mapToInt(ServicoFoto::getOrdem).max().orElse(-1) + 1;
        ServicoFoto foto = new ServicoFoto(this, url, ordem);
        fotos.add(foto);
        return foto;
    }

    public Long getId() {
        return id;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public ModeloPreco getModeloPreco() {
        return modeloPreco;
    }

    public void setModeloPreco(ModeloPreco modeloPreco) {
        this.modeloPreco = modeloPreco;
    }

    public BigDecimal getPrecoMin() {
        return precoMin;
    }

    public void setPrecoMin(BigDecimal precoMin) {
        this.precoMin = precoMin;
    }

    public BigDecimal getPrecoMax() {
        return precoMax;
    }

    public void setPrecoMax(BigDecimal precoMax) {
        this.precoMax = precoMax;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public boolean isRascunho() {
        return rascunho;
    }

    public void setRascunho(boolean rascunho) {
        this.rascunho = rascunho;
    }

    public List<ServicoFoto> getFotos() {
        return fotos;
    }

    public List<ServicoItemIncluso> getItensInclusos() {
        return itensInclusos;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }
}
