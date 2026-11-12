import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as solApi from '@/api/solicitacoes';
import MinhasSolicitacoesScreen from '@/app/cliente/(tabs)/solicitacoes';
import DetalheSolicitacaoClienteScreen from '@/app/cliente/solicitacao/[id]';
import { solicitacao } from '@/test-utils/dados';
import { renderTela } from '@/test-utils/render';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), navigate: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: '5' }),
}));
jest.mock('@/api/solicitacoes');
jest.mock('@/utils/confirmar', () => ({
  confirmar: ({ onConfirmar }: { onConfirmar: () => void }) => onConfirmar(),
}));

const api = jest.mocked(solApi);
const { router } = jest.requireMock('expo-router');
const proposta = {
  id: 90,
  valor: 10500,
  descricao: 'Projeto completo',
  status: 'ENVIADA' as const,
  criadoEm: new Date().toISOString(),
};

beforeEach(() => jest.clearAllMocks());

describe('Minhas solicitações', () => {
  it('mostra resumo, abas com contagem e filtra', async () => {
    api.listarMinhasSolicitacoes.mockResolvedValue([
      solicitacao(1, { empresa: { id: 1, nomeFantasia: 'Ateliê Aurora', cidade: 'SP' } }),
      solicitacao(2, {
        status: 'EM_NEGOCIACAO',
        propostaAtual: proposta,
        empresa: { id: 2, nomeFantasia: 'Lume', cidade: 'SP' },
      }),
      solicitacao(3, {
        status: 'CONCLUIDA',
        empresa: { id: 3, nomeFantasia: 'Som Alto', cidade: 'BH' },
      }),
    ]);
    await renderTela(<MinhasSolicitacoesScreen />);
    expect(await screen.findByText('Ateliê Aurora')).toBeTruthy();
    expect(screen.getByText('em andamento')).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Aguardando 1' })).toBeTruthy();
    expect(screen.getByText('Proposta recebida')).toBeTruthy();
    expect(screen.getByText('Proposta: R$ 10.500')).toBeTruthy();

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Propostas 1' }));
    expect(screen.queryByText('Ateliê Aurora')).toBeNull();
    expect(screen.getByText('Lume')).toBeTruthy();

    await fireEvent.press(screen.getByText('Ver proposta'));
    expect(router.push).toHaveBeenCalledWith('/cliente/solicitacao/2');
  });

  it('estado vazio leva à busca', async () => {
    api.listarMinhasSolicitacoes.mockResolvedValue([]);
    await renderTela(<MinhasSolicitacoesScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Buscar empresas' }));
    expect(router.navigate).toHaveBeenCalledWith('/cliente/buscar');
  });
});

describe('Detalhe (cliente)', () => {
  it('aceita a proposta', async () => {
    api.buscarSolicitacao.mockResolvedValue(
      solicitacao(5, { status: 'EM_NEGOCIACAO', propostas: [proposta] }),
    );
    api.responderProposta.mockResolvedValue(
      solicitacao(5, { status: 'ACEITA', propostas: [{ ...proposta, status: 'ACEITA' }] }),
    );
    await renderTela(<DetalheSolicitacaoClienteScreen />);
    expect(await screen.findByText('R$ 10.500')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('aceitar-proposta'));
    await waitFor(() => expect(api.responderProposta).toHaveBeenCalledWith(90, 'ACEITA'));
    expect(
      await screen.findByText('Proposta aceita! Agora é só combinar os detalhes com a empresa.'),
    ).toBeTruthy();
    expect(screen.queryByTestId('cancelar-solicitacao')).toBeNull();
  });

  it('recusa a proposta', async () => {
    api.buscarSolicitacao.mockResolvedValue(
      solicitacao(5, { status: 'EM_NEGOCIACAO', propostas: [proposta] }),
    );
    api.responderProposta.mockResolvedValue(
      solicitacao(5, { status: 'EM_NEGOCIACAO', propostas: [{ ...proposta, status: 'RECUSADA' }] }),
    );
    await renderTela(<DetalheSolicitacaoClienteScreen />);
    await fireEvent.press(await screen.findByTestId('recusar-proposta'));
    await waitFor(() => expect(api.responderProposta).toHaveBeenCalledWith(90, 'RECUSADA'));
  });

  it('cancela uma solicitação aberta', async () => {
    api.buscarSolicitacao.mockResolvedValue(solicitacao(5));
    api.cancelarSolicitacao.mockResolvedValue(solicitacao(5, { status: 'CANCELADA' }));
    await renderTela(<DetalheSolicitacaoClienteScreen />);
    expect(await screen.findByText('A empresa ainda não abriu seu pedido.')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('cancelar-solicitacao'));
    await waitFor(() => expect(api.cancelarSolicitacao).toHaveBeenCalledWith(5));
    expect(await screen.findByText('Você cancelou esta solicitação.')).toBeTruthy();
  });
});
