import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Text } from './Text';

export interface BannerProps {
  tipo: 'sucesso' | 'erro' | 'info';
  mensagem: string;
}

const estilos = {
  sucesso: { fundo: colors.successSoft, cor: colors.success, icone: 'check-circle' },
  erro: { fundo: colors.dangerSoft, cor: colors.danger, icone: 'alert-circle' },
  info: { fundo: colors.primarySoft, cor: colors.primary, icone: 'info' },
} as const;

/** Mensagem em destaque (sucesso do cadastro, erro de login...). */
export function Banner({ tipo, mensagem }: BannerProps) {
  const e = estilos[tipo];
  return (
    <View
      style={[styles.banner, { backgroundColor: e.fundo }]}
      accessibilityRole={tipo === 'erro' ? 'alert' : 'text'}
      accessibilityLiveRegion="polite"
    >
      <Feather name={e.icone} size={18} color={e.cor} />
      <Text variant="label" color={e.cor} style={styles.texto}>
        {mensagem}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  texto: { flex: 1 },
});
