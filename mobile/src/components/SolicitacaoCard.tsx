import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { urlArquivo } from '@/api/arquivos';
import type { Solicitacao, TipoUsuario } from '@/api/types';
import { rotuloTipoEvento } from '@/constants/tiposEvento';
import { colors, fonts, radii, shadows, spacing } from '@/theme';
import { formatarMoeda } from '@/utils/masks';
import {
  convidados,
  formatarDataEvento,
  formatarOrcamento,
  tempoRelativo,
} from '@/utils/solicitacao';

import { Avatar } from './Avatar';
import { Button } from './Button';
import { StatusSolicitacaoBadge } from './StatusSolicitacaoBadge';
import { Text } from './Text';

export interface SolicitacaoCardProps {
  solicitacao: Solicitacao;
  /** Quem está vendo: o cliente vê a empresa; a empresa vê o cliente. */
  quem: TipoUsuario;
  onPress: () => void;
  /** Botão "Responder" (empresa, solicitações novas). */
  onResponder?: () => void;
}

export function SolicitacaoCard({
  solicitacao: s,
  quem,
  onPress,
  onResponder,
}: SolicitacaoCardProps) {
  const cliente = quem === 'CLIENTE';
  const nome = cliente ? s.empresa.nomeFantasia : s.cliente.nome;
  const foto = cliente ? s.empresa.logoUrl : s.cliente.fotoUrl;
  const proposta = s.propostaAtual;

  return (
    <View style={styles.card} testID={`solicitacao-${s.id}`}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Solicitação para ${nome}, ${rotuloTipoEvento(s.tipoEvento)} em ${formatarDataEvento(s.dataEvento)}`}
        style={styles.topo}
      >
        <Avatar
          nome={nome}
          uri={urlArquivo(foto)}
          tamanho={44}
          formato={cliente ? 'quadrado' : 'circulo'}
        />
        <View style={styles.flex}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {nome}
          </Text>
          <Text variant="caption" numberOfLines={2}>
            {rotuloTipoEvento(s.tipoEvento)} · {convidados(s.qtdConvidados)} ·{' '}
            {formatarDataEvento(s.dataEvento)}
          </Text>
        </View>
        <StatusSolicitacaoBadge status={s.status} quem={quem} />
      </Pressable>

      {!cliente ? (
        <View style={styles.faixa}>
          <Text variant="caption" numberOfLines={1} style={styles.flex}>
            {s.local}
          </Text>
          <Text style={styles.faixaValor}>{formatarOrcamento(s.orcamentoMin, s.orcamentoMax)}</Text>
        </View>
      ) : null}

      <View style={styles.rodape}>
        <Text variant="caption" style={styles.flex}>
          {proposta
            ? `Proposta: ${formatarMoeda(Number(proposta.valor))}`
            : `Enviada ${tempoRelativo(s.criadoEm)}`}
        </Text>
        {cliente ? (
          <Pressable onPress={onPress} accessibilityRole="button" hitSlop={10} style={styles.link}>
            <Text style={styles.linkTexto}>
              {s.status === 'EM_NEGOCIACAO' ? 'Ver proposta' : 'Ver detalhes'}
            </Text>
            <Feather name="arrow-right" size={14} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.botoes}>
            <Button titulo="Ver detalhes" variante="contorno" compacto onPress={onPress} />
            {onResponder ? <Button titulo="Responder" compacto onPress={onResponder} /> : null}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: spacing.xxs },
  faixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
  },
  faixaValor: { fontFamily: fonts.sansSemibold, fontSize: 12, color: colors.primary },
  rodape: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  link: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  linkTexto: { fontFamily: fonts.sansSemibold, fontSize: 13, color: colors.primary },
  botoes: { flexDirection: 'row', gap: spacing.sm },
});
