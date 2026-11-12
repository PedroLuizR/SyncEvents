import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Text } from './Text';

export interface OptionCardProps {
  titulo: string;
  descricao: string;
  icone: ComponentProps<typeof Feather>['name'];
  selecionado: boolean;
  onPress: () => void;
  testID?: string;
}

/** Card de escolha única com rádio (ex.: "Sou cliente" / "Sou empresa"). */
export function OptionCard({
  titulo,
  descricao,
  icone,
  selecionado,
  onPress,
  testID,
}: OptionCardProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selecionado }}
      accessibilityLabel={`${titulo}. ${descricao}`}
      style={[styles.card, selecionado ? styles.selecionado : styles.normal]}
    >
      <View style={[styles.icone, selecionado ? styles.iconeAtivo : styles.iconeNormal]}>
        <Feather name={icone} size={20} color={selecionado ? colors.onPrimary : colors.primary} />
      </View>
      <View style={styles.textos}>
        <Text variant="bodyStrong">{titulo}</Text>
        <Text variant="caption">{descricao}</Text>
      </View>
      <View style={[styles.radio, selecionado && styles.radioAtivo]}>
        {selecionado ? <Feather name="check" size={12} color={colors.primary} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  normal: { backgroundColor: colors.surface, borderColor: colors.border },
  selecionado: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  icone: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeNormal: { backgroundColor: colors.primarySoft },
  iconeAtivo: { backgroundColor: colors.primary },
  textos: { flex: 1, gap: spacing.xxs },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioAtivo: { borderColor: colors.primary },
});
