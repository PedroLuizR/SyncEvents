package br.com.syncevents.solicitacao.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import br.com.syncevents.common.TipoEvento;
import br.com.syncevents.solicitacao.Solicitacao;
import br.com.syncevents.solicitacao.StatusSolicitacao;

/**
 * Solicitação de orçamento. Na listagem, {@code servicos}, {@code anexos} e {@code propostas}
 * vêm vazios e {@code propostaAtual} traz só a última proposta (para o card).
 */
public record SolicitacaoResponse(
        Long id,
        StatusSolicitacao status,
        TipoEvento tipoEvento,
        LocalDate dataEvento,
        int qtdConvidados,
        String local,
        BigDecimal orcamentoMin,
        BigDecimal orcamentoMax,
        String mensagem,
        Instant criadoEm,
        Instant atualizadoEm,
        ClienteResumo cliente,
        EmpresaResumo empresa,
        List<ServicoResumo> servicos,
        List<AnexoResumo> anexos,
        List<PropostaResponse> propostas,
        PropostaResponse propostaAtual,
        Long conversaId,
        /** true quando o cliente já avaliou (só faz sentido para CONCLUIDA). */
        boolean avaliada) {

    public record ClienteResumo(Long id, String nome, String cidade, String telefone, String email, String fotoUrl) {
    }

    public record EmpresaResumo(Long id, String nomeFantasia, String cidade, String logoUrl) {
    }

    public record ServicoResumo(Long id, String nome) {
    }

    public record AnexoResumo(Long id, String url) {
    }

    public static SolicitacaoResponse resumo(Solicitacao s, PropostaResponse ultima, boolean avaliada) {
        return montar(s, List.of(), List.of(), List.of(), ultima, null, avaliada);
    }

    public static SolicitacaoResponse detalhe(Solicitacao s, Long conversaId) {
        return detalhe(s, conversaId, false);
    }

    public static SolicitacaoResponse detalhe(Solicitacao s, Long conversaId, boolean avaliada) {
        List<PropostaResponse> propostas = s.getPropostas().stream().map(PropostaResponse::de).toList();
        return montar(s,
                s.getServicos().stream().map(sv -> new ServicoResumo(sv.getId(), sv.getNome())).toList(),
                s.getAnexos().stream().map(a -> new AnexoResumo(a.getId(), a.getUrl())).toList(),
                propostas,
                propostas.isEmpty() ? null : propostas.get(propostas.size() - 1),
                conversaId, avaliada);
    }

    private static SolicitacaoResponse montar(Solicitacao s, List<ServicoResumo> servicos, List<AnexoResumo> anexos,
            List<PropostaResponse> propostas, PropostaResponse atual, Long conversaId, boolean avaliada) {
        var c = s.getCliente();
        var e = s.getEmpresa();
        return new SolicitacaoResponse(s.getId(), s.getStatus(), s.getTipoEvento(), s.getDataEvento(),
                s.getQtdConvidados(), s.getLocal(), s.getOrcamentoMin(), s.getOrcamentoMax(), s.getMensagem(),
                s.getCriadoEm(), s.getAtualizadoEm(),
                new ClienteResumo(c.getId(), c.getNome(), c.getCidade(), c.getTelefone(),
                        c.getUsuario().getEmail(), c.getFotoUrl()),
                new EmpresaResumo(e.getId(), e.getNomeFantasia(), e.getCidade(), e.getLogoUrl()),
                servicos, anexos, propostas, atual, conversaId, avaliada);
    }
}
