package br.com.syncevents.solicitacao;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Imagem de inspiração anexada pelo cliente. */
@Entity
@Table(name = "solicitacao_anexo")
public class SolicitacaoAnexo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_id", nullable = false)
    private Solicitacao solicitacao;

    @Column(nullable = false)
    private String url;

    protected SolicitacaoAnexo() {
    }

    public SolicitacaoAnexo(Solicitacao solicitacao, String url) {
        this.solicitacao = solicitacao;
        this.url = url;
    }

    public Long getId() {
        return id;
    }

    public String getUrl() {
        return url;
    }
}
