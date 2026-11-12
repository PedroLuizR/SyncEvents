import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing, touchTarget } from '@/theme';

import { Text } from './Text';

export type ButtonVariant = 'primario' | 'secundario' | 'contorno' | 'texto';

export interface ButtonProps {
  titulo: string;
  onPress?: () => void;
  variante?: ButtonVariant;
  /** Botão compacto (ex.: "Responder", "Ver detalhes" nos cards). */
  compacto?: boolean;
  icone?: ComponentProps<typeof Feather>['name'];
  iconePosicao?: 'inicio' | 'fim';
  carregando?: boolean;
  desabilitado?: boolean;
  larguraTotal?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
}

const paleta: Record<ButtonVariant, { fundo: string; texto: string; borda: string }> = {
  primario: { fundo: colors.primary, texto: colors.onPrimary, borda: colors.primary },
  secundario: { fundo: colors.primarySoft, texto: colors.primary, borda: colors.primarySoft },
  contorno: { fundo: colors.surface, texto: colors.text, borda: colors.border },
  texto: { fundo: colors.transparent, texto: colors.primary, borda: colors.transparent },
};

/** Botão em formato pílula, seguindo o Figma. */
export function Button({
  titulo,
  onPress,
  variante = 'primario',
  compacto = false,
  icone,
  iconePosicao = 'inicio',
  carregando = false,
  desabilitado = false,
  larguraTotal = false,
  style,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const p = paleta[variante];
  const inativo = desabilitado || carregando;
  const iconeEl = icone ? <Feather name={icone} size={compacto ? 14 : 18} color={p.texto} /> : null;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      disabled={inativo}
      onPress={onPress}
      hitSlop={compacto ? 6 : 0}
      style={({ pressed }) => [
        styles.base,
        compacto ? styles.compacto : styles.normal,
        { backgroundColor: p.fundo, borderColor: p.borda },
        variante === 'primario' && pressed && { backgroundColor: colors.primaryPressed },
        pressed && variante !== 'primario' && { opacity: 0.75 },
        inativo && styles.inativo,
        larguraTotal && styles.larguraTotal,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={p.texto} testID={testID ? `${testID}-carregando` : undefined} />
      ) : (
        <View style={styles.conteudo}>
          {iconePosicao === 'inicio' && iconeEl}
          <Text
            style={[styles.titulo, compacto && styles.tituloCompacto, { color: p.texto }]}
            numberOfLines={1}
          >
            {titulo}
          </Text>
          {iconePosicao === 'fim' && iconeEl}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  normal: { minHeight: touchTarget + 4, paddingHorizontal: spacing.xxl },
  compacto: { minHeight: 36, paddingHorizontal: spacing.lg },
  larguraTotal: { alignSelf: 'stretch' },
  inativo: { opacity: 0.5 },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  titulo: { fontFamily: fonts.sansSemibold, fontSize: fontSizes.md },
  tituloCompacto: { fontSize: fontSizes.sm },
});
