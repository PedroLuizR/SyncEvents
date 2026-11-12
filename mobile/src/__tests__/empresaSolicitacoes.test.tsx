import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as solApi from '@/api/solicitacoes';
import PainelEmpresaScreen from '@/app/empresa/(tabs)/index';
import DetalheSolicitacaoEmpresaScreen from '@/app/empresa/solicitacao/[id]';
import { useSessionStore } from '@/store/session';
import { solicitacao } from '@/test-utils/dados';
import { renderTela } from '@/test-utils/render';

const mockParams: Record<string, string> = { id: '5' };
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), navigate: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/api/solicitacoes');
jest.mock('@/utils/confirmar', () => ({
  confirmar: ({ onConfirmar }: { onConfirmar: () => void }) => onConfirmar(),
}));

const api = jest.mocked(solApi);
const { router } = jest.requireMock('expo-router');

beforeEach(() => {
  jest.clearAllMocks();
  delete mockParams.proposta;
  useSessionStore.setState({
    usuario: {
      id: 1,
      email: 'a@a.com',
      tipo: 'EMPRESA',
      perfilId: 1,
      nome: 'Ateliê Aurora',
      telefone: '1134567890',
      cidade: 'São Paulo, SP',
    },
  });
});

describe('Painel', () => {
  it('mostra indicadores reais e as solicitações em aberto', async () => {
    api.buscarDashboard.mockResolvedValue({
      dias: 30,
      visualizacoes: 1248,
      variacaoVisualizacoes: 18,
      solicitacoes: 24,
      variacaoSolicitacoes: -5,
      taxaResposta: 92,
      pendentes: 2,
      servicosAtivos: 6,
      servicosRascunho: 1,
    });
    api.listarMinhasSolicitacoes.mockResolvedValue([
      solicitacao(1),
      solicitacao(2, {
        status: 'CANCELADA',
        cliente: { ...solicitacao(2).cliente, nome: 'Fora da lista' },
      }),
    ]);
    await renderTela(<PainelEmpresaScreen />);

    expect(await screen.findByText('1.248')).toBeTruthy();
    expect(screen.getByText('+18%')).toBeTruthy();
    expect(screen.getByText('-5%')).toBeTruthy();
    expect(screen.getByText('92%')).toBeTruthy();
    expect(screen.getByText('Excelente · acima de 90%')).toBeTruthy();
    expect(screen.getByText('6 ativos · 1 rascunho')).toBeTruthy();
    expect(await screen.findByText('Marina Alves')).toBeTruthy();
    expect(screen.queryByText('Fora da lista')).toBeNull();
    expect(screen.getByText('Novo')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Responder' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/empresa/solicitacao/[id]',
      params: { id: '1', proposta: '1' },
    });
  });

  it('sem solicitações no período, a taxa aparece como traço', async () => {
    api.buscarDashboard.mockResolvedValue({
      dias: 30,
      visualizacoes: 0,
      solicitacoes: 0,
      pendentes: 0,
      servicosAtivos: 0,
      servicosRascunho: 0,
    });
    api.listarMinhasSolicitacoes.mockResolvedValue([]);
    await renderTela(<PainelEmpresaScreen />);
    expect(await screen.findByText('—')).toBeTruthy();
    expect(await screen.findByText('Nenhuma solicitação em aberto')).toBeTruthy();
  });
});

describe('Detalhe (empresa)', () => {
  it('marca em análise', async () => {
    api.buscarSolicitacao.mockResolvedValue(solicitacao(5));
    api.mudarStatusSolicitacao.mockResolvedValue(solicitacao(5, { status: 'EM_ANALISE' }));
    await renderTela(<DetalheSolicitacaoEmpresaScreen />);
    await fireEvent.press(await screen.findByTestId('marcar-analise'));
    await waitFor(() => expect(api.mudarStatusSolicitacao).toHaveBeenCalledWith(5, 'EM_ANALISE'));
    expect(await screen.findByText('Em análise')).toBeTruthy();
  });

  it('envia proposta com valor convertido', async () => {
    mockParams.proposta = '1';
    api.buscarSolicitacao.mockResolvedValue(solicitacao(5, { status: 'EM_ANALISE' }));
    api.enviarProposta.mockResolvedValue(
      solicitacao(5, {
        status: 'EM_NEGOCIACAO',
        propostas: [
          {
            id: 1,
            valor: 10500,
            descricao: 'Projeto',
            status: 'ENVIADA',
            criadoEm: new Date().toISOString(),
          },
        ],
      }),
    );
    await renderTela(<DetalheSolicitacaoEmpresaScreen />);
    await fireEvent.press(await screen.findByTestId('confirmar-proposta'));
    expect(await screen.findByText('Informe o valor')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('proposta-valor'), '1050000');
    await fireEvent.changeText(screen.getByTestId('proposta-descricao'), 'Projeto');
    await fireEvent.press(screen.getByTestId('confirmar-proposta'));
    await waitFor(() =>
      expect(api.enviarProposta).toHaveBeenCalledWith(5, { valor: 10500, descricao: 'Projeto' }),
    );
    expect(
      await screen.findByText('Proposta enviada. Aguardando a resposta do cliente.'),
    ).toBeTruthy();
    expect(screen.queryByTestId('abrir-proposta')).toBeNull();
  });

  it('conclui depois de aceita', async () => {
    api.buscarSolicitacao.mockResolvedValue(solicitacao(5, { status: 'ACEITA' }));
    api.mudarStatusSolicitacao.mockResolvedValue(solicitacao(5, { status: 'CONCLUIDA' }));
    await renderTela(<DetalheSolicitacaoEmpresaScreen />);
    expect(screen.queryByTestId('recusar-solicitacao')).toBeNull();
    await fireEvent.press(await screen.findByTestId('marcar-concluida'));
    await waitFor(() => expect(api.mudarStatusSolicitacao).toHaveBeenCalledWith(5, 'CONCLUIDA'));
  });

  it('mostra o erro 409 do servidor', async () => {
    api.buscarSolicitacao.mockResolvedValue(solicitacao(5));
    api.mudarStatusSolicitacao.mockRejectedValue(
      Object.assign(new Error('x'), {
        isAxiosError: true,
        response: {
          status: 409,
          data: {
            status: 409,
            erro: 'CONFLITO',
            mensagem: 'Não é possível mudar de pendente para concluída',
          },
        },
      }),
    );
    await renderTela(<DetalheSolicitacaoEmpresaScreen />);
    await fireEvent.press(await screen.findByTestId('marcar-analise'));
    expect(await screen.findByText('Não é possível mudar de pendente para concluída')).toBeTruthy();
  });
});
