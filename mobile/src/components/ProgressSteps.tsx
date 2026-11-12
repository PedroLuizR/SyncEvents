import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

export interface ProgressStepsProps {
  total: number;
  atual: number;
}

/** Barra de progresso em segmentos ("Etapa 1 de 2"). */
export function ProgressSteps({ total, atual }: ProgressStepsProps) {
  return (
    <View
      style={styles.linha}
      accessibilityRole="progressbar"
      accessibilityLabel={`Etapa ${atual} de ${total}`}
      accessibilityValue={{ min: 1, max: total, now: atual }}
    >
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.segmento, { backgroundColor: i < atual ? colors.primary : colors.border }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', gap: spacing.sm },
  segmento: { flex: 1, height: 4, borderRadius: radii.pill },
});
