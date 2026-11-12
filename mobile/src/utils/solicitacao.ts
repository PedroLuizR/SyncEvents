import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import type { Solicitacao, StatusSolicitacao, TipoUsuario } from '@/api/types';
import { colors } from '@/theme';

import { formatarMoeda } from './masks';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "2027-10-16" → "16 out 2027" (sem depender de fuso). */
export function formatarDataEvento(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return `${dia} ${MESES[mes - 1]} ${ano}`;
}

/** Date → "2027-10-16" no horário local. */
export function dataParaIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** "há 2 dias" */
export function tempoRelativo(iso: string, agora: Date = new Date()): string {
  const data = new Date(iso);
  if (agora.getTime() - data.getTime() < 60_000) return 'agora mesmo';
  return `há ${formatDistanceToNowStrict(data, { locale: ptBR })}`;
}

export interface EstiloStatus {
  rotulo: string;
  cor: string;
  fundo: string;
}

/** Rótulo e cores do status. O texto muda conforme quem vê (cliente ou empresa). */
export function estiloStatus(status: StatusSolicitacao, quem: TipoUsuario): EstiloStatus {
  const cliente = quem === 'CLIENTE';
  switch (status) {
    case 'PENDENTE':
      return cliente
        ? { rotulo: 'Aguardando', cor: colors.warning, fundo: colors.warningSoft }
        : { rotulo: 'Novo', cor: colors.danger, fundo: colors.dangerSoft };
    case 'EM_ANALISE':
      return { rotulo: 'Em análise', cor: colors.primary, fundo: colors.primarySoft };
    case 'EM_NEGOCIACAO':
      return cliente
        ? { rotulo: 'Proposta recebida', cor: colors.warning, fundo: colors.warningSoft }
        : { rotulo: 'Proposta enviada', cor: colors.primary, fundo: colors.primarySoft };
    case 'ACEITA':
      return { rotulo: 'Proposta aceita', cor: colors.success, fundo: colors.successSoft };
    case 'CONCLUIDA':
      return { rotulo: 'Concluída', cor: colors.success, fundo: colors.successSoft };
    case 'RECUSADA':
      return { rotulo: 'Recusada', cor: colors.textMuted, fundo: colors.surfaceMuted };
    case 'CANCELADA':
      return { rotulo: 'Cancelada', cor: colors.textMuted, fundo: colors.surfaceMuted };
  }
}

/** Abas de "Minhas solicitações" (cliente), como no Figma. */
export const ABAS_CLIENTE: { chave: string; rotulo: string; status: StatusSolicitacao[] | null }[] =
  [
    { chave: 'todas', rotulo: 'Todas', status: null },
    { chave: 'aguardando', rotulo: 'Aguardando', status: ['PENDENTE', 'EM_ANALISE'] },
    { chave: 'propostas', rotulo: 'Propostas', status: ['EM_NEGOCIACAO', 'ACEITA'] },
    { chave: 'concluidas', rotulo: 'Concluídas', status: ['CONCLUIDA'] },
  ];

/** Filtros da lista de solicitações recebidas (empresa). */
export const FILTROS_EMPRESA: {
  chave: string;
  rotulo: string;
  status: StatusSolicitacao[] | null;
}[] = [
  { chave: 'todas', rotulo: 'Todas', status: null },
  { chave: 'novas', rotulo: 'Novas', status: ['PENDENTE'] },
  { chave: 'analise', rotulo: 'Em análise', status: ['EM_ANALISE'] },
  { chave: 'negociacao', rotulo: 'Em negociação', status: ['EM_NEGOCIACAO'] },
  { chave: 'aceitas', rotulo: 'Aceitas', status: ['ACEITA'] },
  { chave: 'concluidas', rotulo: 'Concluídas', status: ['CONCLUIDA'] },
  { chave: 'encerradas', rotulo: 'Encerradas', status: ['RECUSADA', 'CANCELADA'] },
];

export function filtrar(lista: Solicitacao[], status: StatusSolicitacao[] | null): Solicitacao[] {
  return status ? lista.filter((s) => status.includes(s.status)) : lista;
}

export interface FaixaOrcamento {
  chave: string;
  rotulo: string;
  min: number | null;
  max: number | null;
}

export const FAIXAS_ORCAMENTO: FaixaOrcamento[] = [
  { chave: 'ate5', rotulo: 'Até R$ 5.000', min: 0, max: 5000 },
  { chave: '5a10', rotulo: 'R$ 5.000 - R$ 10.000', min: 5000, max: 10000 },
  { chave: '10a20', rotulo: 'R$ 10.000 - R$ 20.000', min: 10000, max: 20000 },
  { chave: '20a50', rotulo: 'R$ 20.000 - R$ 50.000', min: 20000, max: 50000 },
  { chave: 'acima50', rotulo: 'Acima de R$ 50.000', min: 50000, max: null },
  { chave: 'nao', rotulo: 'Prefiro não informar', min: null, max: null },
];

/** Texto da faixa de orçamento informada pelo cliente. */
export function formatarOrcamento(min?: number | null, max?: number | null): string {
  if (min == null && max == null) return 'Não informado';
  if (min != null && max != null) {
    return Number(min) === 0
      ? `Até ${formatarMoeda(Number(max))}`
      : `${formatarMoeda(Number(min))} - ${formatarMoeda(Number(max))}`;
  }
  if (min != null) return `Acima de ${formatarMoeda(Number(min))}`;
  return `Até ${formatarMoeda(Number(max))}`;
}

export function convidados(qtd: number): string {
  return `${qtd} ${qtd === 1 ? 'convidado' : 'convidados'}`;
}
