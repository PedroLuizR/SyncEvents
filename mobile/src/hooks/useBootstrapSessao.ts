import { isAxiosError } from 'axios';
import { useEffect } from 'react';

import { buscarMe } from '@/api/auth';
import { useConfigStore } from '@/store/config';
import { lerTokenSalvo, useSessionStore } from '@/store/session';

/**
 * Restaura a sessão ao abrir o app: lê o token do SecureStore e, se existir,
 * busca /auth/me. Token inválido (401) é descartado.
 */
export function useBootstrapSessao() {
  const restaurada = useSessionStore((s) => s.restaurada);
  const encerrar = useSessionStore((s) => s.encerrar);

  useEffect(() => {
    let ativo = true;
    (async () => {
      await useConfigStore.getState().carregar();
      const token = await lerTokenSalvo();
      if (!token) {
        if (ativo) restaurada(null, null);
        return;
      }
      // o interceptor do axios lê o token do store
      useSessionStore.setState({ token });
      try {
        const usuario = await buscarMe();
        if (ativo) restaurada(token, usuario);
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 401) await encerrar();
        if (ativo) restaurada(useSessionStore.getState().token, null);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [restaurada, encerrar]);
}
