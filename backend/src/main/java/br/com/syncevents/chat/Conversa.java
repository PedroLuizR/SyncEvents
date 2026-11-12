package br.com.syncevents.chat;

import java.time.Instant;

import br.com.syncevents.solicitacao.Solicitacao;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/** Conversa entre cliente e empresa, criada junto com a solicitação (mensagens na Fase 5). */
@Entity
@Table(name = "conversa")
public class Conversa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_id", nullable = false, unique = true)
    private Solicitacao solicitacao;

    @Column(name = "cliente_id", nullable = false)
    private Long clienteId;

    @Column(name = "empresa_id", nullable = false)
    private Long empresaId;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Conversa() {
    }

    public Conversa(Solicitacao solicitacao) {
        this.solicitacao = solicitacao;
        this.clienteId = solicitacao.getCliente().getId();
        this.empresaId = solicitacao.getEmpresa().getId();
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

    public Long getClienteId() {
        return clienteId;
    }

    public Long getEmpresaId() {
        return empresaId;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }
}
