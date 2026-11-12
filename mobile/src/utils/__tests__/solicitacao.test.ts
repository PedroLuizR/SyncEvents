import type { Solicitacao } from '@/api/types';

import {
  ABAS_CLIENTE,
  convidados,
  dataParaIso,
  estiloStatus,
  filtrar,
  formatarDataEvento,
  formatarOrcamento,
  tempoRelativo,
} from '../solicitacao';

it('formata datas', () => {
  expect(formatarDataEvento('2027-10-16')).toBe('16 out 2027');
  expect(formatarDataEvento('2027-01-05')).toBe('5 jan 2027');
  expect(dataParaIso(new Date(2027, 9, 6))).toBe('2027-10-06');
  const agora = new Date('2026-11-12T12:00:00Z');
  expect(tempoRelativo('2026-11-10T12:00:00Z', agora)).toMatch(/^há /);
  expect(tempoRelativo(new Date().toISOString())).toBe('agora mesmo');
});

it('formata orçamento e convidados', () => {
  expect(formatarOrcamento(8000, 12000)).toBe('R$ 8.000 - R$ 12.000');
  expect(formatarOrcamento(0, 5000)).toBe('Até R$ 5.000');
  expect(formatarOrcamento(50000, null)).toBe('Acima de R$ 50.000');
  expect(formatarOrcamento(null, null)).toBe('Não informado');
  expect(convidados(1)).toBe('1 convidado');
  expect(convidados(120)).toBe('120 convidados');
});

it('rótulo do status depende de quem vê', () => {
  expect(estiloStatus('PENDENTE', 'CLIENTE').rotulo).toBe('Aguardando');
  expect(estiloStatus('PENDENTE', 'EMPRESA').rotulo).toBe('Novo');
  expect(estiloStatus('EM_NEGOCIACAO', 'CLIENTE').rotulo).toBe('Proposta recebida');
  expect(estiloStatus('EM_NEGOCIACAO', 'EMPRESA').rotulo).toBe('Proposta enviada');
});

it('abas do cliente agrupam os status como no plano', () => {
  const lista = (
    ['PENDENTE', 'EM_ANALISE', 'EM_NEGOCIACAO', 'ACEITA', 'CONCLUIDA', 'CANCELADA'] as const
  ).map((status, id) => ({ id, status }) as Solicitacao);
  const contagem = Object.fromEntries(
    ABAS_CLIENTE.map((a) => [a.chave, filtrar(lista, a.status).length]),
  );
  expect(contagem).toEqual({ todas: 6, aguardando: 2, propostas: 2, concluidas: 1 });
});
