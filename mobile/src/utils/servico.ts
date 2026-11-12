import type { ModeloPreco, Servico } from '@/api/types';

import { apenasDigitos, formatarMoeda } from './masks';

export const MODELOS_PRECO: { valor: ModeloPreco; rotulo: string }[] = [
  { valor: 'A_PARTIR_DE', rotulo: 'A partir de' },
  { valor: 'FIXO', rotulo: 'Preço fixo' },
  { valor: 'FAIXA', rotulo: 'Faixa de preço' },
  { valor: 'SOB_CONSULTA', rotulo: 'Sob consulta' },
];

export function rotuloModeloPreco(modelo: ModeloPreco): string {
  return MODELOS_PRECO.find((m) => m.valor === modelo)?.rotulo ?? modelo;
}

/** Texto do preço como aparece nos cards: "a partir de R$ 2.800", "R$ 3.000 a R$ 8.000"... */
export function formatarPrecoServico(
  s: Pick<Servico, 'modeloPreco' | 'precoMin' | 'precoMax'>,
): string {
  const min = s.precoMin != null ? formatarMoeda(Number(s.precoMin)) : null;
  const max = s.precoMax != null ? formatarMoeda(Number(s.precoMax)) : null;
  switch (s.modeloPreco) {
    case 'FIXO':
      return min ?? 'Sob consulta';
    case 'A_PARTIR_DE':
      return min ? `a partir de ${min}` : 'Sob consulta';
    case 'FAIXA':
      if (min && max) return `${min} a ${max}`;
      return min ? `a partir de ${min}` : 'Sob consulta';
    default:
      return 'Sob consulta';
  }
}

/** "R$ 2.800,00" → 2800; vazio → null. */
export function moedaParaNumero(valor?: string | null): number | null {
  const d = apenasDigitos(valor ?? '');
  return d ? Number(d) / 100 : null;
}

/** 2800 → "R$ 2.800,00" (para preencher o campo com máscara). */
export function numeroParaMoeda(valor?: number | null): string {
  return valor == null ? '' : formatarMoeda(Number(valor), { centavos: true });
}

export type StatusServico = 'ATIVO' | 'INATIVO' | 'RASCUNHO';

export function statusServico(s: Pick<Servico, 'ativo' | 'rascunho'>): StatusServico {
  if (s.rascunho) return 'RASCUNHO';
  return s.ativo ? 'ATIVO' : 'INATIVO';
}
