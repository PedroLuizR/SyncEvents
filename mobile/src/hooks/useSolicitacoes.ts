import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  anexarInspiracao,
  buscarDashboard,
  buscarSolicitacao,
  cancelarSolicitacao,
  criarSolicitacao,
  enviarProposta,
  listarMinhasSolicitacoes,
  mudarStatusSolicitacao,
  responderProposta,
  type NovaSolicitacao,
} from '@/api/solicitacoes';
import type { Solicitacao, StatusSolicitacao } from '@/api/types';
import type { ArquivoImagem } from '@/components/ImagePickerField';

export const CHAVE_SOLICITACOES = ['solicitacoes', 'me'] as const;
export const chaveSolicitacao = (id: number) => ['solicitacoes', id] as const;
export const CHAVE_DASHBOARD = ['empresa', 'dashboard'] as const;

export function useMinhasSolicitacoes() {
  // status muda pelo outro lado (cliente/empresa): sempre recarrega ao abrir a tela
  return useQuery({
    queryKey: CHAVE_SOLICITACOES,
    queryFn: listarMinhasSolicitacoes,
    staleTime: 0,
  });
}

export function useSolicitacao(id: number) {
  return useQuery({
    queryKey: chaveSolicitacao(id),
    queryFn: () => buscarSolicitacao(id),
    enabled: Number.isFinite(id),
    staleTime: 0,
  });
}

export function useDashboard() {
  return useQuery({ queryKey: CHAVE_DASHBOARD, queryFn: buscarDashboard, staleTime: 0 });
}

/** Depois de qualquer ação: atualiza o detalhe e recarrega listas e painel. */
function useAoAtualizar() {
  const queryClient = useQueryClient();
  return (s: Solicitacao) => {
    queryClient.setQueryData(chaveSolicitacao(s.id), s);
    queryClient.invalidateQueries({ queryKey: CHAVE_SOLICITACOES });
    queryClient.invalidateQueries({ queryKey: CHAVE_DASHBOARD });
  };
}

/** Cria a solicitação e envia as inspirações (que precisam do id). */
export function useCriarSolicitacao() {
  const aoAtualizar = useAoAtualizar();
  return useMutation({
    mutationFn: async ({ dados, anexos }: { dados: NovaSolicitacao; anexos: ArquivoImagem[] }) => {
      let s = await criarSolicitacao(dados);
      for (const arquivo of anexos) {
        s = await anexarInspiracao(s.id, arquivo);
      }
      return s;
    },
    onSuccess: aoAtualizar,
  });
}

export function useMudarStatus() {
  const aoAtualizar = useAoAtualizar();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: StatusSolicitacao }) =>
      mudarStatusSolicitacao(id, status),
    onSuccess: aoAtualizar,
  });
}

export function useEnviarProposta() {
  const aoAtualizar = useAoAtualizar();
  return useMutation({
    mutationFn: ({ id, valor, descricao }: { id: number; valor: number; descricao: string }) =>
      enviarProposta(id, { valor, descricao }),
    onSuccess: aoAtualizar,
  });
}

export function useResponderProposta() {
  const aoAtualizar = useAoAtualizar();
  return useMutation({
    mutationFn: ({ propostaId, status }: { propostaId: number; status: 'ACEITA' | 'RECUSADA' }) =>
      responderProposta(propostaId, status),
    onSuccess: aoAtualizar,
  });
}

export function useCancelarSolicitacao() {
  const aoAtualizar = useAoAtualizar();
  return useMutation({
    mutationFn: (id: number) => cancelarSolicitacao(id),
    onSuccess: aoAtualizar,
  });
}
