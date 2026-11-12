package br.com.syncevents.solicitacao;

import java.math.BigDecimal;
import java.time.Instant;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "proposta")
public class Proposta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_id", nullable = false)
    private Solicitacao solicitacao;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusProposta status = StatusProposta.ENVIADA;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Proposta() {
    }

    public Proposta(Solicitacao solicitacao, BigDecimal valor, String descricao) {
        this.solicitacao = solicitacao;
        this.valor = valor;
        this.descricao = descricao;
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

    public Solicitacao getSolicitacao() {
        return solicitacao;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public String getDescricao() {
        return descricao;
    }

    public StatusProposta getStatus() {
        return status;
    }

    public void setStatus(StatusProposta status) {
        this.status = status;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }
}
