import { apenasDigitos } from './masks';

/**
 * CNPJ com 14 dígitos (mesma regra do backend). Os dígitos verificadores
 * não são conferidos, por decisão do projeto.
 */
export function cnpjValido(valor: string): boolean {
  return apenasDigitos(valor).length === 14;
}

/** Telefone com DDD: 10 ou 11 dígitos, DDD não começa com 0. */
export function telefoneValido(valor: string): boolean {
  const d = apenasDigitos(valor);
  return (d.length === 10 || d.length === 11) && d[0] !== '0';
}

/** Mesma regra do backend: 8+ caracteres, maiúscula, minúscula, número e especial. */
export function senhaForte(senha: string): boolean {
  return (
    senha.length >= 8 &&
    /\p{Lu}/u.test(senha) &&
    /\p{Ll}/u.test(senha) &&
    /\d/.test(senha) &&
    /[^\p{L}\d\s]/u.test(senha)
  );
}

/** Apenas letras (com acento) e espaços simples entre as palavras. */
export function nomePessoaValido(nome: string): boolean {
  return /^\p{L}+(?:[ '-]\p{L}+)*$/u.test(nome);
}
