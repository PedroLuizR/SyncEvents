import type { Historico, Mensagem } from '@/api/types';

import { formatarDataEvento } from './solicitacao';

/** Páginas do histórico como o React Query guarda: [mais recente, anterior, ...]. */
export interface PaginasChat {
  pages: Historico[];
  pageParams: (number | undefined)[];
}

/**
 * Insere ou atualiza uma mensagem (chegada pelo WebSocket, polling ou envio REST).
 * Uma proposta respondida chega de novo com o mesmo id e substitui a anterior.
 */
export function upsertMensagem(dados: PaginasChat | undefined, m: Mensagem): PaginasChat {
  if (!dados || dados.pages.length === 0) {
    return { pages: [{ mensagens: [m], temMais: false }], pageParams: [undefined] };
  }
  let achou = false;
  const pages = dados.pages.map((p) => ({
    ...p,
    mensagens: p.mensagens.map((x) => {
      if (x.id === m.id) {
        achou = true;
        return m;
      }
      return x;
    }),
  }));
  if (!achou) {
    const recente = pages[0];
    pages[0] = { ...recente, mensagens: [...recente.mensagens, m].sort((a, b) => a.id - b.id) };
  }
  return { ...dados, pages };
}

/** Lista para FlatList invertida: mais recente primeiro, sem duplicadas. */
export function mensagensParaLista(dados?: PaginasChat): Mensagem[] {
  if (!dados) return [];
  const vistas = new Set<number>();
  const todas: Mensagem[] = [];
  for (const p of dados.pages) {
    for (const m of p.mensagens) {
      if (!vistas.has(m.id)) {
        vistas.add(m.id);
        todas.push(m);
      }
    }
  }
  return todas.sort((a, b) => b.id - a.id);
}

function chaveDia(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "Hoje", "Ontem" ou "16 out 2027". */
export function rotuloDia(iso: string, agora: Date = new Date()): string {
  const d = new Date(iso);
  const hoje = chaveDia(agora);
  const ontem = chaveDia(new Date(agora.getTime() - 86_400_000));
  const dia = chaveDia(d);
  if (dia === hoje) return 'Hoje';
  if (dia === ontem) return 'Ontem';
  return formatarDataEvento(dia);
}

export function mesmoDia(a: string, b: string): boolean {
  return chaveDia(new Date(a)) === chaveDia(new Date(b));
}

/** "10:22" */
export function hora(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Texto de prévia na lista de conversas. */
export function previaMensagem(m?: Mensagem, meuUsuarioId?: number): string {
  if (!m) return 'Nenhuma mensagem ainda';
  const prefixo = m.remetenteUsuarioId === meuUsuarioId ? 'Você: ' : '';
  if (m.tipo === 'PROPOSTA' && m.proposta) {
    return `${prefixo}Proposta de R$ ${Number(m.proposta.valor).toLocaleString('pt-BR')}`;
  }
  return prefixo + m.conteudo;
}
