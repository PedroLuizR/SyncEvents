import { Feather } from '@expo/vector-icons';
import { isValidElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing, touchTarget } from '@/theme';

import { Text } from './Text';

export interface CheckboxProps {
  marcado: boolean;
  onChange: (marcado: boolean) => void;
  children: ReactNode;
  erro?: string;
  testID?: string;
}

export function Checkbox({ marcado, onChange, children, erro, testID }: CheckboxProps) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Pressable
        testID={testID}
        onPress={() => onChange(!marcado)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: marcado }}
        style={styles.linha}
      >
        <View style={[styles.caixa, marcado && styles.marcada, erro && !marcado && styles.erro]}>
          {marcado ? <Feather name="check" size={14} color={colors.onPrimary} /> : null}
        </View>
        <View style={styles.texto}>
          {isValidElement(children) ? children : <Text variant="label">{children}</Text>}
        </View>
      </Pressable>
      {erro ? (
        <Text variant="caption" color={colors.danger}>
          {erro}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: touchTarget },
  caixa: {
    width: 22,
    height: 22,
    borderRadius: radii.sm - 2,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcada: { backgroundColor: colors.primary, borderColor: colors.primary },
  erro: { borderColor: colors.danger },
  texto: { flex: 1 },
});
