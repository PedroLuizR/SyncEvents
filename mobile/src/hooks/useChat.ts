import { useMutation, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  buscarConversa,
  buscarHistorico,
  enviarMensagem,
  listarConversas,
  marcarComoLidas,
} from '@/api/chat';
import type { Mensagem } from '@/api/types';
import { conectarConversa, type ConexaoChat } from '@/chat/stomp';
import { useSessionStore } from '@/store/session';
import { upsertMensagem, type PaginasChat } from '@/utils/chat';

export const CHAVE_CONVERSAS = ['conversas'] as const;
export const chaveMensagens = (id: number) => ['conversas', id, 'mensagens'] as const;
export const chaveConversa = (id: number) => ['conversas', id] as const;

/** Intervalo do polling quando o WebSocket cai. */
export const POLLING_MS = 5000;

export function useConversas() {
  return useQuery({
    queryKey: CHAVE_CONVERSAS,
    queryFn: listarConversas,
    staleTime: 0,
    refetchInterval: 15_000,
  });
}

/** Total de mensagens não lidas (badge do ícone de conversas). */
export function useNaoLidas(): number {
  const { data } = useConversas();
  return (data ?? []).reduce((soma, c) => soma + c.naoLidas, 0);
}

export function useConversa(id: number) {
  return useQuery({ queryKey: chaveConversa(id), queryFn: () => buscarConversa(id), staleTime: 0 });
}

/**
 * Histórico paginado + tempo real. Com o WebSocket conectado, novas mensagens chegam pelo tópico;
 * se cair, recarrega a cada 5 s até reconectar (o stompjs tenta reconectar sozinho).
 */
export function useChat(conversaId: number) {
  const queryClient = useQueryClient();
  const token = useSessionStore((s) => s.token);
  const meuId = useSessionStore((s) => s.usuario?.id);
  const [conectado, setConectado] = useState(false);
  const conexao = useRef<ConexaoChat | null>(null);
  const chave = chaveMensagens(conversaId);

  const historico = useInfiniteQuery({
    queryKey: chave,
    queryFn: ({ pageParam }) => buscarHistorico(conversaId, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (pagina) => (pagina.temMais ? pagina.mensagens[0]?.id : undefined),
    refetchInterval: conectado ? false : POLLING_MS,
    staleTime: 0,
  });

  const lidas = useMutation({
    mutationFn: () => marcarComoLidas(conversaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE_CONVERSAS, exact: true }),
  });
  const marcarLidas = lidas.mutate;

  const receber = useCallback(
    (m: Mensagem) => {
      queryClient.setQueryData<PaginasChat>(chave, (dados) => upsertMensagem(dados, m));
      if (m.tipo === 'PROPOSTA') {
        // status da solicitação/proposta mudou: atualiza o cabeçalho e as telas de orçamento
        queryClient.invalidateQueries({ queryKey: chaveConversa(conversaId), exact: true });
        queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      }
      if (m.remetenteUsuarioId !== meuId) marcarLidas();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversaId, meuId, queryClient, marcarLidas],
  );

  useEffect(() => {
    if (!token) return;
    const c = conectarConversa({
      conversaId,
      token,
      onMensagem: (corpo) => receber(corpo as Mensagem),
      onEstado: setConectado,
    });
    conexao.current = c;
    marcarLidas();
    return () => {
      c.desconectar();
      conexao.current = null;
    };
  }, [conversaId, token, receber, marcarLidas]);

  const envio = useMutation({
    mutationFn: async (texto: string) => {
      // pelo WebSocket a mensagem volta pelo tópico; sem conexão, usa o REST
      if (conexao.current?.enviar(texto)) return null;
      return enviarMensagem(conversaId, texto);
    },
    onSuccess: (m) => {
      if (m) receber(m);
    },
  });

  return {
    historico,
    conectado,
    enviar: envio.mutateAsync,
    enviando: envio.isPending,
    erroEnvio: envio.error,
  };
}
