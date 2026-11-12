import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { urlArquivo } from '@/api/arquivos';
import type { EmpresaResumo } from '@/api/types';
import { colors, radii, shadows, spacing } from '@/theme';
import { formatarMoeda } from '@/utils/masks';

import { Nota } from './Nota';
import { Text } from './Text';

export interface EmpresaCardProps {
  empresa: EmpresaResumo;
  onPress: () => void;
  /** "lista" (busca: foto à esquerda) ou "destaque" (recomendados: foto em cima). */
  variante?: 'lista' | 'destaque';
}

/** "DECORAÇÃO & BUFFET" a partir das duas primeiras categorias. */
export function rotuloCategorias(empresa: Pick<EmpresaResumo, 'categorias'>): string {
  return empresa.categorias
    .slice(0, 2)
    .map((c) => c.nome)
    .join(' & ');
}

export function textoPreco(preco?: number | null): string {
  return preco != null ? `A partir de ${formatarMoeda(Number(preco))}` : 'Preço sob consulta';
}

export function EmpresaCard({ empresa, onPress, variante = 'lista' }: EmpresaCardProps) {
  const imagem = urlArquivo(empresa.capaUrl ?? empresa.logoUrl);
  const destaque = variante === 'destaque';
  return (
    <Pressable
      testID={`empresa-${empresa.id}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${empresa.nomeFantasia}, ${rotuloCategorias(empresa)}, ${empresa.cidade}`}
      style={({ pressed }) => [
        styles.card,
        destaque ? styles.destaque : styles.lista,
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={destaque ? styles.fotoDestaque : styles.fotoLista}>
        {imagem ? (
          <Image source={{ uri: imagem }} style={styles.imagem} contentFit="cover" />
        ) : (
          <View style={[styles.imagem, styles.semFoto]}>
            <Feather name="image" size={22} color={colors.primary} />
          </View>
        )}
      </View>
      <View style={styles.textos}>
        <View style={styles.topo}>
          <Text variant="overline" numberOfLines={1} style={styles.flex}>
            {rotuloCategorias(empresa)}
          </Text>
          <Nota nota={empresa.nota} total={empresa.totalAvaliacoes} compacta />
        </View>
        <Text variant="bodyStrong" numberOfLines={destaque ? 1 : 2}>
          {empresa.nomeFantasia}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {empresa.cidade}
        </Text>
        <Text variant="caption" color={colors.primary} numberOfLines={1}>
          {textoPreco(empresa.precoAPartirDe)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  lista: { flexDirection: 'row', minHeight: 116 },
  destaque: { width: 230 },
  fotoLista: { width: 112, alignSelf: 'stretch' },
  fotoDestaque: { height: 120 },
  imagem: { width: '100%', height: '100%', backgroundColor: colors.surfaceMuted },
  semFoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  textos: { flex: 1, padding: spacing.md, gap: spacing.xxs },
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
});
