import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

export interface EmptyStateProps {
  titulo: string;
  descricao?: string;
  icone?: ComponentProps<typeof Feather>['name'];
  acao?: string;
  onAcao?: () => void;
}

/** Estado vazio / erro das listas. */
export function EmptyState({ titulo, descricao, icone = 'inbox', acao, onAcao }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icone}>
        <Feather name={icone} size={28} color={colors.primary} />
      </View>
      <Text variant="subtitle" style={styles.centro}>
        {titulo}
      </Text>
      {descricao ? (
        <Text variant="body" color={colors.textMuted} style={styles.centro}>
          {descricao}
        </Text>
      ) : null}
      {acao && onAcao ? <Button titulo={acao} onPress={onAcao} variante="secundario" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.md, padding: spacing.xxl },
  icone: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: { textAlign: 'center' },
});
