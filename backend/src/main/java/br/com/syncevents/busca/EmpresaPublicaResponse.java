package br.com.syncevents.busca;

import java.math.BigDecimal;
import java.util.List;

import br.com.syncevents.categoria.CategoriaResponse;
import br.com.syncevents.servico.dto.FotoResponse;
import br.com.syncevents.servico.dto.ServicoResponse;

/** Perfil da empresa visto pelo cliente (ID07). */
public record EmpresaPublicaResponse(
        Long id,
        String codigo,
        String nomeFantasia,
        String descricao,
        String cidade,
        String uf,
        String endereco,
        String telefoneWhatsapp,
        String logoUrl,
        String capaUrl,
        List<CategoriaResponse> categorias,
        List<FotoResponse> portfolio,
        List<ServicoResponse> servicos,
        BigDecimal nota,
        long totalAvaliacoes,
        Indicadores indicadores) {

    /**
     * Indicadores exibidos no perfil. {@code eventosRealizados} passa a ser preenchido na Fase 4
     * (solicitações concluídas); até lá é 0.
     */
    public record Indicadores(long eventosRealizados, int servicos, int fotos, int naPlataformaDesde) {
    }
}
