import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { urlArquivo } from '@/api/arquivos';
import { mensagemDeErro } from '@/api/client';
import type { Conversa } from '@/api/types';
import { Avatar, Card, EmptyState, Header, StatusSolicitacaoBadge, Text } from '@/components';
import { rotuloTipoEvento } from '@/constants/tiposEvento';
import { useConversas } from '@/hooks/useChat';
import { useSessionStore } from '@/store/session';
import { colors, fonts, radii, spacing } from '@/theme';
import { hora, mesmoDia, previaMensagem, rotuloDia } from '@/utils/chat';
import { formatarDataEvento } from '@/utils/solicitacao';

/** Lista de conversas (sem frame no Figma): última mensagem e não lidas. */
export default function ConversasScreen() {
  const conversas = useConversas();
  const quem = useSessionStore((s) => s.usuario?.tipo ?? 'CLIENTE');

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <View style={styles.topo}>
        <Header titulo="Conversas" subtitulo="Uma conversa por solicitação de orçamento" />
      </View>
      <FlatList
        data={conversas.data ?? []}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => <ItemConversa c={item} quem={quem} />}
        ListEmptyComponent={
          conversas.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
          ) : conversas.isError ? (
            <Card>
              <EmptyState
                titulo="Não foi possível carregar"
                descricao={mensagemDeErro(conversas.error)}
                icone="wifi-off"
                acao="Tentar de novo"
                onAcao={() => conversas.refetch()}
              />
            </Card>
          ) : (
            <Card>
              <EmptyState
                titulo="Nenhuma conversa ainda"
                descricao={
                  quem === 'CLIENTE'
                    ? 'Cada pedido de orçamento abre uma conversa com a empresa.'
                    : 'Quando um cliente pedir orçamento, a conversa aparece aqui.'
                }
                icone="message-circle"
              />
            </Card>
          )
        }
      />
    </SafeAreaView>
  );
}

function ItemConversa({ c, quem }: { c: Conversa; quem: 'CLIENTE' | 'EMPRESA' }) {
  const ultima = c.ultimaMensagem;
  const quando = ultima
    ? mesmoDia(ultima.enviadaEm, new Date().toISOString())
      ? hora(ultima.enviadaEm)
      : rotuloDia(ultima.enviadaEm)
    : '';
  return (
    <Pressable
      testID={`conversa-${c.id}`}
      onPress={() => router.push(`/chat/${c.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Conversa com ${c.contato.nome}${c.naoLidas ? `, ${c.naoLidas} não lidas` : ''}`}
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.85 }]}
    >
      <Avatar
        nome={c.contato.nome}
        uri={urlArquivo(c.contato.fotoUrl)}
        tamanho={48}
        formato={quem === 'CLIENTE' ? 'quadrado' : 'circulo'}
      />
      <View style={{ flex: 1, gap: spacing.xxs }}>
        <View style={styles.linha}>
          <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
            {c.contato.nome}
          </Text>
          <Text variant="caption">{quando}</Text>
        </View>
        <Text variant="caption" numberOfLines={1}>
          {rotuloTipoEvento(c.tipoEvento)} · {formatarDataEvento(c.dataEvento)}
        </Text>
        <View style={styles.linha}>
          <Text
            numberOfLines={1}
            style={[
              styles.previa,
              c.naoLidas > 0 && { fontFamily: fonts.sansSemibold, color: colors.text },
            ]}
          >
            {previaMensagem(ultima, c.meuUsuarioId)}
          </Text>
          {c.naoLidas > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{c.naoLidas}</Text>
            </View>
          ) : (
            <StatusSolicitacaoBadge status={c.status} quem={quem} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  topo: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  lista: { padding: spacing.xl, gap: spacing.sm },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  previa: { flex: 1, fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTexto: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.onPrimary },
});
