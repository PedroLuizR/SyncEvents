package br.com.syncevents.empresa;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Cada abertura do perfil de uma empresa por um cliente (indicador do painel, Fase 4). */
@Entity
@Table(name = "visualizacao_perfil")
public class VisualizacaoPerfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "empresa_id", nullable = false)
    private Long empresaId;

    @Column(name = "cliente_id")
    private Long clienteId;

    @Column(name = "criado_em", nullable = false, insertable = false, updatable = false)
    private Instant criadoEm;

    protected VisualizacaoPerfil() {
    }

    public Long getId() {
        return id;
    }

    public Long getEmpresaId() {
        return empresaId;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }
}
