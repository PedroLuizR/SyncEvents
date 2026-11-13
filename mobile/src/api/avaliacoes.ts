import { api } from './client';
import type { Avaliacao, AvaliacoesEmpresa, Destaque } from './types';

export interface NovaAvaliacao {
  solicitacaoId: number;
  nota: number;
  comentario?: string;
  destaques: Destaque[];
}

export async function avaliar(dados: NovaAvaliacao): Promise<Avaliacao> {
  const { data } = await api.post<Avaliacao>('/avaliacoes', dados);
  return data;
}

export async function listarAvaliacoes(
  empresaId: number,
  pagina = 0,
  tamanho = 10,
): Promise<AvaliacoesEmpresa> {
  const { data } = await api.get<AvaliacoesEmpresa>(`/empresas/${empresaId}/avaliacoes`, {
    params: { page: pagina, size: tamanho },
  });
  return data;
}
