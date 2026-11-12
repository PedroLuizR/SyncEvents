import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as authApi from '@/api/auth';
import CadastroClienteScreen from '@/app/(auth)/cadastro-cliente';

import { erroApi, renderTela } from '@/test-utils/render';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), dismissTo: jest.fn(), back: jest.fn() },
}));
jest.mock('@/api/auth');
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));

const api = jest.mocked(authApi);
const { router } = jest.requireMock('expo-router');

async function preencherEtapa1(email = 'marina@email.com') {
  await fireEvent.changeText(screen.getByTestId('campo-nome'), 'Marina Alves');
  await fireEvent.changeText(screen.getByTestId('campo-email'), email);
  await fireEvent.changeText(screen.getByTestId('campo-telefone'), '11987654321');
  await fireEvent.changeText(screen.getByTestId('campo-cidade'), 'São Paulo, SP');
  await fireEvent.changeText(screen.getByTestId('campo-senha'), 'Senha@123');
  await fireEvent.press(screen.getByRole('checkbox', { name: 'Casamento' }));
  await fireEvent.press(screen.getByTestId('aceite-termos'));
}

beforeEach(() => jest.clearAllMocks());

it('mostra as mensagens de validação da etapa 1', async () => {
  await renderTela(<CadastroClienteScreen />);
  await fireEvent.changeText(screen.getByTestId('campo-senha'), 'fraca');
  await fireEvent.changeText(screen.getByTestId('campo-nome'), 'Marina 2');
  await fireEvent.press(screen.getByTestId('continuar-cadastro'));

  expect(await screen.findByText('O nome deve conter apenas letras e espaços')).toBeTruthy();
  expect(screen.getByText('Informe seu e-mail')).toBeTruthy();
  expect(
    screen.getByText(
      'A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial',
    ),
  ).toBeTruthy();
  expect(screen.getByText('Aceite os Termos de Uso para continuar')).toBeTruthy();
  expect(screen.getByText('Cadastro de cliente · etapa 1 de 2')).toBeTruthy();
});

it('aplica a máscara de celular', async () => {
  await renderTela(<CadastroClienteScreen />);
  await fireEvent.changeText(screen.getByTestId('campo-telefone'), '11987654321');
  expect(screen.getByTestId('campo-telefone').props.value).toBe('(11) 98765-4321');
});

it('avança para a etapa 2, cria a conta e volta ao login com mensagem', async () => {
  api.cadastrarCliente.mockResolvedValue({} as never);
  await renderTela(<CadastroClienteScreen />);
  await preencherEtapa1();
  await fireEvent.press(screen.getByTestId('continuar-cadastro'));

  expect(await screen.findByText('Cadastro de cliente · etapa 2 de 2')).toBeTruthy();
  await fireEvent.changeText(screen.getByTestId('campo-cpf'), '12345678900');
  await fireEvent.press(screen.getByTestId('criar-conta'));

  await waitFor(() => expect(api.cadastrarCliente).toHaveBeenCalled());
  expect(api.cadastrarCliente).toHaveBeenCalledWith(
    expect.objectContaining({
      nome: 'Marina Alves',
      email: 'marina@email.com',
      telefone: '(11) 98765-4321',
      interesses: ['CASAMENTO'],
      aceiteTermos: true,
      cpf: '123.456.789-00',
    }),
  );
  expect(router.dismissTo).toHaveBeenCalledWith({
    pathname: '/login',
    params: { tipo: 'CLIENTE', cadastro: 'ok', email: 'marina@email.com' },
  });
});

it('e-mail duplicado volta para a etapa 1 com a mensagem do servidor', async () => {
  api.cadastrarCliente.mockRejectedValue(
    erroApi(400, 'Dados inválidos', { email: 'E-mail já cadastrado' }),
  );
  await renderTela(<CadastroClienteScreen />);
  await preencherEtapa1('existe@email.com');
  await fireEvent.press(screen.getByTestId('continuar-cadastro'));
  await screen.findByText('Cadastro de cliente · etapa 2 de 2');
  await fireEvent.press(screen.getByTestId('criar-conta'));

  expect(await screen.findByText('E-mail já cadastrado')).toBeTruthy();
  expect(screen.getByText('Cadastro de cliente · etapa 1 de 2')).toBeTruthy();
  expect(router.dismissTo).not.toHaveBeenCalled();
});
