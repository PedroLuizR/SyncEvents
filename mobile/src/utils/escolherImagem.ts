import * as ImagePicker from 'expo-image-picker';

import type { ArquivoImagem } from '@/components/ImagePickerField';

/** Abre a galeria e devolve a imagem escolhida (ou null se cancelar). */
export async function escolherImagem(
  aspecto: [number, number] = [1, 1],
): Promise<ArquivoImagem | null> {
  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: aspecto,
    quality: 0.8,
  });
  if (resultado.canceled || !resultado.assets[0]) return null;
  const a = resultado.assets[0];
  const tipo = a.mimeType ?? 'image/jpeg';
  return { uri: a.uri, nome: a.fileName ?? `imagem.${tipo.split('/')[1] ?? 'jpg'}`, tipo };
}
