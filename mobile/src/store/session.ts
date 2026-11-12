import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

const TOKEN_KEY = 'syncevents.token';

/** SecureStore não existe na web (usada só para visualização); lá a sessão fica em memória. */
const seguro = Platform.OS !== 'web';

async function lerToken(): Promise<string | null> {
  if (!seguro) return null;
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export type TipoUsuario = 'CLIENTE' | 'EMPRESA';

export interface UsuarioSessao {
  id: number;
  email: string;
  tipo: TipoUsuario;
  nome: string;
}

interface SessionState {
  token: string | null;
  usuario: UsuarioSessao | null;
  carregado: boolean;
  /** Lê o token salvo no SecureStore (chamar na inicialização do app). */
  restaurar: () => Promise<void>;
  iniciar: (token: string, usuario: UsuarioSessao) => Promise<void>;
  setUsuario: (usuario: UsuarioSessao) => void;
  encerrar: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  token: null,
  usuario: null,
  carregado: false,
  restaurar: async () => {
    const token = await lerToken();
    set({ token, carregado: true });
  },
  iniciar: async (token, usuario) => {
    if (seguro) await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token, usuario });
  },
  setUsuario: (usuario) => set({ usuario }),
  encerrar: async () => {
    if (seguro) await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, usuario: null });
  },
}));
