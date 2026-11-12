import { FontAwesome } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatarNota } from '@/utils/masks';
import { colors, spacing } from '@/theme';

import { Text } from './Text';

export interface RatingStarsProps {
  /** Nota de 0 a 5 (aceita decimais na exibição). */
  nota: number;
  tamanho?: number;
  /** Exibe a nota numérica ao lado (ex.: "4,9"). */
  mostrarNota?: boolean;
  /** Total de avaliações, exibido como "(128)". */
  total?: number;
  /** Quando informado, as estrelas ficam tocáveis (seleção de nota 1 a 5). */
  onChange?: (nota: number) => void;
  testID?: string;
}

export function RatingStars({
  nota,
  tamanho = 14,
  mostrarNota = false,
  total,
  onChange,
  testID,
}: RatingStarsProps) {
  const estrelas = [1, 2, 3, 4, 5].map((i) => {
    const icone = nota >= i ? 'star' : nota >= i - 0.5 ? 'star-half-o' : 'star-o';
    const cor = nota >= i - 0.5 ? colors.star : colors.starEmpty;
    const estrela = <FontAwesome name={icone} size={tamanho} color={cor} />;
    if (!onChange) return <View key={i}>{estrela}</View>;
    return (
      <Pressable
        key={i}
        testID={testID ? `${testID}-${i}` : undefined}
        onPress={() => onChange(i)}
        accessibilityRole="button"
        accessibilityLabel={`${i} ${i === 1 ? 'estrela' : 'estrelas'}`}
        accessibilityState={{ selected: nota === i }}
        style={styles.tocavel}
      >
        {estrela}
      </Pressable>
    );
  });

  return (
    <View
      testID={testID}
      style={styles.linha}
      accessible={!onChange}
      accessibilityLabel={!onChange ? `Nota ${formatarNota(nota)} de 5` : undefined}
    >
      <View style={[styles.linha, { gap: onChange ? spacing.xs : spacing.xxs }]}>{estrelas}</View>
      {mostrarNota ? <Text variant="bodyStrong">{formatarNota(nota)}</Text> : null}
      {total !== undefined ? <Text variant="caption">({total})</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  tocavel: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
