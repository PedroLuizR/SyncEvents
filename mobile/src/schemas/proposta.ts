import { z } from 'zod';

import { moedaParaNumero } from '@/utils/servico';

export const propostaSchema = z.object({
  valor: z.string().refine((v) => (moedaParaNumero(v) ?? 0) > 0, 'Informe o valor'),
  descricao: z
    .string()
    .trim()
    .min(1, 'Descreva o que está incluso')
    .max(2000, 'Descrição muito longa'),
});
export type PropostaForm = z.infer<typeof propostaSchema>;
