import { MSG_SENHA, cadastroClienteSchema, cadastroEmpresaSchema, loginSchema } from '../auth';

const clienteValido = {
  nome: '  Marina   Alves ',
  email: 'marina@email.com',
  telefone: '(11) 98765-4321',
  cidade: 'São Paulo, SP',
  senha: 'Senha@123',
  interesses: ['CASAMENTO' as const],
  aceiteTermos: true,
};

const empresaValida = {
  nomeFantasia: 'Ateliê Aurora',
  cnpj: '11.222.333/0001-81',
  email: 'contato@aurora.com',
  telefone: '(11) 3456-7890',
  cidade: 'São Paulo, SP',
  categoriaIds: [1],
  senha: 'Senha@123',
  confirmarSenha: 'Senha@123',
  aceiteTermos: true,
};

function erros(resultado: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}) {
  return Object.fromEntries(
    (resultado.error?.issues ?? []).map((i) => [String(i.path[0]), i.message]),
  );
}

describe('loginSchema', () => {
  it('exige login e senha', () => {
    expect(erros(loginSchema.safeParse({ login: ' ', senha: '' }))).toEqual({
      login: 'Informe seu e-mail',
      senha: 'Informe sua senha',
    });
  });
});

describe('cadastroClienteSchema', () => {
  it('aceita dados válidos e normaliza o nome', () => {
    const r = cadastroClienteSchema.parse(clienteValido);
    expect(r.nome).toBe('Marina Alves');
  });

  it('CPF e foto são opcionais e o CPF não é validado', () => {
    expect(
      cadastroClienteSchema.safeParse({ ...clienteValido, cpf: '111.111.111-11' }).success,
    ).toBe(true);
  });

  it('mostra mensagens claras', () => {
    const r = cadastroClienteSchema.safeParse({
      ...clienteValido,
      nome: 'Marina 2',
      email: 'marina@',
      telefone: '1234',
      senha: 'fraca',
      aceiteTermos: false,
    });
    expect(erros(r)).toEqual({
      nome: 'O nome deve conter apenas letras e espaços',
      email: 'E-mail inválido',
      telefone: 'Telefone inválido. Use (00) 00000-0000',
      senha: MSG_SENHA,
      aceiteTermos: 'Aceite os Termos de Uso para continuar',
    });
  });
});

describe('cadastroEmpresaSchema', () => {
  it('aceita dados válidos com endereço vazio', () => {
    expect(cadastroEmpresaSchema.safeParse({ ...empresaValida, endereco: '' }).success).toBe(true);
  });

  it('recusa CNPJ inválido, sem categoria e senhas diferentes', () => {
    const r = cadastroEmpresaSchema.safeParse({
      ...empresaValida,
      cnpj: '11.222.333/0001-82',
      categoriaIds: [],
      confirmarSenha: 'Outra@123',
    });
    expect(erros(r)).toEqual({
      cnpj: 'CNPJ inválido',
      categoriaIds: 'Escolha ao menos uma categoria',
      confirmarSenha: 'As senhas não conferem',
    });
  });
});
