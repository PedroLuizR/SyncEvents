import { StyleSheet, View } from 'react-native';

import { colors, fonts, radii, spacing } from '@/theme';
import type { StatusServico } from '@/utils/servico';

import { Text } from './Text';

const estilos: Record<StatusServico, { fundo: string; cor: string; rotulo: string }> = {
  ATIVO: { fundo: colors.successSoft, cor: colors.success, rotulo: 'Ativo' },
  INATIVO: { fundo: colors.surfaceMuted, cor: colors.textMuted, rotulo: 'Inativo' },
  RASCUNHO: { fundo: colors.warningSoft, cor: colors.warning, rotulo: 'Rascunho' },
};

export function StatusBadge({ status }: { status: StatusServico }) {
  const e = estilos[status];
  return (
    <View style={[styles.badge, { backgroundColor: e.fundo }]}>
      <Text style={[styles.texto, { color: e.cor }]}>{e.rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
  },
  texto: { fontFamily: fonts.sansSemibold, fontSize: 11 },
});
