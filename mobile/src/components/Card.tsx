import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  /** Remove o padding interno (ex.: cards com imagem de capa). */
  semPadding?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
}

/** Card branco com borda suave e cantos arredondados. */
export function Card({
  children,
  onPress,
  semPadding,
  style,
  accessibilityLabel,
  testID,
}: CardProps) {
  const estilo = [styles.card, !semPadding && styles.padding, style];
  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [...estilo, pressed && { opacity: 0.9 }]}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View testID={testID} style={estilo}>
      {children}
    </View>
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
  padding: { padding: spacing.lg },
});
