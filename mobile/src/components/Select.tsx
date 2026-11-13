import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, fontSizes, radii, spacing, touchTarget } from '@/theme';

import { Text } from './Text';

export interface SelectOpcao<T> {
  valor: T;
  rotulo: string;
}

export interface SelectProps<T> {
  label?: string;
  placeholder?: string;
  opcoes: SelectOpcao<T>[];
  valor: T | null | undefined;
  onChange: (valor: T) => void;
  erro?: string;
  testID?: string;
}

/** Campo de seleção que abre uma lista na parte de baixo da tela (bottom sheet). */
export function Select<T extends string | number>({
  label,
  placeholder = 'Selecione',
  opcoes,
  valor,
  onChange,
  erro,
  testID,
}: SelectProps<T>) {
  const [aberto, setAberto] = useState(false);
  const insets = useSafeAreaInsets();
  const selecionada = opcoes.find((o) => o.valor === valor);

  return (
    <View style={styles.container}>
      {label ? <Text variant="label">{label}</Text> : null}
      <Pressable
        testID={testID}
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}: ${selecionada?.rotulo ?? placeholder}` : undefined}
        style={[styles.campo, { borderColor: erro ? colors.danger : colors.border }]}
      >
        <Text
          style={[styles.valor, !selecionada && { color: colors.textSubtle }]}
          numberOfLines={1}
        >
          {selecionada?.rotulo ?? placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {erro ? (
        <Text variant="caption" color={colors.danger}>
          {erro}
        </Text>
      ) : null}

      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable
          accessibilityRole="button"
          style={styles.fundo}
          onPress={() => setAberto(false)}
          accessibilityLabel="Fechar"
        />
        <View style={[styles.folha, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.alca} />
          {label ? (
            <Text variant="subtitle" style={styles.titulo}>
              {label}
            </Text>
          ) : null}
          <ScrollView>
            {opcoes.map((o) => {
              const ativo = o.valor === valor;
              return (
                <Pressable
                  key={String(o.valor)}
                  testID={testID ? `${testID}-${o.valor}` : undefined}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: ativo }}
                  onPress={() => {
                    onChange(o.valor);
                    setAberto(false);
                  }}
                  style={({ pressed }) => [
                    styles.opcao,
                    pressed && { backgroundColor: colors.surfaceMuted },
                  ]}
                >
                  <Text
                    style={[
                      styles.rotulo,
                      ativo && { color: colors.primary, fontFamily: fonts.sansSemibold },
                    ]}
                  >
                    {o.rotulo}
                  </Text>
                  {ativo ? <Feather name="check" size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  valor: { flex: 1, fontFamily: fonts.sans, fontSize: fontSizes.md, color: colors.text },
  fundo: { flex: 1, backgroundColor: colors.overlay },
  folha: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    maxHeight: '70%',
  },
  alca: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  titulo: { marginBottom: spacing.sm },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: touchTarget + 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  rotulo: { fontFamily: fonts.sans, fontSize: fontSizes.md, color: colors.text },
});
