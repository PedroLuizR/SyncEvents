import type { Mensagem } from '@/api/types';
import { urlWebSocket } from '@/chat/stomp';

import { hora, mensagensParaLista, previaMensagem, rotuloDia, upsertMensagem } from '../chat';

const msg = (id: number, extra: Partial<Mensagem> = {}): Mensagem => ({
  id,
  conversaId: 1,
  remetenteUsuarioId: 10,
  tipo: 'TEXTO',
  conteudo: `m${id}`,
  lida: false,
  enviadaEm: '2026-11-12T13:22:00Z',
  ...extra,
});

it('upsert insere na página mais recente e atualiza pelo id', () => {
  let dados = upsertMensagem(undefined, msg(1));
  dados = upsertMensagem(dados, msg(3));
  dados = upsertMensagem(dados, msg(2));
  expect(dados.pages[0].mensagens.map((m) => m.id)).toEqual([1, 2, 3]);

  dados = upsertMensagem(dados, msg(2, { conteudo: 'editada' }));
  expect(dados.pages[0].mensagens).toHaveLength(3);
  expect(dados.pages[0].mensagens[1].conteudo).toBe('editada');
});

it('lista para FlatList invertida: mais recente primeiro e sem duplicadas', () => {
  const dados = {
    pages: [
      { mensagens: [msg(4), msg(5)], temMais: true },
      { mensagens: [msg(1), msg(2), msg(4)], temMais: false },
    ],
    pageParams: [undefined, 4],
  };
  expect(mensagensParaLista(dados).map((m) => m.id)).toEqual([5, 4, 2, 1]);
});

it('rótulos de dia, hora e prévia', () => {
  const agora = new Date(2026, 10, 12, 15, 0);
  expect(rotuloDia(new Date(2026, 10, 12, 9, 0).toISOString(), agora)).toBe('Hoje');
  expect(rotuloDia(new Date(2026, 10, 11, 9, 0).toISOString(), agora)).toBe('Ontem');
  expect(rotuloDia(new Date(2026, 9, 16, 9, 0).toISOString(), agora)).toBe('16 out 2026');
  expect(hora(new Date(2026, 10, 12, 9, 5).toISOString())).toBe('09:05');
  expect(previaMensagem(msg(1), 10)).toBe('Você: m1');
  expect(previaMensagem(msg(1), 99)).toBe('m1');
  expect(
    previaMensagem(
      msg(2, {
        tipo: 'PROPOSTA',
        proposta: { id: 1, valor: 10500, descricao: '', status: 'ENVIADA', criadoEm: '' },
      }),
      99,
    ),
  ).toBe('Proposta de R$ 10.500');
  expect(previaMensagem(undefined)).toBe('Nenhuma mensagem ainda');
});

it('monta a URL do WebSocket a partir da API', () => {
  expect(urlWebSocket('http://10.0.2.2:8080')).toBe('ws://10.0.2.2:8080/ws');
  expect(urlWebSocket('https://api.syncevents.com/')).toBe('wss://api.syncevents.com/ws');
});
