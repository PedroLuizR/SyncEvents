import {
  apenasDigitos,
  formatarMoeda,
  formatarNota,
  mascaraCnpj,
  mascaraMoeda,
  mascaraTelefone,
} from '../masks';

describe('máscaras', () => {
  it('extrai apenas dígitos', () => {
    expect(apenasDigitos('(11) 98765-4321')).toBe('11987654321');
  });

  it.each([
    ['', ''],
    ['1', '(1'],
    ['119', '(11) 9'],
    ['1132451', '(11) 3245-1'],
    ['1132451234', '(11) 3245-1234'],
    ['11987654321', '(11) 98765-4321'],
    ['119876543219999', '(11) 98765-4321'],
  ])('telefone %s → %s', (entrada, esperado) => {
    expect(mascaraTelefone(entrada)).toBe(esperado);
  });

  it.each([
    ['42', '42'],
    ['42591', '42.591'],
    ['42591003', '42.591.003'],
    ['425910030001', '42.591.003/0001'],
    ['42591003000118', '42.591.003/0001-18'],
    ['42.591.003/0001-18999', '42.591.003/0001-18'],
  ])('CNPJ %s → %s', (entrada, esperado) => {
    expect(mascaraCnpj(entrada)).toBe(esperado);
  });

  it('formata moeda sem centavos por padrão', () => {
    expect(formatarMoeda(18500)).toBe('R$ 18.500');
    expect(formatarMoeda(950)).toBe('R$ 950');
    expect(formatarMoeda(1234567.891, { centavos: true })).toBe('R$ 1.234.567,89');
  });

  it('aplica máscara de moeda durante a digitação', () => {
    expect(mascaraMoeda('')).toBe('');
    expect(mascaraMoeda('280000')).toBe('R$ 2.800,00');
  });

  it('formata nota em pt-BR com 1 casa', () => {
    expect(formatarNota(4.9)).toBe('4,9');
    expect(formatarNota(5)).toBe('5,0');
    expect(formatarNota(4.25)).toMatch(/^4,[23]$/);
  });
});
