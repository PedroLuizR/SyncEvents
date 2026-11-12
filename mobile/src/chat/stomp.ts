import { Client, type IMessage } from '@stomp/stompjs';

import { API_URL } from '@/api/config';

/** http://10.0.2.2:8080 → ws://10.0.2.2:8080/ws */
export function urlWebSocket(base: string = API_URL): string {
  return `${base.replace(/^http/, 'ws').replace(/\/$/, '')}/ws`;
}

export interface ConexaoChat {
  desconectar: () => void;
  enviar: (conteudo: string) => boolean;
}

/**
 * Abre a conexão STOMP da conversa: autentica com o JWT no CONNECT, assina
 * /topic/conversas/{id} e reconecta sozinho a cada 5 s se cair.
 */
export function conectarConversa(opcoes: {
  conversaId: number;
  token: string;
  onMensagem: (corpo: unknown) => void;
  onEstado: (conectado: boolean) => void;
}): ConexaoChat {
  const cliente = new Client({
    brokerURL: urlWebSocket(),
    connectHeaders: { Authorization: `Bearer ${opcoes.token}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    // recomendações do stompjs para React Native
    forceBinaryWSFrames: true,
    appendMissingNULLonIncoming: true,
    onConnect: () => {
      cliente.subscribe(`/topic/conversas/${opcoes.conversaId}`, (msg: IMessage) => {
        try {
          opcoes.onMensagem(JSON.parse(msg.body));
        } catch {
          // ignora mensagens mal formadas
        }
      });
      opcoes.onEstado(true);
    },
    onWebSocketClose: () => opcoes.onEstado(false),
    onStompError: () => opcoes.onEstado(false),
  });
  cliente.activate();

  return {
    desconectar: () => {
      opcoes.onEstado(false);
      cliente.deactivate();
    },
    enviar: (conteudo: string) => {
      if (!cliente.connected) return false;
      cliente.publish({
        destination: `/app/conversas/${opcoes.conversaId}`,
        body: JSON.stringify({ conteudo }),
      });
      return true;
    },
  };
}
