import { fireEvent, screen } from '@testing-library/react-native';

import * as authApi from '@/api/auth';
import * as buscaApi from '@/api/busca';
import InicioClienteScreen from '@/app/cliente/(tabs)/index';
import { useSessionStore } from '@/store/session';
import { CATEGORIAS, empresaResumo } from '@/test-utils/dados';
import { renderTela } from '@/test-utils/render';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), navigate: jest.fn() } }));
jest.mock('@/api/auth');
jest.mock('@/api/busca');

const auth = jest.mocked(authApi);
const busca = jest.mocked(buscaApi);
const { router } = jest.requireMock('expo-router');

beforeEach(() => {
  jest.clearAllMocks();
  useSessionStore.setState({
    usuario: {
      id: 1,
      email: 'm@e.com',
      tipo: 'CLIENTE',
      perfilId: 1,
      nome: 'Marina Alves',
      telefone: '11987654321',
      cidade: 'São Paulo, SP',
    },
  });
  auth.listarCategorias.mockResolvedValue(CATEGORIAS);
});

it('saúda o cliente e mostra categorias e recomendados', async () => {
  busca.buscarRecomendadas.mockResolvedValue([
    empresaResumo(1, { nomeFantasia: 'Ateliê Aurora' }),
    empresaResumo(2, {
      nomeFantasia: 'Lume Fotografia',
      categorias: [CATEGORIAS[2]],
      precoAPartirDe: undefined,
    }),
  ]);
  await renderTela(<InicioClienteScreen />);
  expect(screen.getByText('Olá, Marina')).toBeTruthy();
  expect(screen.getByText('Vamos celebrar?')).toBeTruthy();
  expect(await screen.findByText('Ateliê Aurora')).toBeTruthy();
  expect(screen.getByText('A partir de R$ 2.800')).toBeTruthy();
  expect(screen.getByText('Preço sob consulta')).toBeTruthy();
  expect(screen.getAllByText('Novo')).toHaveLength(2);
  expect(await screen.findByRole('button', { name: 'Categoria Buffet' })).toBeTruthy();
});

it('abre a busca pela categoria, pelo texto e pelo card', async () => {
  busca.buscarRecomendadas.mockResolvedValue([empresaResumo(9, { nomeFantasia: 'Casa Luz' })]);
  await renderTela(<InicioClienteScreen />);

  await fireEvent.press(await screen.findByRole('button', { name: 'Categoria Buffet' }));
  expect(router.navigate).toHaveBeenCalledWith({
    pathname: '/cliente/buscar',
    params: { categoriaId: '2' },
  });

  await fireEvent.changeText(screen.getByTestId('busca-inicio'), 'decoração');
  await fireEvent(screen.getByTestId('busca-inicio'), 'submitEditing');
  expect(router.navigate).toHaveBeenCalledWith({
    pathname: '/cliente/buscar',
    params: { q: 'decoração' },
  });

  await fireEvent.press(await screen.findByTestId('empresa-9'));
  expect(router.push).toHaveBeenCalledWith('/cliente/empresa/9');
});

it('mostra erro nos recomendados com opção de tentar de novo', async () => {
  busca.buscarRecomendadas.mockRejectedValue(new Error('falha'));
  await renderTela(<InicioClienteScreen />);
  expect(await screen.findByText('Não foi possível carregar')).toBeTruthy();
});
