import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as authApi from '@/api/auth';
import * as buscaApi from '@/api/busca';
import BuscarScreen from '@/app/cliente/(tabs)/buscar';
import { useSessionStore } from '@/store/session';
import { CATEGORIAS, empresaResumo, pagina } from '@/test-utils/dados';
import { renderTela } from '@/test-utils/render';

const mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/api/auth');
jest.mock('@/api/busca');

const auth = jest.mocked(authApi);
const busca = jest.mocked(buscaApi);
const { router } = jest.requireMock('expo-router');

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(mockParams).forEach((k) => delete mockParams[k]);
  auth.listarCategorias.mockResolvedValue(CATEGORIAS);
  useSessionStore.setState({
    usuario: {
      id: 1,
      email: 'm@e.com',
      tipo: 'CLIENTE',
      perfilId: 1,
      nome: 'Marina',
      telefone: '11987654321',
      cidade: 'São Paulo, SP',
    },
  });
});

it('busca com os filtros da rota e mostra a contagem', async () => {
  mockParams.q = 'decoração';
  mockParams.categoriaId = '1';
  mockParams.cidade = 'São Paulo';
  busca.buscarEmpresas.mockResolvedValue(pagina([empresaResumo(1), empresaResumo(2)], 2));
  await renderTela(<BuscarScreen />);

  expect(await screen.findByText('Empresa 1')).toBeTruthy();
  expect(screen.getByText('2 resultados em São Paulo')).toBeTruthy();
  expect(busca.buscarEmpresas).toHaveBeenCalledWith(
    { q: 'decoração', categoriaId: 1, cidade: 'São Paulo', ordenar: undefined },
    0,
  );
  expect(screen.getByText('Filtros · 2')).toBeTruthy();
});

it('tocar numa categoria atualiza a rota', async () => {
  busca.buscarEmpresas.mockResolvedValue(pagina([empresaResumo(1)]));
  await renderTela(<BuscarScreen />);
  await fireEvent.press(await screen.findByRole('checkbox', { name: 'Buffet' }));
  expect(router.setParams).toHaveBeenCalledWith({ categoriaId: '2' });
});

it('carrega a próxima página ao chegar no fim da lista', async () => {
  busca.buscarEmpresas
    .mockResolvedValueOnce(pagina([empresaResumo(1)], 2, 0, false))
    .mockResolvedValueOnce(pagina([empresaResumo(2)], 2, 1, true));
  await renderTela(<BuscarScreen />);
  await screen.findByText('Empresa 1');
  await fireEvent(screen.getByTestId('lista-busca'), 'endReached');
  expect(await screen.findByText('Empresa 2')).toBeTruthy();
  expect(busca.buscarEmpresas).toHaveBeenLastCalledWith(expect.anything(), 1);
});

it('estado vazio permite limpar a busca', async () => {
  mockParams.q = 'xyz';
  busca.buscarEmpresas.mockResolvedValue(pagina([], 0));
  await renderTela(<BuscarScreen />);
  expect(await screen.findByText('Nenhuma empresa encontrada')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Limpar filtros' }));
  expect(router.setParams).toHaveBeenCalledWith({
    q: '',
    categoriaId: '',
    cidade: '',
    ordenar: '',
  });
});

it('estado de erro', async () => {
  busca.buscarEmpresas.mockRejectedValue(new Error('x'));
  await renderTela(<BuscarScreen />);
  expect(await screen.findByText('Não foi possível buscar')).toBeTruthy();
});

it('aplica cidade e ordenação pelos filtros', async () => {
  busca.buscarEmpresas.mockResolvedValue(pagina([empresaResumo(1)]));
  await renderTela(<BuscarScreen />);
  await screen.findByText('Empresa 1');
  await fireEvent.press(screen.getByTestId('abrir-filtros'));
  await fireEvent.press(await screen.findByRole('checkbox', { name: 'Minha cidade (São Paulo)' }));
  await fireEvent.press(screen.getByRole('checkbox', { name: 'Menor preço' }));
  await fireEvent.press(screen.getByTestId('aplicar-filtros'));
  await waitFor(() =>
    expect(router.setParams).toHaveBeenCalledWith({ cidade: 'São Paulo, SP', ordenar: 'preco' }),
  );
});
