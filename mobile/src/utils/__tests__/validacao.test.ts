import { mascaraCpf } from '../masks';
import { cnpjValido, nomePessoaValido, senhaForte, telefoneValido } from '../validacao';

describe('validações (mesmas regras do backend)', () => {
  it.each(['11.222.333/0001-81', '11222333000181', '11.222.333/0001-82', '00000000000000'])(
    'CNPJ com 14 dígitos %s',
    (c) => expect(cnpjValido(c)).toBe(true),
  );

  it.each(['1122233300018', '11.222.333/0001', ''])('CNPJ incompleto %s', (c) =>
    expect(cnpjValido(c)).toBe(false),
  );

  it.each(['Senha@123', 'Abcdef1!', 'Çãoção9#X'])('senha forte %s', (s) =>
    expect(senhaForte(s)).toBe(true),
  );

  it.each(['Ab1!', 'senha@123', 'SENHA@123', 'Senha1234', 'Senha@abc'])('senha fraca %s', (s) =>
    expect(senhaForte(s)).toBe(false),
  );

  it.each(['(11) 98765-4321', '(11) 3245-1234'])('telefone válido %s', (t) =>
    expect(telefoneValido(t)).toBe(true),
  );

  it.each(['98765-4321', '(01) 98765-4321', ''])('telefone inválido %s', (t) =>
    expect(telefoneValido(t)).toBe(false),
  );

  it.each(['Marina Alves', 'João da Silva', "Ana-Clara D'Ávila"])('nome válido %s', (n) =>
    expect(nomePessoaValido(n)).toBe(true),
  );

  it.each(['Marina 2', 'Ana@Silva', 'R2D2'])('nome inválido %s', (n) =>
    expect(nomePessoaValido(n)).toBe(false),
  );

  it('aplica máscara de CPF sem validar', () => {
    expect(mascaraCpf('12345678900')).toBe('123.456.789-00');
    expect(mascaraCpf('1234')).toBe('123.4');
  });
});
