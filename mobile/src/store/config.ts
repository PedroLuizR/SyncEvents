import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

const CHAVE = 'syncevents.apiUrl';

/** Endereço padrão do build (EXPO_PUBLIC_API_URL) ou o do emulador Android. */
export const URL_PADRAO = (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080').replace(
  /\/+$/,
  '',
);

/** "192.168.0.10:8080" → "http://192.168.0.10:8080"; remove barras finais. Retorna null se inválido. */
export function normalizarUrl(texto: string): string | null {
  let url = texto.trim().replace(/\/+$/, '');
  if (!url || /^https?:\/*$/i.test(url)) return null;
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  try {
    const u = new URL(url);
    if (!u.hostname) return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

interface ConfigState {
  apiUrl: string;
  carregar: () => Promise<void>;
  salvar: (url: string) => Promise<void>;
  restaurarPadrao: () => Promise<void>;
}

/**
 * Endereço do backend escolhido no próprio app (tela "Servidor"), salvo no aparelho.
 * Permite testar o mesmo APK no emulador (10.0.2.2) ou num celular na rede (IP da máquina).
 */
export const useConfigStore = create<ConfigState>((set) => ({
  apiUrl: URL_PADRAO,
  carregar: async () => {
    if (Platform.OS === 'web') return;
    try {
      const salvo = await SecureStore.getItemAsync(CHAVE);
      if (salvo) set({ apiUrl: salvo });
    } catch {
      // mantém o padrão
    }
  },
  salvar: async (url) => {
    if (Platform.OS !== 'web') await SecureStore.setItemAsync(CHAVE, url);
    set({ apiUrl: url });
  },
  restaurarPadrao: async () => {
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(CHAVE);
    set({ apiUrl: URL_PADRAO });
  },
}));

export function apiUrlAtual(): string {
  return useConfigStore.getState().apiUrl;
}
