import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import type { Proposta } from '@/api/types';
import { colors, fonts, radii, spacing } from '@/theme';
import { formatarMoeda } from '@/utils/masks';
import { tempoRelativo } from '@/utils/solicitacao';

import { Button } from './Button';
import { Text } from './Text';

const ROTULO: Record<Proposta['status'], { texto: string; cor: string }> = {
  ENVIADA: { texto: 'Aguardando resposta', cor: colors.warning },
  ACEITA: { texto: 'Aceita', cor: colors.success },
  RECUSADA: { texto: 'Recusada', cor: colors.textMuted },
};

export interface PropostaCardProps {
  proposta: Proposta;
  titulo?: string;
  onAceitar?: () => void;
  onRecusar?: () => void;
  carregando?: 'aceitar' | 'recusar' | null;
}

/** Card "Proposta" com valor, descrição e, para o cliente, Aceitar/Recusar. */
export function PropostaCard({
  proposta,
  titulo = 'Proposta',
  onAceitar,
  onRecusar,
  carregando,
}: PropostaCardProps) {
  const r = ROTULO[proposta.status];
  const ativa = proposta.status === 'ENVIADA';
  return (
    <View style={[styles.card, ativa && styles.ativa]} testID={`proposta-${proposta.id}`}>
      <View style={styles.cabecalho}>
        <Feather name="file-text" size={18} color={colors.primary} />
        <Text variant="bodyStrong" style={styles.flex}>
          {titulo}
        </Text>
        <Text style={[styles.status, { color: r.cor }]}>{r.texto}</Text>
      </View>
      <Text style={styles.valor}>{formatarMoeda(Number(proposta.valor))}</Text>
      <Text variant="body" color={colors.textMuted}>
        {proposta.descricao}
      </Text>
      <Text variant="caption">Enviada {tempoRelativo(proposta.criadoEm)}</Text>
      {ativa && (onAceitar || onRecusar) ? (
        <View style={styles.botoes}>
          {onRecusar ? (
            <Button
              testID="recusar-proposta"
              titulo="Recusar"
              variante="contorno"
              style={styles.flex}
              carregando={carregando === 'recusar'}
              desabilitado={carregando != null}
              onPress={onRecusar}
            />
          ) : null}
          {onAceitar ? (
            <Button
              testID="aceitar-proposta"
              titulo="Aceitar proposta"
              style={styles.flex}
              carregando={carregando === 'aceitar'}
              desabilitado={carregando != null}
              onPress={onAceitar}
            />
          ) : null}
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
  ativa: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  status: { fontFamily: fonts.sansSemibold, fontSize: 12 },
  valor: { fontFamily: fonts.serif, fontSize: 26, color: colors.text },
  botoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});
