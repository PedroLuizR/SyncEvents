import type { ArquivoImagem } from '@/components/ImagePickerField';

import { montarFormData } from './arquivos';
import { api } from './client';
import type { Categoria, LoginResposta, TipoEvento, TipoUsuario, Usuario } from './types';

export interface LoginDados {
  login: string;
  senha: string;
  tipo: TipoUsuario;
}

export interface CadastroClienteDados {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  senha: string;
  interesses: TipoEvento[];
  aceiteTermos: boolean;
  cpf?: string;
  foto?: ArquivoImagem | null;
}

export interface CadastroEmpresaDados {
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  cidade: string;
  categoriaIds: number[];
  descricao?: string;
  endereco?: string;
  senha: string;
  aceiteTermos: boolean;
  logo?: ArquivoImagem | null;
}

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export async function login(dados: LoginDados): Promise<LoginResposta> {
  const { data } = await api.post<LoginResposta>('/auth/login', dados);
  return data;
}

export async function cadastrarCliente(dados: CadastroClienteDados): Promise<Usuario> {
  const form = montarFormData({ ...dados });
  const { data } = await api.post<Usuario>('/auth/cadastro/cliente', form, multipart);
  return data;
}

export async function cadastrarEmpresa(dados: CadastroEmpresaDados): Promise<Usuario> {
  const form = montarFormData({ ...dados });
  const { data } = await api.post<Usuario>('/auth/cadastro/empresa', form, multipart);
  return data;
}

export async function buscarMe(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me');
  return data;
}

export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/categorias');
  return data;
}
