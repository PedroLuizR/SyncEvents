import type { ArquivoImagem } from '@/components/ImagePickerField';

import { formDeArquivo } from './arquivos';
import { api } from './client';
import type { Dashboard, Solicitacao, StatusSolicitacao, TipoEvento } from './types';

export interface NovaSolicitacao {
  empresaId: number;
  tipoEvento: TipoEvento;
  dataEvento: string;
  qtdConvidados: number;
  local: string;
  servicoIds: number[];
  orcamentoMin?: number | null;
  orcamentoMax?: number | null;
  mensagem?: string;
  aceiteContato: boolean;
}

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export async function criarSolicitacao(dados: NovaSolicitacao): Promise<Solicitacao> {
  const { data } = await api.post<Solicitacao>('/solicitacoes', dados);
  return data;
}

export async function anexarInspiracao(id: number, arquivo: ArquivoImagem): Promise<Solicitacao> {
  const { data } = await api.post<Solicitacao>(
    `/solicitacoes/${id}/anexos`,
    await formDeArquivo(arquivo),
    multipart,
  );
  return data;
}

export async function listarMinhasSolicitacoes(): Promise<Solicitacao[]> {
  const { data } = await api.get<Solicitacao[]>('/solicitacoes/me');
  return data;
}

export async function buscarSolicitacao(id: number): Promise<Solicitacao> {
  const { data } = await api.get<Solicitacao>(`/solicitacoes/${id}`);
  return data;
}

export async function mudarStatusSolicitacao(
  id: number,
  status: StatusSolicitacao,
): Promise<Solicitacao> {
  const { data } = await api.patch<Solicitacao>(`/solicitacoes/${id}/status`, { status });
  return data;
}

export async function enviarProposta(
  id: number,
  proposta: { valor: number; descricao: string },
): Promise<Solicitacao> {
  const { data } = await api.post<Solicitacao>(`/solicitacoes/${id}/propostas`, proposta);
  return data;
}

export async function responderProposta(
  propostaId: number,
  status: 'ACEITA' | 'RECUSADA',
): Promise<Solicitacao> {
  const { data } = await api.patch<Solicitacao>(`/propostas/${propostaId}`, { status });
  return data;
}

export async function cancelarSolicitacao(id: number): Promise<Solicitacao> {
  const { data } = await api.patch<Solicitacao>(`/solicitacoes/${id}/cancelar`);
  return data;
}

export async function buscarDashboard(): Promise<Dashboard> {
  const { data } = await api.get<Dashboard>('/empresas/me/dashboard');
  return data;
}
