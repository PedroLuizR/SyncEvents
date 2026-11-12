import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing, touchTarget } from '@/theme';

import { Text } from './Text';

export interface HeaderProps {
  titulo: string;
  subtitulo?: string;
  /** Ação do botão voltar. Padrão: router.back(). Use `null` para esconder. */
  onVoltar?: (() => void) | null;
  direita?: ReactNode;
}

/** Cabeçalho das telas internas: botão voltar redondo + título serifado. */
export function Header({ titulo, subtitulo, onVoltar, direita }: HeaderProps) {
  const voltar = onVoltar === undefined ? () => router.back() : onVoltar;
  return (
    <View style={styles.linha}>
      {voltar ? (
        <Pressable
          onPress={voltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={({ pressed }) => [styles.voltar, pressed && { opacity: 0.7 }]}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={styles.textos}>
        <Text variant="subtitle" accessibilityRole="header" numberOfLines={1}>
          {titulo}
        </Text>
        {subtitulo ? <Text variant="caption">{subtitulo}</Text> : null}
      </View>
      {direita}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  voltar: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: spacing.xxs },
});
