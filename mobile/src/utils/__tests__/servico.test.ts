import {
  formatarPrecoServico,
  moedaParaNumero,
  numeroParaMoeda,
  rotuloModeloPreco,
  statusServico,
} from '../servico';

describe('preço do serviço', () => {
  it.each([
    [{ modeloPreco: 'A_PARTIR_DE', precoMin: 2800 }, 'a partir de R$ 2.800'],
    [{ modeloPreco: 'FIXO', precoMin: 950 }, 'R$ 950'],
    [{ modeloPreco: 'FAIXA', precoMin: 3000, precoMax: 8000 }, 'R$ 3.000 a R$ 8.000'],
    [{ modeloPreco: 'FAIXA', precoMin: 3000 }, 'a partir de R$ 3.000'],
    [{ modeloPreco: 'SOB_CONSULTA' }, 'Sob consulta'],
    [{ modeloPreco: 'A_PARTIR_DE' }, 'Sob consulta'],
  ] as const)('%o → %s', (s, esperado) => {
    expect(formatarPrecoServico(s)).toBe(esperado);
  });

  it('converte moeda ↔ número', () => {
    expect(moedaParaNumero('R$ 2.800,00')).toBe(2800);
    expect(moedaParaNumero('R$ 0,50')).toBe(0.5);
    expect(moedaParaNumero('')).toBeNull();
    expect(numeroParaMoeda(2800)).toBe('R$ 2.800,00');
    expect(numeroParaMoeda(null)).toBe('');
  });

  it('rótulos e status', () => {
    expect(rotuloModeloPreco('A_PARTIR_DE')).toBe('A partir de');
    expect(statusServico({ ativo: true, rascunho: false })).toBe('ATIVO');
    expect(statusServico({ ativo: false, rascunho: false })).toBe('INATIVO');
    expect(statusServico({ ativo: true, rascunho: true })).toBe('RASCUNHO');
  });
});
