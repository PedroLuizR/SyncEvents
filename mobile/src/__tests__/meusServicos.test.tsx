import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as servicosApi from '@/api/servicos';
import type { Servico } from '@/api/types';
import MeusServicosScreen from '@/app/empresa/(tabs)/servicos';
import { renderTela } from '@/test-utils/render';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/api/servicos');
jest.mock('@/utils/confirmar', () => ({
  confirmar: ({ onConfirmar }: { onConfirmar: () => void }) => onConfirmar(),
}));

const api = jest.mocked(servicosApi);
const { router } = jest.requireMock('expo-router');

const servico = (id: number, extra: Partial<Servico> = {}): Servico => ({
  id,
  empresaId: 1,
  categoria: { id: 1, nome: 'Decoração', icone: 'star' },
  nome: `Serviço ${id}`,
  modeloPreco: 'A_PARTIR_DE',
  precoMin: 2800,
  ativo: true,
  rascunho: false,
  fotos: [],
  itensInclusos: [],
  criadoEm: '',
  atualizadoEm: '',
  ...extra,
});

beforeEach(() => jest.clearAllMocks());

it('mostra estado vazio com atalho para cadastrar', async () => {
  api.listarMeusServicos.mockResolvedValue([]);
  await renderTela(<MeusServicosScreen />);
  expect(await screen.findByText('Nenhum serviço ainda')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar serviço' }));
  expect(router.push).toHaveBeenCalledWith('/empresa/servico/novo');
});

it('lista os serviços com preço e status', async () => {
  api.listarMeusServicos.mockResolvedValue([
    servico(1),
    servico(2, { ativo: false }),
    servico(3, { rascunho: true, modeloPreco: 'SOB_CONSULTA', precoMin: undefined }),
  ]);
  await renderTela(<MeusServicosScreen />);
  expect(await screen.findByText('Serviço 1')).toBeTruthy();
  expect(screen.getAllByText('a partir de R$ 2.800')).toHaveLength(2);
  expect(screen.getByText('Ativo')).toBeTruthy();
  expect(screen.getByText('Inativo')).toBeTruthy();
  expect(screen.getByText('Rascunho')).toBeTruthy();
  expect(screen.getByText('Sob consulta')).toBeTruthy();

  await fireEvent.press(screen.getByRole('button', { name: 'Editar Serviço 2' }));
  expect(router.push).toHaveBeenCalledWith('/empresa/servico/2');
});

it('exclui após confirmar e tira da lista', async () => {
  api.listarMeusServicos
    .mockResolvedValueOnce([servico(1), servico(2)])
    .mockResolvedValue([servico(2)]);
  api.excluirServico.mockResolvedValue();
  await renderTela(<MeusServicosScreen />);
  await fireEvent.press(await screen.findByRole('button', { name: 'Excluir Serviço 1' }));
  await waitFor(() => expect(api.excluirServico).toHaveBeenCalledWith(1));
  await waitFor(() => expect(screen.queryByText('Serviço 1')).toBeNull());
  expect(screen.getByText('Serviço 2')).toBeTruthy();
});

it('mostra erro ao carregar', async () => {
  api.listarMeusServicos.mockRejectedValue(new Error('falha'));
  await renderTela(<MeusServicosScreen />);
  expect(await screen.findByText('Não foi possível carregar')).toBeTruthy();
});
