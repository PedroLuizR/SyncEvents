/** Remove tudo que não for dígito. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** Máscara de telefone: (00) 00000-0000 (aceita fixo (00) 0000-0000). */
export function mascaraTelefone(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Máscara de CNPJ: 00.000.000/0000-00 */
export function mascaraCnpj(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/** Máscara de moeda durante a digitação: "1850000" → "R$ 18.500,00". */
export function mascaraMoeda(valor: string): string {
  const d = apenasDigitos(valor);
  if (!d) return '';
  return formatarMoeda(Number(d) / 100, { centavos: true });
}

/** Formata um valor em reais. Por padrão sem centavos: 18500 → "R$ 18.500". */
export function formatarMoeda(valor: number, opcoes: { centavos?: boolean } = {}): string {
  const casas = opcoes.centavos ? 2 : 0;
  const [inteiro, decimal] = Math.abs(valor).toFixed(casas).split('.');
  const milhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sinal = valor < 0 ? '-' : '';
  return `${sinal}R$ ${milhar}${decimal ? `,${decimal}` : ''}`;
}

/** Nota com 1 casa decimal no formato pt-BR: 4.9 → "4,9". */
export function formatarNota(nota: number): string {
  return nota.toFixed(1).replace('.', ',');
}

/** Máscara de CPF: 000.000.000-00 (sem validação dos dígitos, por decisão do projeto). */
export function mascaraCpf(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}
