import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { urlArquivo } from '@/api/arquivos';
import type { Servico } from '@/api/types';
import { colors, radii, spacing } from '@/theme';
import { formatarPrecoServico, statusServico } from '@/utils/servico';

import { Button } from './Button';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { Text } from './Text';

export interface ServicoCardProps {
  servico: Servico;
  onEditar: () => void;
  onExcluir: () => void;
}

/** Card da lista "Meus serviços" (empresa). */
export function ServicoCard({ servico, onEditar, onExcluir }: ServicoCardProps) {
  const capa = servico.fotos[0];
  return (
    <Card testID={`servico-${servico.id}`}>
      <View style={styles.linha}>
        {capa ? (
          <Image source={{ uri: urlArquivo(capa.url) }} style={styles.foto} contentFit="cover" />
        ) : (
          <View style={[styles.foto, styles.semFoto]}>
            <Feather name="image" size={22} color={colors.primary} />
          </View>
        )}
        <View style={styles.textos}>
          <Text variant="overline">{servico.categoria.nome}</Text>
          <Text variant="bodyStrong" numberOfLines={2}>
            {servico.nome}
          </Text>
          <Text variant="caption">{formatarPrecoServico(servico)}</Text>
          <StatusBadge status={statusServico(servico)} />
        </View>
      </View>
      <View style={styles.acoes}>
        <Button
          titulo="Excluir"
          variante="contorno"
          compacto
          icone="trash-2"
          accessibilityLabel={`Excluir ${servico.nome}`}
          onPress={onExcluir}
        />
        <Button
          titulo="Editar"
          compacto
          icone="edit-2"
          accessibilityLabel={`Editar ${servico.nome}`}
          onPress={onEditar}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', gap: spacing.md },
  foto: { width: 84, height: 84, borderRadius: radii.md, backgroundColor: colors.surfaceMuted },
  semFoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  textos: { flex: 1, gap: spacing.xxs },
  acoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
