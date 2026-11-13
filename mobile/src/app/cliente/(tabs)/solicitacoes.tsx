import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mensagemDeErro } from '@/api/client';
import { Card, Chip, EmptyState, FormAvaliacao, SolicitacaoCard, Text } from '@/components';
import type { Solicitacao } from '@/api/types';
import { useMinhasSolicitacoes } from '@/hooks/useSolicitacoes';
import { useSessionStore } from '@/store/session';
import { colors, fonts, radii, spacing } from '@/theme';
import { ABAS_CLIENTE, filtrar } from '@/utils/solicitacao';

/** Tela 10 do Figma (parte de lista): "Minhas solicitações" do cliente. */
export default function MinhasSolicitacoesScreen() {
  const usuario = useSessionStore((s) => s.usuario);
  const solicitacoes = useMinhasSolicitacoes();
  const [aba, setAba] = useState('todas');
  const [avaliando, setAvaliando] = useState<Solicitacao | null>(null);

  const todas = solicitacoes.data ?? [];
  const abaAtual = ABAS_CLIENTE.find((a) => a.chave === aba) ?? ABAS_CLIENTE[0];
  const lista = filtrar(todas, abaAtual.status);
  const emAndamento = todas.filter((s) =>
    ['PENDENTE', 'EM_ANALISE', 'EM_NEGOCIACAO', 'ACEITA'].includes(s.status),
  ).length;
  const concluidas = todas.filter((s) => s.status === 'CONCLUIDA').length;

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <FlatList
        data={lista}
        keyExtractor={(s) => String(s.id)}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={solicitacoes.isRefetching}
            onRefresh={() => {
              solicitacoes.refetch();
            }}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <View>
              <Text variant="title" accessibilityRole="header">
                Minhas solicitações
              </Text>
              <Text variant="caption">Área do cliente · {usuario?.nome}</Text>
            </View>
            <View style={styles.resumo}>
              <Resumo valor={emAndamento} rotulo="em andamento" cor={colors.primarySoft} />
              <Resumo
                valor={concluidas}
                rotulo={concluidas === 1 ? 'concluída' : 'concluídas'}
                cor={colors.successSoft}
              />
              <Resumo valor={todas.length} rotulo="no total" cor={colors.warningSoft} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {ABAS_CLIENTE.map((a) => (
                <Chip
                  key={a.chave}
                  testID={`aba-${a.chave}`}
                  rotulo={`${a.rotulo} ${filtrar(todas, a.status).length}`}
                  variante="suave"
                  selecionado={aba === a.chave}
                  onPress={() => setAba(a.chave)}
                />
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <SolicitacaoCard
            solicitacao={item}
            quem="CLIENTE"
            onPress={() => router.push(`/cliente/solicitacao/${item.id}`)}
            onAvaliar={
              item.status === 'CONCLUIDA' && !item.avaliada ? () => setAvaliando(item) : undefined
            }
          />
        )}
        ListEmptyComponent={
          solicitacoes.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
          ) : solicitacoes.isError ? (
            <Card>
              <EmptyState
                titulo="Não foi possível carregar"
                descricao={mensagemDeErro(solicitacoes.error)}
                icone="wifi-off"
                acao="Tentar de novo"
                onAcao={() => solicitacoes.refetch()}
              />
            </Card>
          ) : (
            <Card>
              <EmptyState
                titulo={todas.length === 0 ? 'Nenhuma solicitação ainda' : 'Nada nesta aba'}
                descricao={
                  todas.length === 0
                    ? 'Encontre uma empresa e peça um orçamento. Ele aparece aqui.'
                    : 'Suas solicitações com este status aparecem aqui.'
                }
                icone="file-text"
                acao={todas.length === 0 ? 'Buscar empresas' : undefined}
                onAcao={() => router.navigate('/cliente/buscar')}
              />
            </Card>
          )
        }
      />
      <FormAvaliacao solicitacao={avaliando} onFechar={() => setAvaliando(null)} />
    </SafeAreaView>
  );
}

function Resumo({ valor, rotulo, cor }: { valor: number; rotulo: string; cor: string }) {
  return (
    <View style={[styles.resumoCard, { backgroundColor: cor }]}>
      <Text style={styles.resumoValor}>{valor}</Text>
      <Text variant="caption">{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  lista: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl },
  cabecalho: { gap: spacing.lg, marginBottom: spacing.xs },
  resumo: { flexDirection: 'row', gap: spacing.sm },
  resumoCard: { flex: 1, padding: spacing.md, borderRadius: radii.md, gap: spacing.xxs },
  resumoValor: { fontFamily: fonts.serif, fontSize: 24, color: colors.text },
  chips: { gap: spacing.sm, paddingRight: spacing.xl },
});
