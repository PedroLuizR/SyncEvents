import { Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing } from '@/theme';

import { Text } from './Text';

export interface SegmentedControlProps<T extends string> {
  opcoes: { valor: T; rotulo: string }[];
  valor: T;
  onChange: (valor: T) => void;
}

/** Abas em pílula (ex.: Cliente / Empresa no login). */
export function SegmentedControl<T extends string>({
  opcoes,
  valor,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.trilho} accessibilityRole="tablist">
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onChange(o.valor)}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            accessibilityLabel={o.rotulo}
            style={[styles.opcao, ativo && styles.ativa]}
          >
            <Text
              style={[
                styles.rotulo,
                {
                  color: ativo ? colors.primary : colors.textMuted,
                  fontFamily: ativo ? fonts.sansSemibold : fonts.sansMedium,
                },
              ]}
            >
              {o.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  trilho: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    padding: spacing.xs,
  },
  opcao: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ativa: {
    backgroundColor: colors.surface,
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  rotulo: { fontSize: fontSizes.sm },
});
