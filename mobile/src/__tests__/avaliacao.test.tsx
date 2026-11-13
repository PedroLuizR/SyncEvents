import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as avaliacoesApi from '@/api/avaliacoes';
import * as solApi from '@/api/solicitacoes';
import MinhasSolicitacoesScreen from '@/app/cliente/(tabs)/solicitacoes';
import { useSessionStore } from '@/store/session';
import { solicitacao } from '@/test-utils/dados';
import { renderTela } from '@/test-utils/render';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), navigate: jest.fn() } }));
jest.mock('@/api/solicitacoes');
jest.mock('@/api/avaliacoes');

const sol = jest.mocked(solApi);
const api = jest.mocked(avaliacoesApi);

beforeEach(() => {
  jest.clearAllMocks();
  useSessionStore.setState({
    usuario: {
      id: 1,
      email: 'm@e.com',
      tipo: 'CLIENTE',
      perfilId: 3,
      nome: 'Marina Alves',
      telefone: '11987654321',
      cidade: 'São Paulo, SP',
    },
  });
});

it('só eventos concluídos e não avaliados mostram "Avaliar empresa"', async () => {
  sol.listarMinhasSolicitacoes.mockResolvedValue([
    solicitacao(1, { status: 'CONCLUIDA' }),
    solicitacao(2, { status: 'CONCLUIDA', avaliada: true }),
    solicitacao(3, { status: 'ACEITA' }),
  ]);
  await renderTela(<MinhasSolicitacoesScreen />);
  expect(await screen.findByTestId('avaliar-1')).toBeTruthy();
  expect(screen.queryByTestId('avaliar-2')).toBeNull();
  expect(screen.queryByTestId('avaliar-3')).toBeNull();
});

it('exige a nota e publica com destaques e comentário', async () => {
  sol.listarMinhasSolicitacoes.mockResolvedValue([solicitacao(1, { status: 'CONCLUIDA' })]);
  api.avaliar.mockResolvedValue({
    id: 10,
    solicitacaoId: 1,
    empresaId: 1,
    nota: 4,
    destaques: ['PONTUALIDADE'],
    tipoEvento: 'CASAMENTO',
    autor: { nome: 'Marina A.' },
    criadoEm: new Date().toISOString(),
  });
  await renderTela(<MinhasSolicitacoesScreen />);
  await fireEvent.press(await screen.findByTestId('avaliar-1'));
  expect(screen.getByText('Evento concluído')).toBeTruthy();
  expect(screen.getAllByText('Ateliê Aurora').length).toBeGreaterThan(0);

  await fireEvent.press(screen.getByTestId('publicar-avaliacao'));
  expect(screen.getByText('Escolha uma nota de 1 a 5')).toBeTruthy();
  expect(api.avaliar).not.toHaveBeenCalled();

  await fireEvent.press(screen.getByRole('button', { name: '4 estrelas' }));
  expect(screen.getByText('Boa')).toBeTruthy();
  await fireEvent.press(screen.getByRole('checkbox', { name: 'Pontualidade' }));
  await fireEvent.changeText(screen.getByTestId('comentario-avaliacao'), '  Tudo no horário!  ');
  await fireEvent.press(screen.getByTestId('publicar-avaliacao'));

  await waitFor(() =>
    expect(api.avaliar).toHaveBeenCalledWith({
      solicitacaoId: 1,
      nota: 4,
      destaques: ['PONTUALIDADE'],
      comentario: 'Tudo no horário!',
    }),
  );
  await waitFor(() => expect(screen.queryByTestId('form-avaliacao')).toBeNull());
});

it('mostra o erro do servidor (já avaliado)', async () => {
  sol.listarMinhasSolicitacoes.mockResolvedValue([solicitacao(1, { status: 'CONCLUIDA' })]);
  api.avaliar.mockRejectedValue(
    Object.assign(new Error('x'), {
      isAxiosError: true,
      response: {
        status: 409,
        data: { status: 409, erro: 'CONFLITO', mensagem: 'Você já avaliou este evento' },
      },
    }),
  );
  await renderTela(<MinhasSolicitacoesScreen />);
  await fireEvent.press(await screen.findByTestId('avaliar-1'));
  await fireEvent.press(screen.getByRole('button', { name: '5 estrelas' }));
  await fireEvent.press(screen.getByTestId('publicar-avaliacao'));
  expect(await screen.findByText('Você já avaliou este evento')).toBeTruthy();
});
