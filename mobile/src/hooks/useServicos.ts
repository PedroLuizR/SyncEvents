import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  atualizarServico,
  buscarServico,
  criarServico,
  enviarFotoServico,
  excluirServico,
  listarMeusServicos,
  removerFotoServico,
  type ServicoDados,
} from '@/api/servicos';
import type { Foto, Servico } from '@/api/types';
import type { ArquivoImagem } from '@/components/ImagePickerField';

export const CHAVE_MEUS_SERVICOS = ['servicos', 'me'] as const;
export const chaveServico = (id: number) => ['servicos', id] as const;

export function useMeusServicos() {
  return useQuery({ queryKey: CHAVE_MEUS_SERVICOS, queryFn: listarMeusServicos });
}

export function useServico(id: number | null) {
  return useQuery({
    queryKey: chaveServico(id ?? 0),
    queryFn: () => buscarServico(id as number),
    enabled: id != null,
  });
}

export interface SalvarServicoEntrada {
  id: number | null;
  dados: ServicoDados;
  /** fotos locais escolhidas e ainda não enviadas */
  novasFotos: ArquivoImagem[];
  /** fotos já salvas que o usuário removeu */
  fotosRemovidas: Foto[];
}

/** Cria ou atualiza o serviço e depois sincroniza as fotos (que precisam do id). */
export function useSalvarServico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dados, novasFotos, fotosRemovidas }: SalvarServicoEntrada) => {
      let servico: Servico =
        id == null ? await criarServico(dados) : await atualizarServico(id, dados);
      for (const foto of fotosRemovidas) {
        servico = await removerFotoServico(servico.id, foto.id);
      }
      for (const arquivo of novasFotos) {
        servico = await enviarFotoServico(servico.id, arquivo);
      }
      return servico;
    },
    onSuccess: (servico) => {
      queryClient.setQueryData(chaveServico(servico.id), servico);
      queryClient.invalidateQueries({ queryKey: CHAVE_MEUS_SERVICOS });
    },
  });
}

export function useExcluirServico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => excluirServico(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Servico[]>(CHAVE_MEUS_SERVICOS, (lista) =>
        lista?.filter((s) => s.id !== id),
      );
      queryClient.removeQueries({ queryKey: chaveServico(id) });
      queryClient.invalidateQueries({ queryKey: CHAVE_MEUS_SERVICOS });
    },
  });
}
