import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as authApi from '@/api/auth';
import LoginScreen from '@/app/(auth)/login';
import { useSessionStore } from '@/store/session';

import { erroApi, renderTela } from '@/test-utils/render';

const mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/api/auth');

const api = jest.mocked(authApi);
const { router } = jest.requireMock('expo-router');

const usuario = {
  id: 1,
  email: 'marina@email.com',
  tipo: 'CLIENTE' as const,
  perfilId: 2,
  nome: 'Marina Alves',
  telefone: '11987654321',
  cidade: 'São Paulo, SP',
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(mockParams).forEach((k) => delete mockParams[k]);
  useSessionStore.setState({ token: null, usuario: null });
});

it('valida os campos antes de enviar', async () => {
  await renderTela(<LoginScreen />);
  await fireEvent.press(screen.getByTestId('entrar'));
  expect(await screen.findByText('Informe seu e-mail')).toBeTruthy();
  expect(screen.getByText('Informe sua senha')).toBeTruthy();
  expect(api.login).not.toHaveBeenCalled();
});

it('faz login como cliente e inicia a sessão', async () => {
  api.login.mockResolvedValue({ token: 'jwt', usuario });
  await renderTela(<LoginScreen />);
  await fireEvent.changeText(screen.getByTestId('campo-login'), 'marina@email.com');
  await fireEvent.changeText(screen.getByTestId('campo-senha'), 'Senha@123');
  await fireEvent.press(screen.getByTestId('entrar'));

  await waitFor(() => expect(useSessionStore.getState().token).toBe('jwt'));
  expect(api.login).toHaveBeenCalledWith({
    login: 'marina@email.com',
    senha: 'Senha@123',
    tipo: 'CLIENTE',
  });
  expect(useSessionStore.getState().usuario?.nome).toBe('Marina Alves');
});

it('envia tipo EMPRESA na aba Empresa e aceita CNPJ', async () => {
  api.login.mockResolvedValue({ token: 'jwt', usuario: { ...usuario, tipo: 'EMPRESA' } });
  await renderTela(<LoginScreen />);
  await fireEvent.press(screen.getByRole('tab', { name: 'Empresa' }));
  expect(screen.getByText('E-mail ou CNPJ')).toBeTruthy();
  await fireEvent.changeText(screen.getByTestId('campo-login'), '11.222.333/0001-81');
  await fireEvent.changeText(screen.getByTestId('campo-senha'), 'Senha@123');
  await fireEvent.press(screen.getByTestId('entrar'));
  await waitFor(() =>
    expect(api.login).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'EMPRESA' })),
  );
});

it('mostra a mensagem do servidor quando o login está errado', async () => {
  api.login.mockRejectedValue(erroApi(401, 'E-mail ou senha incorretos'));
  await renderTela(<LoginScreen />);
  await fireEvent.changeText(screen.getByTestId('campo-login'), 'marina@email.com');
  await fireEvent.changeText(screen.getByTestId('campo-senha'), 'Errada@123');
  await fireEvent.press(screen.getByTestId('entrar'));
  expect(await screen.findByText('E-mail ou senha incorretos')).toBeTruthy();
  expect(useSessionStore.getState().token).toBeNull();
});

it('mostra a mensagem de sucesso vinda do cadastro e preenche o e-mail', async () => {
  mockParams.cadastro = 'ok';
  mockParams.email = 'nova@email.com';
  await renderTela(<LoginScreen />);
  expect(screen.getByText('Cadastro realizado! Entre com seu e-mail e senha.')).toBeTruthy();
  expect(screen.getByTestId('campo-login').props.value).toBe('nova@email.com');
});

it('leva ao cadastro do perfil selecionado', async () => {
  await renderTela(<LoginScreen />);
  await fireEvent.press(screen.getByRole('tab', { name: 'Empresa' }));
  await fireEvent.press(screen.getByText('Cadastre-se'));
  expect(router.push).toHaveBeenCalledWith('/cadastro-empresa');
});
