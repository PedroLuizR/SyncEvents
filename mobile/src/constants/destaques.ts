import type { Destaque } from '@/api/types';

export const DESTAQUES: { valor: Destaque; rotulo: string }[] = [
  { valor: 'PONTUALIDADE', rotulo: 'Pontualidade' },
  { valor: 'QUALIDADE', rotulo: 'Qualidade' },
  { valor: 'ATENDIMENTO', rotulo: 'Atendimento' },
  { valor: 'CUSTO_BENEFICIO', rotulo: 'Custo-benefício' },
];

export function rotuloDestaque(d: Destaque): string {
  return DESTAQUES.find((x) => x.valor === d)?.rotulo ?? d;
}
