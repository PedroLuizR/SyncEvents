package br.com.syncevents.avaliacao.dto;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import br.com.syncevents.avaliacao.Avaliacao;
import br.com.syncevents.avaliacao.Destaque;
import br.com.syncevents.common.TipoEvento;

public record AvaliacaoResponse(
        Long id,
        Long solicitacaoId,
        Long empresaId,
        int nota,
        String comentario,
        List<Destaque> destaques,
        TipoEvento tipoEvento,
        Autor autor,
        Instant criadoEm) {

    /** Só o primeiro nome e a inicial do sobrenome são públicos ("Marina A."). */
    public record Autor(String nome, String fotoUrl) {
    }

    public static AvaliacaoResponse de(Avaliacao a) {
        return new AvaliacaoResponse(a.getId(), a.getSolicitacao().getId(), a.getEmpresa().getId(), a.getNota(),
                a.getComentario(),
                Arrays.stream(a.getDestaques()).map(Destaque::valueOf).toList(),
                a.getSolicitacao().getTipoEvento(),
                new Autor(nomePublico(a.getCliente().getNome()), a.getCliente().getFotoUrl()),
                a.getCriadoEm());
    }

    static String nomePublico(String nome) {
        String[] partes = nome.trim().split("\\s+");
        return partes.length == 1 ? partes[0] : partes[0] + " " + partes[partes.length - 1].charAt(0) + ".";
    }
}
