export type TipoUsuario = 'CLIENTE' | 'EMPRESA';

export type TipoEvento =
  'CASAMENTO' | 'ANIVERSARIO' | 'CORPORATIVO' | 'FORMATURA' | 'INFANTIL' | 'OUTRO';

export interface Categoria {
  id: number;
  nome: string;
  /** Nome do ícone Feather. */
  icone: string;
}

export interface Usuario {
  id: number;
  email: string;
  tipo: TipoUsuario;
  /** id do cliente ou da empresa */
  perfilId: number;
  nome: string;
  telefone: string;
  cidade: string;
  /** foto do cliente ou logo da empresa */
  fotoUrl?: string;
  /** código público de 6 dígitos (empresa) */
  codigo?: string;
  interesses?: TipoEvento[];
  categorias?: Categoria[];
}

export interface LoginResposta {
  token: string;
  usuario: Usuario;
}

export interface Foto {
  id: number;
  url: string;
  ordem: number;
}

export interface EmpresaPerfil {
  id: number;
  codigo: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  cidade: string;
  uf?: string;
  endereco?: string;
  descricao?: string;
  logoUrl?: string;
  capaUrl?: string;
  categorias: Categoria[];
  portfolio: Foto[];
}

export type ModeloPreco = 'FIXO' | 'A_PARTIR_DE' | 'FAIXA' | 'SOB_CONSULTA';

export interface Servico {
  id: number;
  empresaId: number;
  categoria: Categoria;
  nome: string;
  descricao?: string;
  modeloPreco: ModeloPreco;
  precoMin?: number;
  precoMax?: number;
  ativo: boolean;
  rascunho: boolean;
  fotos: Foto[];
  itensInclusos: string[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface Pagina<T> {
  conteudo: T[];
  pagina: number;
  tamanho: number;
  total: number;
  totalPaginas: number;
  ultima: boolean;
}

/** Card de empresa na busca e nos recomendados. */
export interface EmpresaResumo {
  id: number;
  nomeFantasia: string;
  logoUrl?: string;
  capaUrl?: string;
  cidade: string;
  categorias: Categoria[];
  /** média das avaliações; ausente enquanto não houver avaliações (Fase 6) */
  nota?: number;
  totalAvaliacoes: number;
  precoAPartirDe?: number;
}

export interface EmpresaPublica {
  id: number;
  codigo: string;
  nomeFantasia: string;
  descricao?: string;
  cidade: string;
  uf?: string;
  endereco?: string;
  telefoneWhatsapp: string;
  logoUrl?: string;
  capaUrl?: string;
  categorias: Categoria[];
  portfolio: Foto[];
  servicos: Servico[];
  nota?: number;
  totalAvaliacoes: number;
  indicadores: {
    eventosRealizados: number;
    servicos: number;
    fotos: number;
    naPlataformaDesde: number;
  };
}

export type OrdenacaoBusca = 'relevancia' | 'nota' | 'preco';

export type StatusSolicitacao =
  'PENDENTE' | 'EM_ANALISE' | 'EM_NEGOCIACAO' | 'ACEITA' | 'CONCLUIDA' | 'RECUSADA' | 'CANCELADA';

export type StatusProposta = 'ENVIADA' | 'ACEITA' | 'RECUSADA';

export interface Proposta {
  id: number;
  valor: number;
  descricao: string;
  status: StatusProposta;
  criadoEm: string;
}

export interface Solicitacao {
  id: number;
  status: StatusSolicitacao;
  tipoEvento: TipoEvento;
  /** yyyy-MM-dd */
  dataEvento: string;
  qtdConvidados: number;
  local: string;
  orcamentoMin?: number;
  orcamentoMax?: number;
  mensagem?: string;
  criadoEm: string;
  atualizadoEm: string;
  cliente: {
    id: number;
    nome: string;
    cidade: string;
    telefone: string;
    email: string;
    fotoUrl?: string;
  };
  empresa: { id: number; nomeFantasia: string; cidade: string; logoUrl?: string };
  servicos: { id: number; nome: string }[];
  anexos: { id: number; url: string }[];
  propostas: Proposta[];
  propostaAtual?: Proposta;
  conversaId?: number;
}

export interface Dashboard {
  dias: number;
  visualizacoes: number;
  variacaoVisualizacoes?: number;
  solicitacoes: number;
  variacaoSolicitacoes?: number;
  taxaResposta?: number;
  pendentes: number;
  servicosAtivos: number;
  servicosRascunho: number;
}

export interface Mensagem {
  id: number;
  conversaId: number;
  remetenteUsuarioId: number;
  tipo: 'TEXTO' | 'PROPOSTA';
  conteudo: string;
  proposta?: Proposta;
  lida: boolean;
  enviadaEm: string;
}

export interface Historico {
  /** ordem cronológica (mais antiga primeiro) */
  mensagens: Mensagem[];
  temMais: boolean;
}

export interface Conversa {
  id: number;
  solicitacaoId: number;
  contato: { id: number; nome: string; fotoUrl?: string; cidade: string };
  status: StatusSolicitacao;
  tipoEvento: TipoEvento;
  dataEvento: string;
  qtdConvidados: number;
  local: string;
  ultimaMensagem?: Mensagem;
  naoLidas: number;
  meuUsuarioId: number;
}
