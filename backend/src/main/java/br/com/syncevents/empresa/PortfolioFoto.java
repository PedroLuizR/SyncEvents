package br.com.syncevents.empresa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "portfolio_foto")
public class PortfolioFoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private int ordem;

    protected PortfolioFoto() {
    }

    public PortfolioFoto(Empresa empresa, String url, int ordem) {
        this.empresa = empresa;
        this.url = url;
        this.ordem = ordem;
    }

    public Long getId() {
        return id;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public String getUrl() {
        return url;
    }

    public int getOrdem() {
        return ordem;
    }
}
