import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts, fontSizes, radii, shadows, spacing, touchTarget } from '@/theme';

export interface BarraBuscaProps {
  valorInicial?: string;
  placeholder?: string;
  onBuscar: (texto: string) => void;
  /** Botão redondo à direita (ex.: abrir filtros). */
  onFiltros?: () => void;
  testID?: string;
}

/**
 * Campo de busca em pílula. Guarda o texto localmente e só avisa ao confirmar.
 * Para trocar o texto de fora, mude a `key` do componente.
 */
export function BarraBusca({
  valorInicial = '',
  placeholder,
  onBuscar,
  onFiltros,
  testID,
}: BarraBuscaProps) {
  const [texto, setTexto] = useState(valorInicial);
  return (
    <View style={styles.barra}>
      <Feather name="search" size={18} color={colors.textMuted} />
      <TextInput
        testID={testID}
        value={texto}
        onChangeText={setTexto}
        onSubmitEditing={() => onBuscar(texto.trim())}
        placeholder={placeholder ?? 'O que sua celebração precisa?'}
        placeholderTextColor={colors.textSubtle}
        returnKeyType="search"
        accessibilityLabel="Buscar empresas"
        style={styles.input}
      />
      {texto.length > 0 ? (
        <Pressable
          onPress={() => {
            setTexto('');
            onBuscar('');
          }}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          hitSlop={12}
        >
          <Feather name="x" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
      {onFiltros ? (
        <Pressable
          onPress={onFiltros}
          accessibilityRole="button"
          accessibilityLabel="Filtros"
          style={styles.filtros}
        >
          <Feather name="sliders" size={16} color={colors.onPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget + 4,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  input: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.text,
    paddingVertical: spacing.md,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  filtros: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
