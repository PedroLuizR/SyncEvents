import { AxiosError, create, isAxiosError } from 'axios';

import { useSessionStore } from '@/store/session';

import { API_PREFIX, apiUrl } from './config';

/** Formato de erro padrão do backend. */
export interface ApiErro {
  status: number;
  erro: string;
  mensagem: string;
  campos?: Record<string, string>;
}

export const api = create({ timeout: 15000 });

api.interceptors.request.use((config) => {
  // o endereço pode mudar em tempo de execução (tela "Servidor")
  config.baseURL = `${apiUrl()}${API_PREFIX}`;
  const token = useSessionStore.getState().token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && useSessionStore.getState().token) {
      await useSessionStore.getState().encerrar();
    }
    return Promise.reject(error);
  },
);

/** Erros de campo devolvidos pelo backend (status 400 VALIDACAO). */
export function camposComErro(error: unknown): Record<string, string> {
  if (isAxiosError<ApiErro>(error) && error.response?.data?.campos) {
    return error.response.data.campos;
  }
  return {};
}

/** Extrai a mensagem de erro amigável de uma falha de requisição. */
export function mensagemDeErro(error: unknown): string {
  if (isAxiosError<ApiErro>(error)) {
    if (error.response?.data?.mensagem) return error.response.data.mensagem;
    if (!error.response) return 'Não foi possível conectar ao servidor.';
  }
  return 'Algo deu errado. Tente novamente.';
}
