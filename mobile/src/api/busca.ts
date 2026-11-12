import { api } from './client';
import type { EmpresaPublica, EmpresaResumo, OrdenacaoBusca, Pagina } from './types';

export interface FiltrosBusca {
  q?: string;
  categoriaId?: number;
  cidade?: string;
  ordenar?: OrdenacaoBusca;
}

export const TAMANHO_PAGINA = 10;

export async function buscarEmpresas(
  filtros: FiltrosBusca,
  pagina: number,
): Promise<Pagina<EmpresaResumo>> {
  const { data } = await api.get<Pagina<EmpresaResumo>>('/empresas', {
    params: { ...filtros, page: pagina, size: TAMANHO_PAGINA },
  });
  return data;
}

export async function buscarRecomendadas(): Promise<EmpresaResumo[]> {
  const { data } = await api.get<EmpresaResumo[]>('/empresas/recomendadas');
  return data;
}

export async function buscarEmpresaPublica(id: number): Promise<EmpresaPublica> {
  const { data } = await api.get<EmpresaPublica>(`/empresas/${id}`);
  return data;
}
