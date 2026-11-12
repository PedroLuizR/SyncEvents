package br.com.syncevents.chat;

import java.time.Instant;

import br.com.syncevents.solicitacao.Proposta;
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
@Table(name = "mensagem")
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "conversa_id", nullable = false)
    private Conversa conversa;

    @Column(name = "remetente_usuario_id", nullable = false)
    private Long remetenteUsuarioId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMensagem tipo;

    @Column(nullable = false)
    private String conteudo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposta_id")
    private Proposta proposta;

    @Column(nullable = false)
    private boolean lida;

    @Column(name = "enviada_em", nullable = false, updatable = false)
    private Instant enviadaEm;

    protected Mensagem() {
    }

    public Mensagem(Conversa conversa, Long remetenteUsuarioId, TipoMensagem tipo, String conteudo, Proposta proposta) {
        this.conversa = conversa;
        this.remetenteUsuarioId = remetenteUsuarioId;
        this.tipo = tipo;
        this.conteudo = conteudo;
        this.proposta = proposta;
    }

    @PrePersist
    void prePersist() {
        if (enviadaEm == null) {
            enviadaEm = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Conversa getConversa() {
        return conversa;
    }

    public Long getRemetenteUsuarioId() {
        return remetenteUsuarioId;
    }

    public TipoMensagem getTipo() {
        return tipo;
    }

    public String getConteudo() {
        return conteudo;
    }

    public Proposta getProposta() {
        return proposta;
    }

    public boolean isLida() {
        return lida;
    }

    public Instant getEnviadaEm() {
        return enviadaEm;
    }
}
