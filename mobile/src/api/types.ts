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
