import { SERVICO_VAZIO, errosDePublicacao, servicoSchema } from '../servico';

const base = { ...SERVICO_VAZIO, nome: 'Decoração', categoriaId: 1 };

describe('servicoSchema', () => {
  it('exige nome e categoria sempre', () => {
    const r = servicoSchema.safeParse(SERVICO_VAZIO);
    const campos = Object.fromEntries((r.error?.issues ?? []).map((i) => [i.path[0], i.message]));
    expect(campos).toEqual({
      nome: 'Informe o nome do serviço',
      categoriaId: 'Escolha a categoria',
    });
  });
});

describe('errosDePublicacao', () => {
  it('rascunho não exige descrição nem preço', () => {
    expect(errosDePublicacao(base, true)).toEqual({});
  });

  it('publicar exige descrição e valor', () => {
    expect(errosDePublicacao(base, false)).toEqual({
      descricao: 'Descreva o serviço',
      precoMin: 'Informe o valor',
    });
  });

  it('faixa exige máximo maior ou igual ao mínimo, mesmo no rascunho', () => {
    const faixa = {
      ...base,
      modeloPreco: 'FAIXA' as const,
      precoMin: 'R$ 500,00',
      precoMax: 'R$ 100,00',
    };
    expect(errosDePublicacao(faixa, true)).toEqual({
      precoMax: 'O valor máximo deve ser maior ou igual ao mínimo',
    });
  });

  it('sob consulta não exige valor', () => {
    expect(
      errosDePublicacao({ ...base, descricao: 'x', modeloPreco: 'SOB_CONSULTA' }, false),
    ).toEqual({});
  });
});
