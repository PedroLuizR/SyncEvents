import { z } from 'zod';

import { cnpjValido, nomePessoaValido, senhaForte, telefoneValido } from '@/utils/validacao';

export const MSG_SENHA =
  'A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const email = (vazio: string) =>
  z.string().trim().min(1, vazio).regex(EMAIL, 'E-mail inválido').max(255, 'E-mail muito longo');

const senha = z
  .string()
  .min(1, 'Crie uma senha')
  .max(72, 'Senha muito longa')
  .refine(senhaForte, MSG_SENHA);

const telefone = (vazio: string) =>
  z.string().min(1, vazio).refine(telefoneValido, 'Telefone inválido. Use (00) 00000-0000');

const cidade = (vazio: string) => z.string().trim().min(1, vazio).max(120, 'Cidade muito longa');

const aceite = z.boolean().refine((v) => v, 'Aceite os Termos de Uso para continuar');

const imagem = z
  .object({ uri: z.string(), nome: z.string(), tipo: z.string() })
  .nullable()
  .optional();

// ---------- Login (ID03) ----------

export const loginSchema = z.object({
  login: z.string().trim().min(1, 'Informe seu e-mail'),
  senha: z.string().min(1, 'Informe sua senha'),
});
export type LoginForm = z.infer<typeof loginSchema>;

// ---------- Cadastro de cliente (ID01) ----------

export const cadastroClienteSchema = z.object({
  // Etapa 1
  nome: z
    .string()
    .transform((v) => v.trim().replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .min(1, 'Informe seu nome completo')
        .max(120, 'Nome muito longo')
        .refine(nomePessoaValido, 'O nome deve conter apenas letras e espaços'),
    ),
  email: email('Informe seu e-mail'),
  telefone: telefone('Informe seu celular'),
  cidade: cidade('Informe sua cidade'),
  senha,
  interesses: z.array(
    z.enum(['CASAMENTO', 'ANIVERSARIO', 'CORPORATIVO', 'FORMATURA', 'INFANTIL', 'OUTRO']),
  ),
  aceiteTermos: aceite,
  // Etapa 2 (opcional, CPF sem validação)
  cpf: z.string().max(14, 'CPF muito longo').optional(),
  foto: imagem,
});
export type CadastroClienteForm = z.input<typeof cadastroClienteSchema>;

export const CAMPOS_ETAPA1_CLIENTE = [
  'nome',
  'email',
  'telefone',
  'cidade',
  'senha',
  'interesses',
  'aceiteTermos',
] as const;

// ---------- Cadastro de empresa (ID02) ----------

export const cadastroEmpresaSchema = z
  .object({
    // Etapa 1
    logo: imagem,
    nomeFantasia: z.string().trim().min(1, 'Informe o nome fantasia').max(120, 'Nome muito longo'),
    cnpj: z.string().min(1, 'Informe o CNPJ').refine(cnpjValido, 'O CNPJ deve ter 14 dígitos'),
    email: email('Informe o e-mail comercial'),
    telefone: telefone('Informe o telefone'),
    cidade: cidade('Informe a cidade'),
    categoriaIds: z.array(z.number()).min(1, 'Escolha ao menos uma categoria'),
    descricao: z.string().max(2000, 'Descrição muito longa').optional(),
    // Etapa 2 (endereço opcional, sem verificação)
    endereco: z.string().max(255, 'Endereço muito longo').optional(),
    senha,
    confirmarSenha: z.string().min(1, 'Confirme a senha'),
    aceiteTermos: aceite,
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não conferem',
  });
export type CadastroEmpresaForm = z.input<typeof cadastroEmpresaSchema>;

export const CAMPOS_ETAPA1_EMPRESA = [
  'logo',
  'nomeFantasia',
  'cnpj',
  'email',
  'telefone',
  'cidade',
  'categoriaIds',
  'descricao',
] as const;
