import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing } from '@/theme';
import { formatarNota } from '@/utils/masks';

import { Text } from './Text';

/** "★ 4,9 (127)" ou, sem avaliações, o selo "Novo". */
export function Nota({
  nota,
  total,
  compacta,
}: {
  nota?: number | null;
  total?: number;
  compacta?: boolean;
}) {
  if (nota == null || !total) {
    return (
      <View style={styles.novo} accessibilityLabel="Sem avaliações ainda">
        <Text style={styles.novoTexto}>Novo</Text>
      </View>
    );
  }
  return (
    <View
      style={styles.linha}
      accessibilityLabel={`Nota ${formatarNota(nota)} de 5, ${total} avaliações`}
    >
      <FontAwesome name="star" size={13} color={colors.star} />
      <Text style={styles.nota}>{formatarNota(nota)}</Text>
      {!compacta ? <Text variant="caption">({total})</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start' },
  nota: { fontFamily: fonts.sansSemibold, fontSize: fontSizes.sm, color: colors.text },
  novo: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },
  novoTexto: { fontFamily: fonts.sansSemibold, fontSize: 11, color: colors.primary },
});
