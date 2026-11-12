import { useMutation, useQuery } from '@tanstack/react-query';

import {
  cadastrarCliente,
  cadastrarEmpresa,
  listarCategorias,
  login,
  type CadastroClienteDados,
  type CadastroEmpresaDados,
  type LoginDados,
} from '@/api/auth';
import { useSessionStore } from '@/store/session';

export function useLogin() {
  const iniciar = useSessionStore((s) => s.iniciar);
  return useMutation({
    mutationFn: (dados: LoginDados) => login(dados),
    onSuccess: async ({ token, usuario }) => {
      await iniciar(token, usuario);
    },
  });
}

export function useCadastroCliente() {
  return useMutation({ mutationFn: (dados: CadastroClienteDados) => cadastrarCliente(dados) });
}

export function useCadastroEmpresa() {
  return useMutation({ mutationFn: (dados: CadastroEmpresaDados) => cadastrarEmpresa(dados) });
}

export function useCategorias() {
  return useQuery({ queryKey: ['categorias'], queryFn: listarCategorias, staleTime: Infinity });
}

export function useLogout() {
  return useSessionStore((s) => s.encerrar);
}
