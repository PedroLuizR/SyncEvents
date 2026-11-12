import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

import type { Usuario } from '@/api/types';

const TOKEN_KEY = 'syncevents.token';

/** SecureStore não existe na web (usada só para visualização); lá a sessão fica em memória. */
const seguro = Platform.OS !== 'web';

export async function lerTokenSalvo(): Promise<string | null> {
  if (!seguro) return null;
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

interface SessionState {
  token: string | null;
  usuario: Usuario | null;
  /** true quando a restauração da sessão terminou (com ou sem usuário). */
  pronto: boolean;
  restaurada: (token: string | null, usuario: Usuario | null) => void;
  iniciar: (token: string, usuario: Usuario) => Promise<void>;
  setUsuario: (usuario: Usuario) => void;
  encerrar: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  token: null,
  usuario: null,
  pronto: false,
  restaurada: (token, usuario) => set({ token, usuario, pronto: true }),
  iniciar: async (token, usuario) => {
    if (seguro) await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token, usuario });
  },
  setUsuario: (usuario) => set({ usuario }),
  encerrar: async () => {
    if (seguro) {
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch {
        // nada a fazer
      }
    }
    set({ token: null, usuario: null });
  },
}));
