import { z } from 'zod';

import { dataParaIso } from '@/utils/solicitacao';

const TIPOS = [
  'CASAMENTO',
  'ANIVERSARIO',
  'CORPORATIVO',
  'FORMATURA',
  'INFANTIL',
  'OUTRO',
] as const;

/** Tela 8: pedido de orçamento (ID08). */
export const solicitacaoSchema = z
  .object({
    dataEvento: z.string(),
    qtdConvidados: z.string(),
    local: z.string().trim().min(1, 'Informe o local do evento').max(200, 'Local muito longo'),
    tipoEvento: z.enum(TIPOS).nullable(),
    servicoIds: z.array(z.number()),
    faixa: z.string(),
    mensagem: z.string().max(2000, 'Mensagem muito longa'),
    aceiteContato: z.boolean().refine((v) => v, 'Autorize o contato da empresa para enviar'),
  })
  .superRefine((v, ctx) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.dataEvento)) {
      ctx.addIssue({ code: 'custom', path: ['dataEvento'], message: 'Informe a data do evento' });
    } else if (v.dataEvento < dataParaIso(new Date())) {
      ctx.addIssue({
        code: 'custom',
        path: ['dataEvento'],
        message: 'A data do evento não pode estar no passado',
      });
    }
    const qtd = Number(v.qtdConvidados);
    if (!v.qtdConvidados || !Number.isInteger(qtd) || qtd < 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['qtdConvidados'],
        message: 'Informe o número de convidados',
      });
    }
    if (v.tipoEvento == null) {
      ctx.addIssue({ code: 'custom', path: ['tipoEvento'], message: 'Escolha o tipo de evento' });
    }
  });
export type SolicitacaoForm = z.infer<typeof solicitacaoSchema>;
