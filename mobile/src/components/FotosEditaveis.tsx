import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, radii, spacing } from '@/theme';

import { Text } from './Text';

export interface FotoItem {
  /** chave estável (id salvo ou uri local) */
  chave: string;
  uri: string;
}

export interface FotosEditaveisProps {
  titulo: string;
  fotos: FotoItem[];
  maximo: number;
  onAdicionar: () => void;
  onRemover: (chave: string) => void;
  carregando?: boolean;
  colunas?: number;
  erro?: string;
}

/** Grade de fotos com botão "Adicionar" e "x" para remover (fotos do serviço, portfólio). */
export function FotosEditaveis({
  titulo,
  fotos,
  maximo,
  onAdicionar,
  onRemover,
  carregando,
  colunas = 3,
  erro,
}: FotosEditaveisProps) {
  const largura = `${(100 - (colunas - 1) * 3) / colunas}%` as const;
  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text variant="label">{titulo}</Text>
        <Text variant="caption">
          {fotos.length} de {maximo}
        </Text>
      </View>
      <View style={styles.grade}>
        {fotos.map((f, i) => (
          <View key={f.chave} style={[styles.celula, { width: largura }]}>
            <Image
              source={{ uri: f.uri }}
              style={styles.imagem}
              contentFit="cover"
              accessibilityLabel={`Foto ${i + 1}`}
            />
            <Pressable
              onPress={() => onRemover(f.chave)}
              accessibilityRole="button"
              accessibilityLabel={`Remover foto ${i + 1}`}
              hitSlop={10}
              style={styles.remover}
            >
              <Feather name="x" size={14} color={colors.onPrimary} />
            </Pressable>
          </View>
        ))}
        {fotos.length < maximo ? (
          <Pressable
            testID="adicionar-foto"
            onPress={onAdicionar}
            disabled={carregando}
            accessibilityRole="button"
            accessibilityLabel="Adicionar foto"
            style={[styles.celula, styles.adicionar, { width: largura }]}
          >
            {carregando ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Feather name="image" size={20} color={colors.primary} />
                <Text style={styles.adicionarTexto}>Adicionar</Text>
              </>
            )}
          </Pressable>
        ) : null}
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
  container: { gap: spacing.sm },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: '3%', rowGap: spacing.sm },
  celula: { aspectRatio: 1, borderRadius: radii.md, overflow: 'hidden' },
  imagem: { width: '100%', height: '100%', backgroundColor: colors.surfaceMuted },
  remover: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adicionar: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  adicionarTexto: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.primary },
});
