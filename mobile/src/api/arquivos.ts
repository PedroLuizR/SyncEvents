import { Platform } from 'react-native';

import type { ArquivoImagem } from '@/components/ImagePickerField';

import { API_URL } from './config';

/**
 * Converte a imagem escolhida para o formato do FormData.
 * No Android/iOS o FormData aceita { uri, name, type }; na web é preciso um Blob de verdade.
 */
export async function arquivoParaForm(arquivo: ArquivoImagem): Promise<Blob> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(arquivo.uri)).blob();
    return new File([blob], arquivo.nome, { type: arquivo.tipo });
  }
  return { uri: arquivo.uri, name: arquivo.nome, type: arquivo.tipo } as unknown as Blob;
}

/** Converte "/files/..." do backend em URL absoluta. */
export function urlArquivo(caminho?: string | null): string | undefined {
  if (!caminho) return undefined;
  return caminho.startsWith('http') ? caminho : `${API_URL}${caminho}`;
}

/** Monta um FormData ignorando campos vazios; arrays viram campos repetidos. */
export async function montarFormData(campos: Record<string, unknown>): Promise<FormData> {
  const form = new FormData();
  for (const [chave, valor] of Object.entries(campos)) {
    if (valor === undefined || valor === null || valor === '') continue;
    if (Array.isArray(valor)) {
      valor.forEach((v) => form.append(chave, String(v)));
    } else if (typeof valor === 'object' && 'uri' in (valor as object)) {
      const arquivo = valor as ArquivoImagem;
      form.append(chave, await arquivoParaForm(arquivo), arquivo.nome);
    } else {
      form.append(chave, String(valor));
    }
  }
  return form;
}

/** FormData com um único arquivo no campo "arquivo" (uploads de logo, capa e fotos). */
export async function formDeArquivo(arquivo: ArquivoImagem): Promise<FormData> {
  const form = new FormData();
  form.append('arquivo', await arquivoParaForm(arquivo), arquivo.nome);
  return form;
}
