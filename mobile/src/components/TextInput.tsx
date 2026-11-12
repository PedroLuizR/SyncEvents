import { Feather } from '@expo/vector-icons';
import { useState, type ComponentProps, type ComponentRef, type Ref } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
} from 'react-native';

import { colors, fonts, fontSizes, radii, spacing, touchTarget } from '@/theme';

import { Text } from './Text';

export interface TextInputProps extends Omit<RNTextInputProps, 'onChangeText'> {
  label?: string;
  erro?: string;
  dica?: string;
  icone?: ComponentProps<typeof Feather>['name'];
  /** Mostra o ícone de olho para alternar a visibilidade (campos de senha). */
  senha?: boolean;
  /** Função de máscara aplicada a cada alteração (ex.: mascaraTelefone). */
  mascara?: (valor: string) => string;
  onChangeText?: (valor: string) => void;
  ref?: Ref<ComponentRef<typeof RNTextInput>>;
}

export function TextInput({
  label,
  erro,
  dica,
  icone,
  senha = false,
  mascara,
  onChangeText,
  style,
  multiline,
  ref,
  ...rest
}: TextInputProps) {
  const [focado, setFocado] = useState(false);
  const [visivel, setVisivel] = useState(false);
  const oculto = senha && !visivel;

  const corBorda = erro ? colors.danger : focado ? colors.primary : colors.border;

  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View style={[styles.campo, multiline && styles.campoMultilinha, { borderColor: corBorda }]}>
        {icone ? <Feather name={icone} size={18} color={colors.textMuted} /> : null}
        <RNTextInput
          ref={ref}
          {...rest}
          accessibilityLabel={label}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={oculto}
          multiline={multiline}
          onFocus={(e) => {
            setFocado(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            rest.onBlur?.(e);
          }}
          onChangeText={(v) => onChangeText?.(mascara ? mascara(v) : v)}
          style={[styles.input, multiline && styles.inputMultilinha, style]}
        />
        {senha ? (
          <Pressable
            onPress={() => setVisivel((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={oculto ? 'Mostrar senha' : 'Ocultar senha'}
            hitSlop={12}
          >
            <Feather name={oculto ? 'eye' : 'eye-off'} size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {erro ? (
        <Text variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : dica ? (
        <Text variant="caption">{dica}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { color: colors.textMuted },
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
  campoMultilinha: { alignItems: 'flex-start', paddingVertical: spacing.md },
  input: {
    flex: 1,
    // remove o contorno de foco do navegador (a borda do campo já indica o foco)
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  inputMultilinha: { minHeight: 96, textAlignVertical: 'top', paddingVertical: 0 },
});
