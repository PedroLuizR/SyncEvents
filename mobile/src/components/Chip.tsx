import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing } from '@/theme';

import { Text } from './Text';

export interface ChipProps {
  rotulo: string;
  selecionado?: boolean;
  onPress?: () => void;
  icone?: ComponentProps<typeof Feather>['name'];
  /** "solido" (filtros) ou "suave" (seleção em formulários, como no Figma). */
  variante?: 'solido' | 'suave';
  testID?: string;
}

/** Chip arredondado e selecionável (filtros, categorias, tipos de evento). */
export function Chip({
  rotulo,
  selecionado = false,
  onPress,
  icone,
  variante = 'solido',
  testID,
}: ChipProps) {
  const suave = variante === 'suave';
  const corTexto = selecionado ? (suave ? colors.primary : colors.onPrimary) : colors.text;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'checkbox' : 'text'}
      accessibilityState={onPress ? { checked: selecionado } : undefined}
      accessibilityLabel={rotulo}
      hitSlop={{ top: 8, bottom: 8 }}
      style={({ pressed }) => [
        styles.chip,
        selecionado ? (suave ? styles.selecionadoSuave : styles.selecionado) : styles.normal,
        pressed && { opacity: 0.8 },
      ]}
    >
      {selecionado && !icone ? <Feather name="check" size={13} color={corTexto} /> : null}
      {icone ? <Feather name={icone} size={13} color={corTexto} /> : null}
      <Text style={[styles.rotulo, { color: corTexto }]}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  normal: { backgroundColor: colors.surface, borderColor: colors.border },
  selecionado: { backgroundColor: colors.primary, borderColor: colors.primary },
  selecionadoSuave: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  rotulo: { fontFamily: fonts.sansMedium, fontSize: fontSizes.sm },
});
