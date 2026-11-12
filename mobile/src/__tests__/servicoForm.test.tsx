import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import * as authApi from '@/api/auth';
import * as servicosApi from '@/api/servicos';
import type { Servico } from '@/api/types';
import ServicoFormScreen from '@/app/empresa/servico/[id]';
import { renderTela } from '@/test-utils/render';

const mockParams: { id: string } = { id: 'novo' };
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/api/auth');
jest.mock('@/api/servicos');
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('@/utils/confirmar', () => ({
  confirmar: ({ onConfirmar }: { onConfirmar: () => void }) => onConfirmar(),
}));

const auth = jest.mocked(authApi);
const api = jest.mocked(servicosApi);
const { router } = jest.requireMock('expo-router');

const existente: Servico = {
  id: 7,
  empresaId: 1,
  categoria: { id: 1, nome: 'Decoração', icone: 'star' },
  nome: 'Decoração completa',
  descricao: 'Projeto personalizado',
  modeloPreco: 'A_PARTIR_DE',
  precoMin: 2800,
  ativo: true,
  rascunho: false,
  fotos: [{ id: 50, url: '/files/servicos/a.jpg', ordem: 0 }],
  itensInclusos: ['Projeto e moodboard'],
  criadoEm: '2026-11-12T10:00:00Z',
  atualizadoEm: '2026-11-12T10:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockParams.id = 'novo';
  auth.listarCategorias.mockResolvedValue([
    { id: 1, nome: 'Decoração', icone: 'star' },
    { id: 2, nome: 'Buffet', icone: 'coffee' },
  ]);
  api.criarServico.mockImplementation(
    async (d) => ({ ...existente, id: 99, ...d }) as unknown as Servico,
  );
  api.atualizarServico.mockImplementation(
    async (id, d) => ({ ...existente, id, ...d }) as unknown as Servico,
  );
  api.removerFotoServico.mockResolvedValue({ ...existente, fotos: [] });
});

async function escolherCategoria(id: number) {
  await fireEvent.press(screen.getByTestId('campo-categoria'));
  await fireEvent.press(await screen.findByTestId(`campo-categoria-${id}`));
}

it('publicar exige nome, categoria, descrição e valor', async () => {
  await renderTela(<ServicoFormScreen />);
  await fireEvent.press(screen.getByTestId('publicar-servico'));
  expect(await screen.findByText('Informe o nome do serviço')).toBeTruthy();
  expect(screen.getByText('Escolha a categoria')).toBeTruthy();

  await fireEvent.changeText(screen.getByTestId('campo-nome-servico'), 'Buffet completo');
  await escolherCategoria(2);
  await fireEvent.press(screen.getByTestId('publicar-servico'));
  expect(await screen.findByText('Descreva o serviço')).toBeTruthy();
  expect(screen.getByText('Informe o valor')).toBeTruthy();
  expect(api.criarServico).not.toHaveBeenCalled();
});

it('salva rascunho só com nome e categoria', async () => {
  await renderTela(<ServicoFormScreen />);
  await fireEvent.changeText(screen.getByTestId('campo-nome-servico'), 'Ideia de pacote');
  await escolherCategoria(1);
  await fireEvent.press(screen.getByTestId('salvar-rascunho'));

  await waitFor(() => expect(api.criarServico).toHaveBeenCalled());
  expect(api.criarServico).toHaveBeenCalledWith(
    expect.objectContaining({
      nome: 'Ideia de pacote',
      categoriaId: 1,
      rascunho: true,
      ativo: true,
    }),
  );
  expect(router.back).toHaveBeenCalled();
});

it('publica com preço convertido e itens inclusos', async () => {
  await renderTela(<ServicoFormScreen />);
  await fireEvent.changeText(screen.getByTestId('campo-nome-servico'), 'Decoração completa');
  await escolherCategoria(1);
  await fireEvent.changeText(screen.getByTestId('campo-descricao'), 'Projeto completo');
  await fireEvent.changeText(screen.getByTestId('campo-preco-min'), '280000');
  expect(screen.getByTestId('campo-preco-min').props.value).toBe('R$ 2.800,00');
  await fireEvent.changeText(screen.getByTestId('novo-item'), 'Montagem');
  await fireEvent.press(screen.getByTestId('adicionar-item'));
  await fireEvent.press(screen.getByTestId('publicar-servico'));

  await waitFor(() => expect(api.criarServico).toHaveBeenCalled());
  expect(api.criarServico).toHaveBeenCalledWith({
    nome: 'Decoração completa',
    categoriaId: 1,
    descricao: 'Projeto completo',
    modeloPreco: 'A_PARTIR_DE',
    precoMin: 2800,
    precoMax: null,
    ativo: true,
    rascunho: false,
    itensInclusos: ['Montagem'],
  });
});

it('faixa de preço pede valor máximo', async () => {
  await renderTela(<ServicoFormScreen />);
  await fireEvent.press(screen.getByTestId('campo-modelo-preco'));
  await fireEvent.press(await screen.findByTestId('campo-modelo-preco-FAIXA'));
  expect(screen.getByText('Valor mínimo')).toBeTruthy();
  expect(screen.getByTestId('campo-preco-max')).toBeTruthy();
});

it('edita um serviço existente: desativa, remove foto e atualiza', async () => {
  mockParams.id = '7';
  api.buscarServico.mockResolvedValue(existente);
  await renderTela(<ServicoFormScreen />);

  expect((await screen.findByTestId('campo-nome-servico')).props.value).toBe('Decoração completa');
  expect(screen.getByText('Editar serviço')).toBeTruthy();
  expect(screen.getByTestId('campo-preco-min').props.value).toBe('R$ 2.800,00');
  expect(screen.getByText('Atualizar serviço')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('servico-ativo'));
  expect(screen.getByText('Serviço inativo')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Remover foto 1' }));
  await fireEvent.press(screen.getByTestId('publicar-servico'));

  await waitFor(() => expect(api.atualizarServico).toHaveBeenCalled());
  expect(api.atualizarServico).toHaveBeenCalledWith(
    7,
    expect.objectContaining({ ativo: false, rascunho: false }),
  );
  expect(api.removerFotoServico).toHaveBeenCalledWith(7, 50);
  expect(router.back).toHaveBeenCalled();
});

it('exclui após confirmação', async () => {
  mockParams.id = '7';
  api.buscarServico.mockResolvedValue(existente);
  api.excluirServico.mockResolvedValue();
  await renderTela(<ServicoFormScreen />);
  await fireEvent.press(await screen.findByTestId('excluir-servico'));
  await waitFor(() => expect(api.excluirServico).toHaveBeenCalledWith(7));
  expect(router.back).toHaveBeenCalled();
});

it('mostra erro do servidor (ex.: 403 de outra empresa)', async () => {
  mockParams.id = '7';
  api.buscarServico.mockResolvedValue(existente);
  api.atualizarServico.mockRejectedValue(
    Object.assign(new Error('x'), {
      isAxiosError: true,
      response: {
        status: 403,
        data: {
          status: 403,
          erro: 'ACESSO_NEGADO',
          mensagem: 'Este serviço pertence a outra empresa',
        },
      },
    }),
  );
  await renderTela(<ServicoFormScreen />);
  await fireEvent.press(await screen.findByTestId('publicar-servico'));
  expect(await screen.findByText('Este serviço pertence a outra empresa')).toBeTruthy();
  expect(router.back).not.toHaveBeenCalled();
});
