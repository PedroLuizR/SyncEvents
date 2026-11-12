import { StyleSheet, View } from 'react-native';

import type { StatusSolicitacao, TipoUsuario } from '@/api/types';
import { fonts, radii, spacing } from '@/theme';
import { estiloStatus } from '@/utils/solicitacao';

import { Text } from './Text';

export function StatusSolicitacaoBadge({
  status,
  quem,
}: {
  status: StatusSolicitacao;
  quem: TipoUsuario;
}) {
  const e = estiloStatus(status, quem);
  return (
    <View
      style={[styles.badge, { backgroundColor: e.fundo }]}
      accessibilityLabel={`Status: ${e.rotulo}`}
    >
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
