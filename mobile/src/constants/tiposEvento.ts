import type { TipoEvento } from '@/api/types';

export const TIPOS_EVENTO: { valor: TipoEvento; rotulo: string }[] = [
  { valor: 'CASAMENTO', rotulo: 'Casamento' },
  { valor: 'ANIVERSARIO', rotulo: 'Aniversário' },
  { valor: 'CORPORATIVO', rotulo: 'Evento corporativo' },
  { valor: 'FORMATURA', rotulo: 'Formatura' },
  { valor: 'INFANTIL', rotulo: 'Festa infantil' },
  { valor: 'OUTRO', rotulo: 'Outro' },
];

export function rotuloTipoEvento(tipo: TipoEvento): string {
  return TIPOS_EVENTO.find((t) => t.valor === tipo)?.rotulo ?? tipo;
}
