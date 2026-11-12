import { apenasDigitos } from './masks';

/** CNPJ com 14 dígitos e dígitos verificadores corretos (mesma regra do backend). */
export function cnpjValido(valor: string): boolean {
  const cnpj = apenasDigitos(valor);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const digito = (base: string, pesos: number[]) => {
    const soma = pesos.reduce((acc, peso, i) => acc + Number(base[i]) * peso, 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const d1 = digito(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = digito(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
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
