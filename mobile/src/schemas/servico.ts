import { z } from 'zod';

import { moedaParaNumero } from '@/utils/servico';

/** Regras sempre aplicadas (inclusive no rascunho): nome e categoria. */
export const servicoSchema = z
  .object({
    nome: z.string().trim().min(1, 'Informe o nome do serviço').max(120, 'Nome muito longo'),
    categoriaId: z.number().nullable(),
    descricao: z.string().max(2000, 'Descrição muito longa'),
    modeloPreco: z.enum(['FIXO', 'A_PARTIR_DE', 'FAIXA', 'SOB_CONSULTA']).nullable(),
    precoMin: z.string(),
    precoMax: z.string(),
    ativo: z.boolean(),
    itensInclusos: z.array(z.string()),
  })
  .superRefine((v, ctx) => {
    if (v.categoriaId == null) {
      ctx.addIssue({ code: 'custom', path: ['categoriaId'], message: 'Escolha a categoria' });
    }
  });
export type ServicoForm = z.infer<typeof servicoSchema>;

export const SERVICO_VAZIO: ServicoForm = {
  nome: '',
  categoriaId: null,
  descricao: '',
  modeloPreco: 'A_PARTIR_DE',
  precoMin: '',
  precoMax: '',
  ativo: true,
  itensInclusos: [],
};

/**
 * Regras extras para publicar (mesmas do backend). Retorna { campo: mensagem }.
 * No rascunho só a consistência da faixa é conferida.
 */
export function errosDePublicacao(
  v: ServicoForm,
  rascunho: boolean,
): Partial<Record<keyof ServicoForm, string>> {
  const erros: Partial<Record<keyof ServicoForm, string>> = {};
  const min = moedaParaNumero(v.precoMin);
  const max = moedaParaNumero(v.precoMax);
  if (v.modeloPreco === 'FAIXA' && min != null && max != null && max < min) {
    erros.precoMax = 'O valor máximo deve ser maior ou igual ao mínimo';
  }
  if (rascunho) return erros;
  if (!v.descricao.trim()) erros.descricao = 'Descreva o serviço';
  if (!v.modeloPreco) {
    erros.modeloPreco = 'Escolha o modelo de preço';
  } else if (v.modeloPreco !== 'SOB_CONSULTA' && !(min && min > 0)) {
    erros.precoMin = 'Informe o valor';
  }
  if (v.modeloPreco === 'FAIXA' && !(max && max > 0)) {
    erros.precoMax ??= 'Informe o valor máximo';
  }
  return erros;
}
