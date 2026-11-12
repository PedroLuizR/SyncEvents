import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as chatApi from '@/api/chat';
import * as solApi from '@/api/solicitacoes';
import type { Conversa, Mensagem } from '@/api/types';
import ChatScreen from '@/app/chat/[conversaId]';
import ConversasScreen from '@/app/conversas';
import { useSessionStore } from '@/store/session';
import { solicitacao } from '@/test-utils/dados';
import { renderTela } from '@/test-utils/render';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ conversaId: '11' }),
}));
jest.mock('@/api/chat');
jest.mock('@/api/solicitacoes');
jest.mock('@/utils/confirmar', () => ({
  confirmar: ({ onConfirmar }: { onConfirmar: () => void }) => onConfirmar(),
}));

// Conexão STOMP falsa: o teste decide quando conecta e quando chega mensagem
const mockStomp: {
  onMensagem?: (corpo: unknown) => void;
  onEstado?: (c: boolean) => void;
  conectado: boolean;
  enviadas: string[];
} = { conectado: false, enviadas: [] };
jest.mock('@/chat/stomp', () => ({
  conectarConversa: (o: { onMensagem: (c: unknown) => void; onEstado: (c: boolean) => void }) => {
    mockStomp.onMensagem = o.onMensagem;
    mockStomp.onEstado = o.onEstado;
    return {
      desconectar: jest.fn(),
      enviar: (t: string) => {
        if (!mockStomp.conectado) return false;
        mockStomp.enviadas.push(t);
        return true;
      },
    };
  },
}));

const api = jest.mocked(chatApi);
const sol = jest.mocked(solApi);
const { router } = jest.requireMock('expo-router');

const EU = 1;
const EMPRESA = 2;

const conversa: Conversa = {
  id: 11,
  solicitacaoId: 5,
  contato: { id: 7, nome: 'Ateliê Aurora', cidade: 'São Paulo, SP' },
  status: 'EM_NEGOCIACAO',
  tipoEvento: 'CASAMENTO',
  dataEvento: '2027-10-16',
  qtdConvidados: 120,
  local: 'Cotia',
  naoLidas: 0,
  meuUsuarioId: EU,
};

const msg = (
  id: number,
  de: number,
  conteudo: string,
  extra: Partial<Mensagem> = {},
): Mensagem => ({
  id,
  conversaId: 11,
  remetenteUsuarioId: de,
  tipo: 'TEXTO',
  conteudo,
  lida: true,
  enviadaEm: new Date().toISOString(),
  ...extra,
});

const proposta = {
  id: 90,
  valor: 10500,
  descricao: 'Pacote completo',
  status: 'ENVIADA' as const,
  criadoEm: '',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockStomp.conectado = false;
  mockStomp.enviadas = [];
  useSessionStore.setState({
    token: 'jwt',
    usuario: {
      id: EU,
      email: 'm@e.com',
      tipo: 'CLIENTE',
      perfilId: 3,
      nome: 'Marina',
      telefone: '11987654321',
      cidade: 'São Paulo, SP',
    },
  });
  api.buscarConversa.mockResolvedValue(conversa);
  api.marcarComoLidas.mockResolvedValue();
  api.listarConversas.mockResolvedValue([conversa]);
  api.buscarHistorico.mockResolvedValue({
    mensagens: [
      msg(1, EMPRESA, 'Olá, Marina! Adoramos as referências.'),
      msg(2, EU, 'Que ótimo! Queremos algo bem natural.'),
      msg(3, EMPRESA, 'Pacote completo', { tipo: 'PROPOSTA', proposta }),
    ],
    temMais: false,
  });
});

it('mostra o cabeçalho com o orçamento, as mensagens e o card de proposta', async () => {
  await renderTela(<ChatScreen />);
  expect(await screen.findByText('Olá, Marina! Adoramos as referências.')).toBeTruthy();
  expect(screen.getByText('Ateliê Aurora')).toBeTruthy();
  expect(screen.getByText('Casamento · 16 out 2027')).toBeTruthy();
  expect(screen.getByText('Proposta recebida')).toBeTruthy();
  expect(screen.getByText('R$ 10.500')).toBeTruthy();
  expect(screen.getByText('Hoje')).toBeTruthy();
  expect(api.marcarComoLidas).toHaveBeenCalledWith(11);
  expect(screen.getByText('Reconectando… atualizando a cada 5 s')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('contexto-orcamento'));
  expect(router.push).toHaveBeenCalledWith('/cliente/solicitacao/5');
});

it('conectado: envia pelo WebSocket e recebe em tempo real', async () => {
  await renderTela(<ChatScreen />);
  await screen.findByText('Que ótimo! Queremos algo bem natural.');
  await act(async () => {
    mockStomp.conectado = true;
    mockStomp.onEstado?.(true);
  });
  expect(screen.getByText('Conectado em tempo real')).toBeTruthy();

  await fireEvent.changeText(screen.getByTestId('campo-mensagem'), 'Vocês fazem montagem?');
  await fireEvent.press(screen.getByTestId('enviar-mensagem'));
  await waitFor(() => expect(mockStomp.enviadas).toEqual(['Vocês fazem montagem?']));
  expect(api.enviarMensagem).not.toHaveBeenCalled();

  // o eco chega pelo tópico, e depois a resposta da empresa
  await act(async () =>
    mockStomp.onMensagem?.(msg(4, EU, 'Vocês fazem montagem?', { lida: false })),
  );
  await act(async () => mockStomp.onMensagem?.(msg(5, EMPRESA, 'Sim, montagem e desmontagem!')));
  expect(await screen.findByText('Sim, montagem e desmontagem!')).toBeTruthy();
  expect(screen.getByText('Vocês fazem montagem?')).toBeTruthy();
  // mensagem recebida dispara "marcar como lida"
  expect(api.marcarComoLidas.mock.calls.length).toBeGreaterThanOrEqual(2);
});

it('sem conexão: envia pelo REST', async () => {
  api.enviarMensagem.mockResolvedValue(msg(6, EU, 'Mensagem via REST', { lida: false }));
  await renderTela(<ChatScreen />);
  await screen.findByText('Que ótimo! Queremos algo bem natural.');
  await fireEvent.changeText(screen.getByTestId('campo-mensagem'), 'Mensagem via REST');
  await fireEvent.press(screen.getByTestId('enviar-mensagem'));
  await waitFor(() => expect(api.enviarMensagem).toHaveBeenCalledWith(11, 'Mensagem via REST'));
  expect(await screen.findByText('Mensagem via REST')).toBeTruthy();
  expect(screen.getByTestId('campo-mensagem').props.value).toBe('');
});

it('cliente aceita a proposta direto no chat e o card atualiza', async () => {
  sol.responderProposta.mockResolvedValue(solicitacao(5, { status: 'ACEITA' }));
  await renderTela(<ChatScreen />);
  await fireEvent.press(await screen.findByTestId('aceitar-3'));
  await waitFor(() => expect(sol.responderProposta).toHaveBeenCalledWith(90, 'ACEITA'));
  // o servidor republica a mensagem da proposta com o novo status
  await act(async () =>
    mockStomp.onMensagem?.(
      msg(3, EMPRESA, 'Pacote completo', {
        tipo: 'PROPOSTA',
        proposta: { ...proposta, status: 'ACEITA' },
      }),
    ),
  );
  expect(await screen.findByText('Aceita')).toBeTruthy();
  expect(screen.queryByTestId('aceitar-3')).toBeNull();
});

it('lista de conversas mostra prévia e não lidas', async () => {
  api.listarConversas.mockResolvedValue([
    { ...conversa, naoLidas: 2, ultimaMensagem: msg(9, EMPRESA, 'Podemos marcar uma visita?') },
  ]);
  await renderTela(<ConversasScreen />);
  expect(await screen.findByText('Podemos marcar uma visita?')).toBeTruthy();
  expect(screen.getByText('2')).toBeTruthy();
  await fireEvent.press(screen.getByTestId('conversa-11'));
  expect(router.push).toHaveBeenCalledWith('/chat/11');
});

it('lista vazia', async () => {
  api.listarConversas.mockResolvedValue([]);
  await renderTela(<ConversasScreen />);
  expect(await screen.findByText('Nenhuma conversa ainda')).toBeTruthy();
});
