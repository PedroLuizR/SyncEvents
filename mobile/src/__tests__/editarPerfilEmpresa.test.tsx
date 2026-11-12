import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as authApi from '@/api/auth';
import * as empresaApi from '@/api/empresa';
import type { EmpresaPerfil } from '@/api/types';
import EditarPerfilEmpresaScreen from '@/app/empresa/perfil-editar';
import { useSessionStore } from '@/store/session';
import { renderTela } from '@/test-utils/render';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('@/api/auth');
jest.mock('@/api/empresa');
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('@/utils/confirmar', () => ({
  confirmar: ({ onConfirmar }: { onConfirmar: () => void }) => onConfirmar(),
}));

const auth = jest.mocked(authApi);
const api = jest.mocked(empresaApi);
const { router } = jest.requireMock('expo-router');

const perfil: EmpresaPerfil = {
  id: 1,
  codigo: '504731',
  nomeFantasia: 'Ateliê Aurora',
  cnpj: '11222333000181',
  email: 'contato@aurora.com',
  telefone: '1134567890',
  cidade: 'São Paulo, SP',
  categorias: [{ id: 1, nome: 'Decoração', icone: 'star' }],
  portfolio: [{ id: 9, url: '/files/portfolio/a.jpg', ordem: 0 }],
};

beforeEach(() => {
  jest.clearAllMocks();
  auth.listarCategorias.mockResolvedValue([
    { id: 1, nome: 'Decoração', icone: 'star' },
    { id: 2, nome: 'Buffet', icone: 'coffee' },
  ]);
  auth.buscarMe.mockResolvedValue({
    id: 1,
    email: 'contato@aurora.com',
    tipo: 'EMPRESA',
    perfilId: 1,
    nome: 'Ateliê Aurora Eventos',
    telefone: '1134567890',
    cidade: 'São Paulo, SP',
  });
  api.buscarMinhaEmpresa.mockResolvedValue(perfil);
  api.atualizarMinhaEmpresa.mockImplementation(async (d) => ({ ...perfil, ...d }) as EmpresaPerfil);
  api.removerFotoPortfolio.mockResolvedValue({ ...perfil, portfolio: [] });
});

it('mostra CNPJ e e-mail só para leitura e salva os dados editáveis', async () => {
  await renderTela(<EditarPerfilEmpresaScreen />);
  expect(await screen.findByText('CNPJ: 11.222.333/0001-81')).toBeTruthy();
  expect(screen.getByTestId('campo-telefone').props.value).toBe('(11) 3456-7890');

  await fireEvent.changeText(screen.getByTestId('campo-nome-fantasia'), 'Ateliê Aurora Eventos');
  await fireEvent.changeText(screen.getByTestId('campo-endereco'), 'Rua das Flores, 100');
  await fireEvent.press(await screen.findByRole('checkbox', { name: 'Buffet' }));
  await fireEvent.press(screen.getByTestId('salvar-perfil'));

  await waitFor(() => expect(api.atualizarMinhaEmpresa).toHaveBeenCalled());
  expect(api.atualizarMinhaEmpresa).toHaveBeenCalledWith({
    nomeFantasia: 'Ateliê Aurora Eventos',
    telefone: '(11) 3456-7890',
    cidade: 'São Paulo, SP',
    endereco: 'Rua das Flores, 100',
    descricao: undefined,
    categoriaIds: [1, 2],
  });
  await waitFor(() =>
    expect(useSessionStore.getState().usuario?.nome).toBe('Ateliê Aurora Eventos'),
  );
  expect(router.back).toHaveBeenCalled();
});

it('exige ao menos uma categoria', async () => {
  await renderTela(<EditarPerfilEmpresaScreen />);
  await fireEvent.press(await screen.findByRole('checkbox', { name: 'Decoração' }));
  await fireEvent.press(screen.getByTestId('salvar-perfil'));
  expect(await screen.findByText('Escolha ao menos uma categoria')).toBeTruthy();
  expect(api.atualizarMinhaEmpresa).not.toHaveBeenCalled();
});

it('remove foto do portfólio após confirmação', async () => {
  await renderTela(<EditarPerfilEmpresaScreen />);
  await fireEvent.press(await screen.findByRole('button', { name: 'Remover foto 1' }));
  await waitFor(() => expect(api.removerFotoPortfolio).toHaveBeenCalledWith(9));
});
