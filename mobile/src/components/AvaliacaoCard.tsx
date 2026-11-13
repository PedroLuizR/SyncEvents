import { StyleSheet, View } from 'react-native';

import { urlArquivo } from '@/api/arquivos';
import type { Avaliacao } from '@/api/types';
import { rotuloDestaque } from '@/constants/destaques';
import { rotuloTipoEvento } from '@/constants/tiposEvento';
import { colors, fonts, radii, spacing } from '@/theme';
import { tempoRelativo } from '@/utils/solicitacao';

import { Avatar } from './Avatar';
import { RatingStars } from './RatingStars';
import { Text } from './Text';

/** Avaliação no perfil da empresa (tela 7). */
export function AvaliacaoCard({ avaliacao: a }: { avaliacao: Avaliacao }) {
  return (
    <View style={styles.card} testID={`avaliacao-${a.id}`}>
      <View style={styles.topo}>
        <Avatar nome={a.autor.nome} uri={urlArquivo(a.autor.fotoUrl)} tamanho={36} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">{a.autor.nome}</Text>
          <Text variant="caption">
            {rotuloTipoEvento(a.tipoEvento)} · {tempoRelativo(a.criadoEm)}
          </Text>
        </View>
        <RatingStars nota={a.nota} tamanho={13} />
      </View>
      {a.comentario ? <Text variant="body">“{a.comentario}”</Text> : null}
      {a.destaques.length > 0 ? (
        <View style={styles.destaques}>
          {a.destaques.map((d) => (
            <View key={d} style={styles.destaque}>
              <Text style={styles.destaqueTexto}>✓ {rotuloDestaque(d)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  destaques: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  destaque: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.successSoft,
  },
  destaqueTexto: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.success },
});
