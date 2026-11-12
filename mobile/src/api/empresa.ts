import type { ArquivoImagem } from '@/components/ImagePickerField';

import { formDeArquivo } from './arquivos';
import { api } from './client';
import type { EmpresaPerfil } from './types';

export interface EmpresaAtualizacao {
  nomeFantasia: string;
  telefone: string;
  cidade: string;
  endereco?: string;
  descricao?: string;
  categoriaIds: number[];
}

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export async function buscarMinhaEmpresa(): Promise<EmpresaPerfil> {
  const { data } = await api.get<EmpresaPerfil>('/empresas/me');
  return data;
}

export async function atualizarMinhaEmpresa(dados: EmpresaAtualizacao): Promise<EmpresaPerfil> {
  const { data } = await api.put<EmpresaPerfil>('/empresas/me', dados);
  return data;
}

export async function enviarImagemEmpresa(
  tipo: 'logo' | 'capa' | 'portfolio',
  arquivo: ArquivoImagem,
): Promise<EmpresaPerfil> {
  const { data } = await api.post<EmpresaPerfil>(
    `/empresas/me/${tipo}`,
    await formDeArquivo(arquivo),
    multipart,
  );
  return data;
}

export async function removerFotoPortfolio(fotoId: number): Promise<EmpresaPerfil> {
  const { data } = await api.delete<EmpresaPerfil>(`/empresas/me/portfolio/${fotoId}`);
  return data;
}
