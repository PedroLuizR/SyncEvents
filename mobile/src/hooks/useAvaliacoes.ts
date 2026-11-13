import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { avaliar, listarAvaliacoes, type NovaAvaliacao } from '@/api/avaliacoes';

export const chaveAvaliacoes = (empresaId: number) => ['avaliacoes', empresaId] as const;

export function useAvaliacoesEmpresa(empresaId: number, tamanho = 10) {
  return useQuery({
    queryKey: [...chaveAvaliacoes(empresaId), tamanho],
    queryFn: () => listarAvaliacoes(empresaId, 0, tamanho),
    enabled: Number.isFinite(empresaId),
  });
}

/** Publica a avaliação e atualiza solicitações, perfil e busca (a média muda). */
export function useAvaliar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: NovaAvaliacao) => avaliar(dados),
    onSuccess: (a) => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      queryClient.invalidateQueries({ queryKey: chaveAvaliacoes(a.empresaId) });
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
    },
  });
}
