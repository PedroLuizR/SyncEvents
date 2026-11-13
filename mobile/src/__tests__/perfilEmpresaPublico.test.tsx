import { fireEvent, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import * as avaliacoesApi from '@/api/avaliacoes';
import * as buscaApi from '@/api/busca';
import PerfilEmpresaPublicoScreen from '@/app/cliente/empresa/[id]';
import { EMPRESA_PUBLICA } from '@/test-utils/dados';
import { renderTela } from '@/test-utils/render';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ id: '1' }),
}));
jest.mock('@/api/busca');
jest.mock('@/api/avaliacoes');

const busca = jest.mocked(buscaApi);
const avaliacoes = jest.mocked(avaliacoesApi);
const semAvaliacoes = {
  resumo: { total: 0 },
  avaliacoes: { conteudo: [], pagina: 0, tamanho: 5, total: 0, totalPaginas: 0, ultima: true },
};

beforeEach(() => {
  jest.clearAllMocks();
  avaliacoes.listarAvaliacoes.mockResolvedValue(semAvaliacoes);
});

it('mostra dados, indicadores, serviços e estado sem avaliações', async () => {
  busca.buscarEmpresaPublica.mockResolvedValue(EMPRESA_PUBLICA);
  await renderTela(<PerfilEmpresaPublicoScreen />);
  expect(await screen.findByText('Ateliê Aurora Eventos')).toBeTruthy();
  expect(busca.buscarEmpresaPublica).toHaveBeenCalledWith(1);
  expect(screen.getByText('Decoração, Buffet · São Paulo, SP')).toBeTruthy();
  expect(screen.getByText('Decoração completa')).toBeTruthy();
  expect(screen.getByText('a partir de R$ 2.800')).toBeTruthy();
  expect(screen.getByText('Projeto · Montagem')).toBeTruthy();
  expect(screen.getByText('eventos realizados')).toBeTruthy();
  expect(screen.getByText('fotos no portfólio')).toBeTruthy();
  expect(await screen.findByText('Ainda sem avaliações')).toBeTruthy();
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

it('mostra nota, % que recomendam e as avaliações', async () => {
  busca.buscarEmpresaPublica.mockResolvedValue({
    ...EMPRESA_PUBLICA,
    nota: 4.7,
    totalAvaliacoes: 3,
    indicadores: { ...EMPRESA_PUBLICA.indicadores, eventosRealizados: 3, recomendam: 98 },
  });
  avaliacoes.listarAvaliacoes.mockResolvedValue({
    resumo: { media: 4.7, total: 3, recomendam: 98 },
    avaliacoes: {
      conteudo: [
        {
          id: 1,
          solicitacaoId: 9,
          empresaId: 1,
          nota: 5,
          comentario: 'Equipe impecável!',
          destaques: ['ATENDIMENTO'],
          tipoEvento: 'CASAMENTO',
          autor: { nome: 'Ana S.' },
          criadoEm: new Date().toISOString(),
        },
      ],
      pagina: 0,
      tamanho: 5,
      total: 1,
      totalPaginas: 1,
      ultima: true,
    },
  });
  await renderTela(<PerfilEmpresaPublicoScreen />);
  expect(await screen.findByText('4,7')).toBeTruthy();
  expect(screen.getByText('98%')).toBeTruthy();
  expect(screen.getByText('recomendam')).toBeTruthy();
  expect(await screen.findByText('“Equipe impecável!”')).toBeTruthy();
  expect(screen.getByText('✓ Atendimento')).toBeTruthy();
  expect(screen.getByText('Avaliações (3)')).toBeTruthy();
});
