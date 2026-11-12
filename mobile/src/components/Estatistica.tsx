import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, fonts, radii, shadows, spacing } from '@/theme';

import { Text } from './Text';

/** Card de indicador do painel: ícone, variação (+18%) e número grande. */
export function Estatistica({
  icone,
  valor,
  rotulo,
  variacao,
  testID,
}: {
  icone: ComponentProps<typeof Feather>['name'];
  valor: string;
  rotulo: string;
  variacao?: number | null;
  testID?: string;
}) {
  const positiva = (variacao ?? 0) >= 0;
  return (
    <View style={styles.card} testID={testID} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <View style={styles.topo}>
        <View style={styles.icone}>
          <Feather name={icone} size={16} color={colors.primary} />
        </View>
        {variacao != null ? (
          <View
            style={[
              styles.variacao,
              { backgroundColor: positiva ? colors.successSoft : colors.dangerSoft },
            ]}
          >
            <Text
              style={[styles.variacaoTexto, { color: positiva ? colors.success : colors.danger }]}
            >
              {positiva ? '+' : ''}
              {variacao}%
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.valor}>{valor}</Text>
      <Text variant="caption">{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icone: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variacao: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.pill },
  variacaoTexto: { fontFamily: fonts.sansSemibold, fontSize: 11 },
  valor: { fontFamily: fonts.sansBold, fontSize: 24, color: colors.text, marginTop: spacing.sm },
});
