import { Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '@/theme';

import { Text } from './Text';

export interface SectionHeaderProps {
  titulo: string;
  /** Texto da ação à direita (ex.: "Ver todas"). */
  acao?: string;
  onAcao?: () => void;
}

export function SectionHeader({ titulo, acao, onAcao }: SectionHeaderProps) {
  return (
    <View style={styles.linha}>
      <Text variant="subtitle" accessibilityRole="header">
        {titulo}
      </Text>
      {acao && onAcao ? (
        <Pressable onPress={onAcao} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.acao}>{acao}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  acao: { fontFamily: fonts.sansMedium, fontSize: fontSizes.sm, color: colors.primary },
});
