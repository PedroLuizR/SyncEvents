package br.com.syncevents.servico.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import br.com.syncevents.categoria.CategoriaResponse;
import br.com.syncevents.servico.ModeloPreco;
import br.com.syncevents.servico.Servico;

public record ServicoResponse(
        Long id,
        Long empresaId,
        CategoriaResponse categoria,
        String nome,
        String descricao,
        ModeloPreco modeloPreco,
        BigDecimal precoMin,
        BigDecimal precoMax,
        boolean ativo,
        boolean rascunho,
        List<FotoResponse> fotos,
        List<String> itensInclusos,
        Instant criadoEm,
        Instant atualizadoEm) {

    public static ServicoResponse de(Servico s) {
        return new ServicoResponse(
                s.getId(),
                s.getEmpresa().getId(),
                CategoriaResponse.de(s.getCategoria()),
                s.getNome(),
                s.getDescricao(),
                s.getModeloPreco(),
                s.getPrecoMin(),
                s.getPrecoMax(),
                s.isAtivo(),
                s.isRascunho(),
                s.getFotos().stream().map(f -> new FotoResponse(f.getId(), f.getUrl(), f.getOrdem())).toList(),
                s.getItensInclusos().stream().map(i -> i.getDescricao()).toList(),
                s.getCriadoEm(),
                s.getAtualizadoEm());
    }
}
