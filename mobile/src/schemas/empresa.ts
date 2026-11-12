import { z } from 'zod';

import { telefoneValido } from '@/utils/validacao';

/** Edição do perfil da empresa (ID04). E-mail e CNPJ não são editáveis. */
export const perfilEmpresaSchema = z.object({
  nomeFantasia: z.string().trim().min(1, 'Informe o nome fantasia').max(120, 'Nome muito longo'),
  telefone: z
    .string()
    .min(1, 'Informe o telefone')
    .refine(telefoneValido, 'Telefone inválido. Use (00) 00000-0000'),
  cidade: z.string().trim().min(1, 'Informe a cidade').max(120, 'Cidade muito longa'),
  endereco: z.string().max(255, 'Endereço muito longo'),
  descricao: z.string().max(2000, 'Descrição muito longa'),
  categoriaIds: z.array(z.number()).min(1, 'Escolha ao menos uma categoria'),
});
export type PerfilEmpresaForm = z.infer<typeof perfilEmpresaSchema>;
