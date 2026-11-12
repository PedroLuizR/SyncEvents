import { fireEvent, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import * as buscaApi from '@/api/busca';
import PerfilEmpresaPublicoScreen from '@/app/cliente/empresa/[id]';
import { EMPRESA_PUBLICA } from '@/test-utils/dados';
import { renderTela } from '@/test-utils/render';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ id: '1' }),
}));
jest.mock('@/api/busca');

const busca = jest.mocked(buscaApi);

beforeEach(() => jest.clearAllMocks());

it('mostra dados, indicadores, serviços e estado sem avaliações', async () => {
  busca.buscarEmpresaPublica.mockResolvedValue(EMPRESA_PUBLICA);
  await renderTela(<PerfilEmpresaPublicoScreen />);
  expect(await screen.findByText('Ateliê Aurora Eventos')).toBeTruthy();
  expect(busca.buscarEmpresaPublica).toHaveBeenCalledWith(1);
  expect(screen.getByText('Decoração, Buffet · São Paulo, SP')).toBeTruthy();
  expect(screen.getByText('Decoração completa')).toBeTruthy();
  expect(screen.getByText('a partir de R$ 2.800')).toBeTruthy();
  expect(screen.getByText('Projeto · Montagem')).toBeTruthy();
  expect(screen.getByText('no SyncEvents desde')).toBeTruthy();
  expect(screen.getByText('Ainda sem avaliações')).toBeTruthy();
  expect(screen.getByText('Novo')).toBeTruthy();
});

it('abre o WhatsApp da empresa', async () => {
  const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  busca.buscarEmpresaPublica.mockResolvedValue(EMPRESA_PUBLICA);
  await renderTela(<PerfilEmpresaPublicoScreen />);
  await fireEvent.press(await screen.findByTestId('whatsapp'));
  expect(abrir).toHaveBeenCalledWith(
    expect.stringMatching(/^https:\/\/wa\.me\/5511987654321\?text=/),
  );
});

it('mostra erro com opção de tentar de novo', async () => {
  busca.buscarEmpresaPublica.mockRejectedValue(new Error('x'));
  await renderTela(<PerfilEmpresaPublicoScreen />);
  expect(await screen.findByText('Não foi possível abrir o perfil')).toBeTruthy();
});
