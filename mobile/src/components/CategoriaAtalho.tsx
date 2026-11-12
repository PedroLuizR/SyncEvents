import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Categoria } from '@/api/types';
import { colors, fonts, radii, spacing, tonsCategoria } from '@/theme';

import { Text } from './Text';

/** Ícone de categoria do Início ("Explore por categoria"). */
export function CategoriaAtalho({
  categoria,
  indice,
  onPress,
}: {
  categoria: Categoria;
  indice: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={`categoria-${categoria.id}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Categoria ${categoria.nome}`}
      style={styles.item}
    >
      <View
        style={[styles.icone, { backgroundColor: tonsCategoria[indice % tonsCategoria.length] }]}
      >
        <Feather
          name={categoria.icone as ComponentProps<typeof Feather>['name']}
          size={22}
          color={colors.primary}
        />
      </View>
      <Text style={styles.rotulo} numberOfLines={1}>
        {categoria.nome}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { width: 76, alignItems: 'center', gap: spacing.xs },
  icone: {
    width: 60,
    height: 60,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotulo: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.text },
});
