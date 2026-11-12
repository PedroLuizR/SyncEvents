import type { ArquivoImagem } from '@/components/ImagePickerField';

import { formDeArquivo } from './arquivos';
import { api } from './client';
import type { ModeloPreco, Servico } from './types';

export interface ServicoDados {
  nome: string;
  categoriaId: number | null;
  descricao?: string;
  modeloPreco?: ModeloPreco | null;
  precoMin?: number | null;
  precoMax?: number | null;
  ativo: boolean;
  rascunho: boolean;
  itensInclusos: string[];
}

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export async function listarMeusServicos(): Promise<Servico[]> {
  const { data } = await api.get<Servico[]>('/servicos/me');
  return data;
}

export async function buscarServico(id: number): Promise<Servico> {
  const { data } = await api.get<Servico>(`/servicos/${id}`);
  return data;
}

export async function criarServico(dados: ServicoDados): Promise<Servico> {
  const { data } = await api.post<Servico>('/servicos/me', dados);
  return data;
}

export async function atualizarServico(id: number, dados: ServicoDados): Promise<Servico> {
  const { data } = await api.put<Servico>(`/servicos/${id}`, dados);
  return data;
}

export async function excluirServico(id: number): Promise<void> {
  await api.delete(`/servicos/${id}`);
}

export async function enviarFotoServico(id: number, arquivo: ArquivoImagem): Promise<Servico> {
  const { data } = await api.post<Servico>(
    `/servicos/${id}/fotos`,
    await formDeArquivo(arquivo),
    multipart,
  );
  return data;
}

export async function removerFotoServico(id: number, fotoId: number): Promise<Servico> {
  const { data } = await api.delete<Servico>(`/servicos/${id}/fotos/${fotoId}`);
  return data;
}
