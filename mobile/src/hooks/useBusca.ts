import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  buscarEmpresaPublica,
  buscarEmpresas,
  buscarRecomendadas,
  type FiltrosBusca,
} from '@/api/busca';

/** Busca paginada com scroll infinito. */
export function useBuscaEmpresas(filtros: FiltrosBusca) {
  return useInfiniteQuery({
    queryKey: ['empresas', 'busca', filtros],
    queryFn: ({ pageParam }) => buscarEmpresas(filtros, pageParam),
    initialPageParam: 0,
    getNextPageParam: (ultima) => (ultima.ultima ? undefined : ultima.pagina + 1),
  });
}

export function useRecomendadas() {
  return useQuery({ queryKey: ['empresas', 'recomendadas'], queryFn: buscarRecomendadas });
}

export function useEmpresaPublica(id: number) {
  return useQuery({
    queryKey: ['empresas', 'publica', id],
    queryFn: () => buscarEmpresaPublica(id),
    enabled: Number.isFinite(id),
  });
}
