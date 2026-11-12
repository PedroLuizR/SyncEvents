package br.com.syncevents.servico;

public enum ModeloPreco {
    /** Valor único: usa preco_min. */
    FIXO,
    /** "a partir de R$ X": usa preco_min. */
    A_PARTIR_DE,
    /** "R$ X a R$ Y": usa preco_min e preco_max. */
    FAIXA,
    /** Sem preço publicado. */
    SOB_CONSULTA
}
