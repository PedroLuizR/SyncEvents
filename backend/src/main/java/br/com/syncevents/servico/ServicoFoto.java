package br.com.syncevents.servico;

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
@Table(name = "servico_foto")
public class ServicoFoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id", nullable = false)
    private Servico servico;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private int ordem;

    protected ServicoFoto() {
    }

    public ServicoFoto(Servico servico, String url, int ordem) {
        this.servico = servico;
        this.url = url;
        this.ordem = ordem;
    }

    public Long getId() {
        return id;
    }

    public Servico getServico() {
        return servico;
    }

    public String getUrl() {
        return url;
    }

    public int getOrdem() {
        return ordem;
    }
}
