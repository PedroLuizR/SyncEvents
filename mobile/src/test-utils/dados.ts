import type { EmpresaPublica, EmpresaResumo, Pagina, Solicitacao } from '@/api/types';

export const CATEGORIAS = [
  { id: 1, nome: 'Decoração', icone: 'star' },
  { id: 2, nome: 'Buffet', icone: 'coffee' },
  { id: 3, nome: 'Fotografia', icone: 'camera' },
];

export function empresaResumo(id: number, extra: Partial<EmpresaResumo> = {}): EmpresaResumo {
  return {
    id,
    nomeFantasia: `Empresa ${id}`,
    cidade: 'São Paulo, SP',
    categorias: [CATEGORIAS[0]],
    totalAvaliacoes: 0,
    precoAPartirDe: 2800,
    ...extra,
  };
}

export function pagina<T>(
  conteudo: T[],
  total = conteudo.length,
  numero = 0,
  ultima = true,
): Pagina<T> {
  return {
    conteudo,
    pagina: numero,
    tamanho: 10,
    total,
    totalPaginas: Math.ceil(total / 10),
    ultima,
  };
}

export const EMPRESA_PUBLICA: EmpresaPublica = {
  id: 1,
  codigo: '504731',
  nomeFantasia: 'Ateliê Aurora Eventos',
  descricao: 'Celebrações afetivas com flores e cenografia.',
  cidade: 'São Paulo, SP',
  endereco: 'Rua Harmonia, 520',
  telefoneWhatsapp: '11987654321',
  categorias: [CATEGORIAS[0], CATEGORIAS[1]],
  portfolio: [{ id: 5, url: '/files/portfolio/a.jpg', ordem: 0 }],
  servicos: [
    {
      id: 7,
      empresaId: 1,
      categoria: CATEGORIAS[0],
      nome: 'Decoração completa',
      modeloPreco: 'A_PARTIR_DE',
      precoMin: 2800,
      ativo: true,
      rascunho: false,
      fotos: [],
      itensInclusos: ['Projeto', 'Montagem'],
      criadoEm: '',
      atualizadoEm: '',
    },
  ],
  totalAvaliacoes: 0,
  indicadores: { eventosRealizados: 0, servicos: 1, fotos: 1, naPlataformaDesde: 2026 },
};

export function solicitacao(id: number, extra: Partial<Solicitacao> = {}): Solicitacao {
  return {
    id,
    status: 'PENDENTE',
    tipoEvento: 'CASAMENTO',
    dataEvento: '2027-10-16',
    qtdConvidados: 120,
    local: 'Espaço Jardim, Cotia',
    orcamentoMin: 10000,
    orcamentoMax: 20000,
    mensagem: 'Queremos algo ao ar livre.',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    cliente: {
      id: 3,
      nome: 'Marina Alves',
      cidade: 'São Paulo, SP',
      telefone: '11987654321',
      email: 'marina@email.com',
    },
    empresa: { id: 1, nomeFantasia: 'Ateliê Aurora', cidade: 'São Paulo, SP' },
    servicos: [{ id: 7, nome: 'Decoração completa' }],
    anexos: [],
    propostas: [],
    conversaId: 11,
    avaliada: false,
    ...extra,
  };
}
