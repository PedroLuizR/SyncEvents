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
import { Card, Chip, EmptyState, SolicitacaoCard, Text } from '@/components';
import { useMinhasSolicitacoes } from '@/hooks/useSolicitacoes';
import { colors, spacing } from '@/theme';
import { FILTROS_EMPRESA, filtrar } from '@/utils/solicitacao';

/** Solicitações recebidas pela empresa (ID10), com filtro por status. */
export default function SolicitacoesEmpresaScreen() {
  const solicitacoes = useMinhasSolicitacoes();
  const [filtro, setFiltro] = useState('todas');
  const todas = solicitacoes.data ?? [];
  const atual = FILTROS_EMPRESA.find((f) => f.chave === filtro) ?? FILTROS_EMPRESA[0];
  const lista = filtrar(todas, atual.status);

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
            <Text variant="title" accessibilityRole="header">
              Solicitações
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {FILTROS_EMPRESA.map((f) => (
                <Chip
                  key={f.chave}
                  testID={`filtro-${f.chave}`}
                  rotulo={`${f.rotulo} ${filtrar(todas, f.status).length}`}
                  variante="suave"
                  selecionado={filtro === f.chave}
                  onPress={() => setFiltro(f.chave)}
                />
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <SolicitacaoCard
            solicitacao={item}
            quem="EMPRESA"
            onPress={() => router.push(`/empresa/solicitacao/${item.id}`)}
            onResponder={
              item.status === 'PENDENTE' || item.status === 'EM_ANALISE'
                ? () =>
                    router.push({
                      pathname: '/empresa/solicitacao/[id]',
                      params: { id: String(item.id), proposta: '1' },
                    })
                : undefined
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
                titulo={todas.length === 0 ? 'Nenhuma solicitação ainda' : 'Nada com este status'}
                descricao="Quando um cliente pedir orçamento, ele aparece aqui."
                icone="inbox"
              />
            </Card>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  lista: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl },
  cabecalho: { gap: spacing.md, marginBottom: spacing.xs },
  chips: { gap: spacing.sm, paddingRight: spacing.xl },
});
