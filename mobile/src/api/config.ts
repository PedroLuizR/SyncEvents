import { apiUrlAtual } from '@/store/config';

/**
 * URL base da API. Vem da tela "Servidor" (salva no aparelho) ou de EXPO_PUBLIC_API_URL.
 * No emulador Android o padrão é http://10.0.2.2:8080.
 */
export function apiUrl(): string {
  return apiUrlAtual();
}

export const API_PREFIX = '/api/v1';
