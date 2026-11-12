import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { buscarMe } from '@/api/auth';
import {
  atualizarMinhaEmpresa,
  buscarMinhaEmpresa,
  enviarImagemEmpresa,
  removerFotoPortfolio,
  type EmpresaAtualizacao,
} from '@/api/empresa';
import type { EmpresaPerfil } from '@/api/types';
import type { ArquivoImagem } from '@/components/ImagePickerField';
import { useSessionStore } from '@/store/session';

export const CHAVE_MINHA_EMPRESA = ['empresa', 'me'] as const;

export function useMinhaEmpresa() {
  return useQuery({ queryKey: CHAVE_MINHA_EMPRESA, queryFn: buscarMinhaEmpresa });
}

/** Atualiza o cache do perfil e o usuário da sessão (nome e logo aparecem em outras telas). */
function useAoAtualizarPerfil() {
  const queryClient = useQueryClient();
  const setUsuario = useSessionStore((s) => s.setUsuario);
  return async (perfil: EmpresaPerfil) => {
    queryClient.setQueryData(CHAVE_MINHA_EMPRESA, perfil);
    try {
      setUsuario(await buscarMe());
    } catch {
      // o perfil já foi salvo; a sessão é atualizada no próximo /auth/me
    }
  };
}

export function useAtualizarEmpresa() {
  const aoAtualizar = useAoAtualizarPerfil();
  return useMutation({
    mutationFn: (dados: EmpresaAtualizacao) => atualizarMinhaEmpresa(dados),
    onSuccess: aoAtualizar,
  });
}

export function useEnviarImagemEmpresa() {
  const aoAtualizar = useAoAtualizarPerfil();
  return useMutation({
    mutationFn: ({
      tipo,
      arquivo,
    }: {
      tipo: 'logo' | 'capa' | 'portfolio';
      arquivo: ArquivoImagem;
    }) => enviarImagemEmpresa(tipo, arquivo),
    onSuccess: aoAtualizar,
  });
}

export function useRemoverFotoPortfolio() {
  const aoAtualizar = useAoAtualizarPerfil();
  return useMutation({
    mutationFn: (fotoId: number) => removerFotoPortfolio(fotoId),
    onSuccess: aoAtualizar,
  });
}
