import type { ArquivoImagem } from '@/components/ImagePickerField';

import { API_URL } from './config';

/** Formato que o FormData do React Native aceita para arquivos. */
export function arquivoParaForm(arquivo: ArquivoImagem) {
  return { uri: arquivo.uri, name: arquivo.nome, type: arquivo.tipo } as unknown as Blob;
}

/** Converte "/files/..." do backend em URL absoluta. */
export function urlArquivo(caminho?: string | null): string | undefined {
  if (!caminho) return undefined;
  return caminho.startsWith('http') ? caminho : `${API_URL}${caminho}`;
}

/** Monta um FormData ignorando campos vazios; arrays viram campos repetidos. */
export function montarFormData(campos: Record<string, unknown>): FormData {
  const form = new FormData();
  for (const [chave, valor] of Object.entries(campos)) {
    if (valor === undefined || valor === null || valor === '') continue;
    if (Array.isArray(valor)) {
      valor.forEach((v) => form.append(chave, String(v)));
    } else if (typeof valor === 'object' && 'uri' in (valor as object)) {
      form.append(chave, arquivoParaForm(valor as ArquivoImagem));
    } else {
      form.append(chave, String(valor));
    }
  }
  return form;
}
