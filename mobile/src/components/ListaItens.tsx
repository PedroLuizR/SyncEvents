import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput as RNTextInput, View } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing, touchTarget } from '@/theme';

import { Text } from './Text';

export interface ListaItensProps {
  titulo: string;
  itens: string[];
  onChange: (itens: string[]) => void;
  placeholder?: string;
  maximo?: number;
}

/** Lista "O que está incluso": itens com ✓, botão de remover e campo para adicionar. */
export function ListaItens({ titulo, itens, onChange, placeholder, maximo = 30 }: ListaItensProps) {
  const [novo, setNovo] = useState('');

  const adicionar = () => {
    const texto = novo.trim();
    if (!texto || itens.length >= maximo) return;
    onChange([...itens, texto]);
    setNovo('');
  };

  return (
    <View style={styles.container}>
      <Text variant="label">{titulo}</Text>
      {itens.map((item, i) => (
        <View key={`${item}-${i}`} style={styles.item}>
          <Feather name="check-circle" size={18} color={colors.success} />
          <Text variant="body" style={styles.texto}>
            {item}
          </Text>
          <Pressable
            onPress={() => onChange(itens.filter((_, j) => j !== i))}
            accessibilityRole="button"
            accessibilityLabel={`Remover ${item}`}
            hitSlop={12}
          >
            <Feather name="trash-2" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      ))}
      {itens.length < maximo ? (
        <View style={styles.novo}>
          <RNTextInput
            testID="novo-item"
            value={novo}
            onChangeText={setNovo}
            placeholder={placeholder ?? 'Adicionar item'}
            placeholderTextColor={colors.textSubtle}
            onSubmitEditing={adicionar}
            returnKeyType="done"
            accessibilityLabel="Novo item incluso"
            style={styles.input}
          />
          <Pressable
            testID="adicionar-item"
            onPress={adicionar}
            accessibilityRole="button"
            accessibilityLabel="Adicionar item"
            style={styles.botao}
          >
            <Feather name="plus" size={18} color={colors.onPrimary} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 36 },
  texto: { flex: 1 },
  novo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    minHeight: touchTarget,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.text,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  botao: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
