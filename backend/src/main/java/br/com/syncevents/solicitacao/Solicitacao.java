package br.com.syncevents.solicitacao;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import br.com.syncevents.cliente.Cliente;
import br.com.syncevents.common.TipoEvento;
import br.com.syncevents.empresa.Empresa;
import br.com.syncevents.servico.Servico;
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
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "solicitacao")
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false, updatable = false)
    private Cliente cliente;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false, updatable = false)
    private Empresa empresa;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_evento", nullable = false)
    private TipoEvento tipoEvento;

    @Column(name = "data_evento", nullable = false)
    private LocalDate dataEvento;

    @Column(name = "qtd_convidados", nullable = false)
    private int qtdConvidados;

    @Column(nullable = false)
    private String local;

    @Column(name = "orcamento_min", precision = 12, scale = 2)
    private BigDecimal orcamentoMin;

    @Column(name = "orcamento_max", precision = 12, scale = 2)
    private BigDecimal orcamentoMax;

    private String mensagem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusSolicitacao status = StatusSolicitacao.PENDENTE;

    @Column(name = "aceite_contato", nullable = false)
    private boolean aceiteContato;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "solicitacao_servico",
            joinColumns = @JoinColumn(name = "solicitacao_id"),
            inverseJoinColumns = @JoinColumn(name = "servico_id"))
    @OrderBy("id")
    private Set<Servico> servicos = new LinkedHashSet<>();

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<SolicitacaoAnexo> anexos = new ArrayList<>();

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("criadoEm ASC, id ASC")
    private List<Proposta> propostas = new ArrayList<>();

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    protected Solicitacao() {
    }

    public Solicitacao(Cliente cliente, Empresa empresa) {
        this.cliente = cliente;
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

    /** Proposta aguardando resposta do cliente, se houver. */
    public Optional<Proposta> propostaEmAberto() {
        return propostas.stream().filter(p -> p.getStatus() == StatusProposta.ENVIADA).findFirst();
    }

    public Proposta adicionarProposta(BigDecimal valor, String descricao) {
        Proposta p = new Proposta(this, valor, descricao);
        propostas.add(p);
        return p;
    }

    public Long getId() {
        return id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public TipoEvento getTipoEvento() {
        return tipoEvento;
    }

    public void setTipoEvento(TipoEvento tipoEvento) {
        this.tipoEvento = tipoEvento;
    }

    public LocalDate getDataEvento() {
        return dataEvento;
    }

    public void setDataEvento(LocalDate dataEvento) {
        this.dataEvento = dataEvento;
    }

    public int getQtdConvidados() {
        return qtdConvidados;
    }

    public void setQtdConvidados(int qtdConvidados) {
        this.qtdConvidados = qtdConvidados;
    }

    public String getLocal() {
        return local;
    }

    public void setLocal(String local) {
        this.local = local;
    }

    public BigDecimal getOrcamentoMin() {
        return orcamentoMin;
    }

    public void setOrcamentoMin(BigDecimal orcamentoMin) {
        this.orcamentoMin = orcamentoMin;
    }

    public BigDecimal getOrcamentoMax() {
        return orcamentoMax;
    }

    public void setOrcamentoMax(BigDecimal orcamentoMax) {
        this.orcamentoMax = orcamentoMax;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public StatusSolicitacao getStatus() {
        return status;
    }

    public void setStatus(StatusSolicitacao status) {
        this.status = status;
    }

    public boolean isAceiteContato() {
        return aceiteContato;
    }

    public void setAceiteContato(boolean aceiteContato) {
        this.aceiteContato = aceiteContato;
    }

    public Set<Servico> getServicos() {
        return servicos;
    }

    public List<SolicitacaoAnexo> getAnexos() {
        return anexos;
    }

    public List<Proposta> getPropostas() {
        return propostas;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }
}
