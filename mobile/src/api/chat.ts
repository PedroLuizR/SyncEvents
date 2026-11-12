import { api } from './client';
import type { Conversa, Historico, Mensagem } from './types';

export const TAMANHO_HISTORICO = 30;

export async function listarConversas(): Promise<Conversa[]> {
  const { data } = await api.get<Conversa[]>('/conversas');
  return data;
}

export async function buscarConversa(id: number): Promise<Conversa> {
  const { data } = await api.get<Conversa>(`/conversas/${id}`);
  return data;
}

export async function buscarHistorico(id: number, antesDe?: number): Promise<Historico> {
  const { data } = await api.get<Historico>(`/conversas/${id}/mensagens`, {
    params: { antesDe, size: TAMANHO_HISTORICO },
  });
  return data;
}

/** Fallback REST quando o WebSocket não está conectado. */
export async function enviarMensagem(id: number, conteudo: string): Promise<Mensagem> {
  const { data } = await api.post<Mensagem>(`/conversas/${id}/mensagens`, { conteudo });
  return data;
}

export async function marcarComoLidas(id: number): Promise<void> {
  await api.patch(`/conversas/${id}/lidas`);
}
