import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radii, spacing } from '@/theme';

import { Text } from './Text';

/**
 * Topo da tela de boas-vindas. O Figma usa uma foto de casamento; enquanto não houver
 * a imagem exportada, desenhamos um fundo bordô com "luzes" desfocadas (ver docs/decisoes.md).
 */
const LUZES = [
  { top: 40, left: 30, size: 90, opacity: 0.18 },
  { top: 20, left: 210, size: 60, opacity: 0.22 },
  { top: 110, left: 140, size: 120, opacity: 0.1 },
  { top: 70, left: 290, size: 100, opacity: 0.14 },
  { top: 160, left: -20, size: 70, opacity: 0.12 },
  { top: 150, left: 250, size: 40, opacity: 0.28 },
  { top: 30, left: 120, size: 24, opacity: 0.4 },
  { top: 95, left: 60, size: 16, opacity: 0.5 },
  { top: 55, left: 330, size: 18, opacity: 0.45 },
];

export function HeroBoasVindas() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
      {LUZES.map((l, i) => (
        <View
          key={i}
          style={[
            styles.luz,
            { top: l.top, left: l.left, width: l.size, height: l.size, opacity: l.opacity },
          ]}
        />
      ))}
      <View style={styles.marca}>
        <View style={styles.logo}>
          <Text style={styles.logoLetra}>S</Text>
        </View>
        <Text style={styles.marcaTexto}>SyncEvents</Text>
      </View>
      <View style={styles.textos}>
        <View style={styles.selo}>
          <Text style={styles.seloTexto}>SEU EVENTO, DO SEU JEITO</Text>
        </View>
        <Text variant="display" color={colors.onPrimary}>
          Momentos especiais começam com boas escolhas.
        </Text>
        <Text variant="body" color="rgba(255,255,255,0.85)">
          Encontre profissionais, organize pedidos e celebre com tranquilidade.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    minHeight: 420,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  luz: { position: 'absolute', borderRadius: radii.pill, backgroundColor: '#F6D9A8' },
  marca: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetra: { fontFamily: fonts.serif, fontSize: 18, color: colors.primary },
  marcaTexto: { fontFamily: fonts.serif, fontSize: 22, color: colors.onPrimary },
  textos: { gap: spacing.md, marginTop: spacing.xxxl },
  selo: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3C7C9',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  seloTexto: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.primary,
  },
});
