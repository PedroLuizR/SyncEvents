import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Mensagem } from '@/api/types';
import { colors, fonts, radii, spacing } from '@/theme';
import { hora } from '@/utils/chat';
import { formatarMoeda } from '@/utils/masks';

import { Button } from './Button';
import { Text } from './Text';

export interface BolhaMensagemProps {
  mensagem: Mensagem;
  minha: boolean;
  /** Para o cliente: aceitar/recusar a proposta direto no chat. */
  onAceitar?: () => void;
  onRecusar?: () => void;
  onVerProposta?: () => void;
  respondendo?: boolean;
}

const STATUS_PROPOSTA = {
  ENVIADA: { texto: 'Aguardando resposta', cor: colors.warning },
  ACEITA: { texto: 'Aceita', cor: colors.success },
  RECUSADA: { texto: 'Recusada', cor: colors.textMuted },
} as const;

/** Balão de mensagem (minha à direita, em bordô) ou card de proposta. */
export function BolhaMensagem({
  mensagem: m,
  minha,
  onAceitar,
  onRecusar,
  onVerProposta,
  respondendo,
}: BolhaMensagemProps) {
  const rodape = (
    <View style={[styles.rodape, minha && styles.rodapeMinha]}>
      <Text variant="caption">{hora(m.enviadaEm)}</Text>
      {minha ? (
        <Feather
          name={m.lida ? 'check-circle' : 'check'}
          size={12}
          color={m.lida ? colors.success : colors.textSubtle}
          accessibilityLabel={m.lida ? 'Lida' : 'Enviada'}
        />
      ) : null}
    </View>
  );

  if (m.tipo === 'PROPOSTA' && m.proposta) {
    const st = STATUS_PROPOSTA[m.proposta.status];
    return (
      <View style={[styles.linha, minha && styles.linhaMinha]} testID={`mensagem-${m.id}`}>
        <View style={styles.proposta}>
          <View style={styles.propostaTopo}>
            <Feather name="file-text" size={16} color={colors.primary} />
            <Text variant="bodyStrong" style={{ flex: 1 }}>
              Proposta
            </Text>
            <Text style={[styles.propostaStatus, { color: st.cor }]}>{st.texto}</Text>
          </View>
          <Text variant="body" color={colors.textMuted}>
            {m.conteudo}
          </Text>
          <View style={styles.propostaValorLinha}>
            <Text style={styles.propostaValor}>{formatarMoeda(Number(m.proposta.valor))}</Text>
            {onVerProposta ? (
              <Pressable onPress={onVerProposta} accessibilityRole="link" hitSlop={10}>
                <Text style={styles.link}>Ver proposta</Text>
              </Pressable>
            ) : null}
          </View>
          {m.proposta.status === 'ENVIADA' && onAceitar && onRecusar ? (
            <View style={styles.botoes}>
              <Button
                testID={`recusar-${m.id}`}
                titulo="Recusar"
                variante="contorno"
                compacto
                style={{ flex: 1 }}
                desabilitado={respondendo}
                onPress={onRecusar}
              />
              <Button
                testID={`aceitar-${m.id}`}
                titulo="Aceitar"
                compacto
                style={{ flex: 1 }}
                carregando={respondendo}
                onPress={onAceitar}
              />
            </View>
          ) : null}
        </View>
        {rodape}
      </View>
    );
  }

  return (
    <View style={[styles.linha, minha && styles.linhaMinha]} testID={`mensagem-${m.id}`}>
      <View style={[styles.bolha, minha ? styles.minha : styles.deles]}>
        <Text style={[styles.texto, { color: minha ? colors.onPrimary : colors.text }]}>
          {m.conteudo}
        </Text>
      </View>
      {rodape}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { alignItems: 'flex-start', gap: spacing.xxs, marginVertical: spacing.xs },
  linhaMinha: { alignItems: 'flex-end' },
  bolha: {
    maxWidth: '82%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
  },
  minha: { backgroundColor: colors.primary, borderBottomRightRadius: radii.sm },
  deles: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radii.sm,
  },
  texto: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 21 },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  rodapeMinha: { justifyContent: 'flex-end' },
  proposta: {
    maxWidth: '86%',
    minWidth: 240,
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  propostaTopo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  propostaStatus: { fontFamily: fonts.sansSemibold, fontSize: 11 },
  propostaValorLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  propostaValor: { fontFamily: fonts.sansBold, fontSize: 18, color: colors.primary },
  link: { fontFamily: fonts.sansSemibold, fontSize: 13, color: colors.primary },
  botoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
});
