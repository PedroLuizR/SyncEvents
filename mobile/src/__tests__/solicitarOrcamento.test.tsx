import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as buscaApi from '@/api/busca';
import * as solApi from '@/api/solicitacoes';
import SolicitarOrcamentoScreen from '@/app/cliente/orcamento/[empresaId]';
import { EMPRESA_PUBLICA, solicitacao } from '@/test-utils/dados';
import { renderTela } from '@/test-utils/render';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), navigate: jest.fn(), dismissAll: jest.fn() },
  useLocalSearchParams: () => ({ empresaId: '1' }),
}));
jest.mock('@/api/busca');
jest.mock('@/api/solicitacoes');
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('@react-native-community/datetimepicker', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return function DateTimePickerMock({
    onChange,
  }: {
    onChange: (e: { type: string }, d: Date) => void;
  }) {
    return (
      <Pressable
        testID="seletor-data"
        onPress={() => onChange({ type: 'set' }, new Date(2030, 5, 15, 12))}
      >
        <Text>seletor</Text>
      </Pressable>
    );
  };
});

const busca = jest.mocked(buscaApi);
const api = jest.mocked(solApi);
const { router } = jest.requireMock('expo-router');

beforeEach(() => {
  jest.clearAllMocks();
  busca.buscarEmpresaPublica.mockResolvedValue(EMPRESA_PUBLICA);
  api.criarSolicitacao.mockResolvedValue(solicitacao(42));
});

async function preencher() {
  await fireEvent.press(await screen.findByTestId('campo-data'));
  await fireEvent.press(screen.getByTestId('seletor-data'));
  await fireEvent.changeText(screen.getByTestId('campo-convidados'), '120 pessoas');
  await fireEvent.changeText(screen.getByTestId('campo-local'), 'Espaço Jardim, Cotia');
  await fireEvent.press(screen.getByRole('checkbox', { name: 'Casamento' }));
  await fireEvent.press(screen.getByRole('checkbox', { name: 'Decoração completa' }));
  await fireEvent.press(screen.getByTestId('campo-faixa'));
  await fireEvent.press(await screen.findByTestId('campo-faixa-10a20'));
  await fireEvent.changeText(screen.getByTestId('campo-mensagem'), 'Ao ar livre');
  await fireEvent.press(screen.getByTestId('aceite-contato'));
}

it('valida antes de revisar', async () => {
  await renderTela(<SolicitarOrcamentoScreen />);
  await fireEvent.press(await screen.findByTestId('revisar'));
  expect(await screen.findByText('Informe a data do evento')).toBeTruthy();
  expect(screen.getByText('Informe o número de convidados')).toBeTruthy();
  expect(screen.getByText('Escolha o tipo de evento')).toBeTruthy();
  expect(screen.getByText('Autorize o contato da empresa para enviar')).toBeTruthy();
});

it('revisa, envia e mostra a confirmação', async () => {
  await renderTela(<SolicitarOrcamentoScreen />);
  await preencher();
  expect(screen.getByTestId('campo-convidados').props.value).toBe('120');
  await fireEvent.press(screen.getByTestId('revisar'));

  expect(await screen.findByText('Revise sua solicitação')).toBeTruthy();
  expect(screen.getByText('15 jun 2030')).toBeTruthy();
  expect(screen.getByText('120 convidados')).toBeTruthy();
  expect(screen.getByText('R$ 10.000 - R$ 20.000')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('enviar-solicitacao'));
  expect(await screen.findByText('Solicitação enviada!')).toBeTruthy();
  expect(api.criarSolicitacao).toHaveBeenCalledWith({
    empresaId: 1,
    tipoEvento: 'CASAMENTO',
    dataEvento: '2030-06-15',
    qtdConvidados: 120,
    local: 'Espaço Jardim, Cotia',
    servicoIds: [7],
    orcamentoMin: 10000,
    orcamentoMax: 20000,
    mensagem: 'Ao ar livre',
    aceiteContato: true,
  });

  await fireEvent.press(screen.getByTestId('ver-solicitacao'));
  expect(router.navigate).toHaveBeenCalledWith('/cliente/solicitacoes');
});

it('erro de campo do servidor volta para a primeira etapa', async () => {
  api.criarSolicitacao.mockRejectedValue(
    Object.assign(new Error('x'), {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          status: 400,
          erro: 'VALIDACAO',
          mensagem: 'Dados inválidos',
          campos: { local: 'Local inválido' },
        },
      },
    }),
  );
  await renderTela(<SolicitarOrcamentoScreen />);
  await preencher();
  await fireEvent.press(screen.getByTestId('revisar'));
  await fireEvent.press(await screen.findByTestId('enviar-solicitacao'));
  expect(await screen.findByText('Local inválido')).toBeTruthy();
  await waitFor(() => expect(screen.getByText('Conte sobre seu evento')).toBeTruthy());
});
