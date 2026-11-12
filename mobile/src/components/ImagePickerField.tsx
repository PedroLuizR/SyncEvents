import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';
import { escolherImagem } from '@/utils/escolherImagem';

import { Button } from './Button';
import { Text } from './Text';

export interface ArquivoImagem {
  uri: string;
  nome: string;
  tipo: string;
}

export interface ImagePickerFieldProps {
  titulo: string;
  descricao: string;
  valor?: ArquivoImagem | null;
  onChange: (arquivo: ArquivoImagem | null) => void;
  formato?: 'quadrado' | 'circulo';
  erro?: string;
}

/** Linha "Adicione seu logotipo · Enviar" com pré-visualização da imagem escolhida. */
export function ImagePickerField({
  titulo,
  descricao,
  valor,
  onChange,
  formato = 'quadrado',
  erro,
}: ImagePickerFieldProps) {
  async function escolher() {
    const arquivo = await escolherImagem();
    if (arquivo) onChange(arquivo);
  }

  const raio = formato === 'circulo' ? radii.pill : radii.md;

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={[styles.linha, erro && { borderColor: colors.danger }]}>
        <Pressable
          onPress={escolher}
          accessibilityRole="button"
          accessibilityLabel={titulo}
          style={[styles.preview, { borderRadius: raio }]}
        >
          {valor ? (
            <Image source={{ uri: valor.uri }} style={[styles.imagem, { borderRadius: raio }]} />
          ) : (
            <Feather name="image" size={22} color={colors.primary} />
          )}
        </Pressable>
        <View style={styles.textos}>
          <Text variant="bodyStrong">{titulo}</Text>
          <Text variant="caption">{descricao}</Text>
        </View>
        {valor ? (
          <Button titulo="Remover" variante="contorno" compacto onPress={() => onChange(null)} />
        ) : (
          <Button titulo="Enviar" variante="contorno" compacto onPress={escolher} />
        )}
      </View>
      {erro ? (
        <Text variant="caption" color={colors.danger}>
          {erro}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: {
    width: 56,
    height: 56,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagem: { width: 56, height: 56 },
  textos: { flex: 1, gap: spacing.xxs },
});
