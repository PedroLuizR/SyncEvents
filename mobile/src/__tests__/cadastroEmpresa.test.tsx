import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as authApi from '@/api/auth';
import CadastroEmpresaScreen from '@/app/(auth)/cadastro-empresa';

import { renderTela } from '@/test-utils/render';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), dismissTo: jest.fn(), back: jest.fn() },
}));
jest.mock('@/api/auth');
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));

const api = jest.mocked(authApi);
const { router } = jest.requireMock('expo-router');

beforeEach(() => {
  jest.clearAllMocks();
  api.listarCategorias.mockResolvedValue([
    { id: 1, nome: 'Decoração', icone: 'star' },
    { id: 2, nome: 'Buffet', icone: 'coffee' },
  ]);
});

it('mostra CNPJ inválido e exige categoria', async () => {
  await renderTela(<CadastroEmpresaScreen />);
  await screen.findByText('Decoração');
  await fireEvent.changeText(screen.getByTestId('campo-cnpj'), '11222333000182');
  expect(screen.getByTestId('campo-cnpj').props.value).toBe('11.222.333/0001-82');
  await fireEvent.press(screen.getByTestId('salvar-continuar'));
  expect(await screen.findByText('CNPJ inválido')).toBeTruthy();
  expect(screen.getByText('Escolha ao menos uma categoria')).toBeTruthy();
});

it('cadastra a empresa em 2 etapas com endereço opcional', async () => {
  api.cadastrarEmpresa.mockResolvedValue({} as never);
  await renderTela(<CadastroEmpresaScreen />);
  await screen.findByText('Decoração');

  await fireEvent.changeText(screen.getByTestId('campo-nome-fantasia'), 'Ateliê Aurora');
  await fireEvent.changeText(screen.getByTestId('campo-cnpj'), '11222333000181');
  await fireEvent.changeText(screen.getByTestId('campo-email'), 'contato@aurora.com');
  await fireEvent.changeText(screen.getByTestId('campo-telefone'), '1134567890');
  await fireEvent.changeText(screen.getByTestId('campo-cidade'), 'São Paulo, SP');
  await fireEvent.press(screen.getByRole('checkbox', { name: 'Decoração' }));
  await fireEvent.press(screen.getByRole('checkbox', { name: 'Buffet' }));
  await fireEvent.press(screen.getByTestId('salvar-continuar'));

  expect(await screen.findByText('Perfil profissional · etapa 2 de 2')).toBeTruthy();
  // o campo de senha da etapa 2 começa oculto mesmo reaproveitando o componente da etapa 1
  expect(screen.getByTestId('campo-confirmar-senha').props.secureTextEntry).toBe(true);
  await fireEvent.changeText(screen.getByTestId('campo-senha'), 'Senha@123');
  await fireEvent.changeText(screen.getByTestId('campo-confirmar-senha'), 'Outra@123');
  await fireEvent.press(screen.getByTestId('aceite-termos'));
  await fireEvent.press(screen.getByTestId('criar-conta'));
  expect(await screen.findByText('As senhas não conferem')).toBeTruthy();

  await fireEvent.changeText(screen.getByTestId('campo-confirmar-senha'), 'Senha@123');
  await fireEvent.press(screen.getByTestId('criar-conta'));

  await waitFor(() => expect(api.cadastrarEmpresa).toHaveBeenCalled());
  const enviado = api.cadastrarEmpresa.mock.calls[0][0];
  expect(enviado).toMatchObject({
    nomeFantasia: 'Ateliê Aurora',
    cnpj: '11.222.333/0001-81',
    categoriaIds: [1, 2],
    senha: 'Senha@123',
  });
  expect(enviado).not.toHaveProperty('confirmarSenha');
  expect(router.dismissTo).toHaveBeenCalledWith({
    pathname: '/login',
    params: { tipo: 'EMPRESA', cadastro: 'ok', email: 'contato@aurora.com' },
  });
});
