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
