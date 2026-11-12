import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { urlArquivo } from '@/api/arquivos';
import { mensagemDeErro } from '@/api/client';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Estatistica,
  SectionHeader,
  SolicitacaoCard,
  Text,
} from '@/components';
import { useDashboard, useMinhasSolicitacoes } from '@/hooks/useSolicitacoes';
import { useSessionStore } from '@/store/session';
import { colors, fonts, radii, spacing } from '@/theme';

const LIMITE_RECENTES = 3;

/** Tela 11 do Figma: painel da empresa com indicadores reais (ID10 / ID04). */
export default function PainelEmpresaScreen() {
  const usuario = useSessionStore((s) => s.usuario);
  const dashboard = useDashboard();
  const solicitacoes = useMinhasSolicitacoes();
  const d = dashboard.data;

  const recentes = (solicitacoes.data ?? [])
    .filter((s) => !['RECUSADA', 'CANCELADA', 'CONCLUIDA'].includes(s.status))
    .slice(0, LIMITE_RECENTES);

  const atualizar = () => {
    dashboard.refetch();
    solicitacoes.refetch();
  };

  const taxa = d?.taxaResposta;
  const avaliacaoTaxa =
    taxa == null
      ? 'Sem solicitações no período'
      : taxa >= 90
        ? 'Excelente · acima de 90%'
        : taxa >= 70
          ? 'Bom'
          : 'Responda mais rápido';

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.isRefetching || solicitacoes.isRefetching}
            onRefresh={atualizar}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.topo}>
          <View style={{ flex: 1, gap: spacing.xxs }}>
            <Text variant="overline">Área da empresa</Text>
            <Text variant="title" accessibilityRole="header">
              Olá, {usuario?.nome}
            </Text>
          </View>
          {usuario ? (
            <Pressable
              onPress={() => router.navigate('/empresa/perfil')}
              accessibilityRole="button"
              accessibilityLabel="Perfil da empresa"
            >
              <Avatar
                nome={usuario.nome}
                uri={urlArquivo(usuario.fotoUrl)}
                tamanho={44}
                formato="quadrado"
              />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.secaoTitulo}>
          <SectionHeader titulo="Visão geral" />
          <Text variant="caption">Últimos {d?.dias ?? 30} dias</Text>
        </View>

        {dashboard.isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : dashboard.isError || !d ? (
          <Card>
            <EmptyState
              titulo="Não foi possível carregar os indicadores"
              descricao={mensagemDeErro(dashboard.error)}
              icone="bar-chart-2"
              acao="Tentar de novo"
              onAcao={() => dashboard.refetch()}
            />
          </Card>
        ) : (
          <>
            <View style={styles.cards}>
              <Estatistica
                testID="indicador-visualizacoes"
                icone="eye"
                valor={d.visualizacoes.toLocaleString('pt-BR')}
                rotulo="visualizações do perfil"
                variacao={d.variacaoVisualizacoes}
              />
              <Estatistica
                testID="indicador-solicitacoes"
                icone="inbox"
                valor={String(d.solicitacoes)}
                rotulo="solicitações recebidas"
                variacao={d.variacaoSolicitacoes}
              />
            </View>
            <View
              style={styles.taxa}
              testID="indicador-taxa"
              accessible
              accessibilityLabel={`Taxa de resposta ${taxa ?? 0}%`}
            >
              <View style={styles.taxaIcone}>
                <Feather name="trending-up" size={20} color={colors.onPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.taxaRotulo}>TAXA DE RESPOSTA</Text>
                <Text style={styles.taxaValor}>{taxa == null ? '—' : `${taxa}%`}</Text>
              </View>
              <Text style={styles.taxaAvaliacao}>{avaliacaoTaxa}</Text>
            </View>
          </>
        )}

        <View style={{ gap: spacing.md }}>
          <SectionHeader
            titulo="Solicitações recebidas"
            acao="Ver todas"
            onAcao={() => router.navigate('/empresa/solicitacoes')}
          />
          {solicitacoes.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : recentes.length === 0 ? (
            <Card>
              <EmptyState
                titulo="Nenhuma solicitação em aberto"
                descricao="Quando um cliente pedir orçamento, ele aparece aqui."
                icone="inbox"
              />
            </Card>
          ) : (
            recentes.map((s) => (
              <SolicitacaoCard
                key={s.id}
                solicitacao={s}
                quem="EMPRESA"
                onPress={() => router.push(`/empresa/solicitacao/${s.id}`)}
                onResponder={
                  s.status === 'PENDENTE' || s.status === 'EM_ANALISE'
                    ? () =>
                        router.push({
                          pathname: '/empresa/solicitacao/[id]',
                          params: { id: String(s.id), proposta: '1' },
                        })
                    : undefined
                }
              />
            ))
          )}
        </View>

        <View style={styles.atalho}>
          <View style={styles.atalhoIcone}>
            <Feather name="briefcase" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">Gerenciar serviços</Text>
            <Text variant="caption">
              {d
                ? `${d.servicosAtivos} ${d.servicosAtivos === 1 ? 'ativo' : 'ativos'} · ${d.servicosRascunho} ${d.servicosRascunho === 1 ? 'rascunho' : 'rascunhos'}`
                : '—'}
            </Text>
          </View>
          <Button
            titulo="Abrir"
            variante="contorno"
            compacto
            onPress={() => router.navigate('/empresa/servicos')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxxl },
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  secaoTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -spacing.sm,
  },
  cards: { flexDirection: 'row', gap: spacing.md },
  taxa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    marginTop: -spacing.sm,
  },
  taxaIcone: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taxaRotulo: {
    fontFamily: fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.75)',
  },
  taxaValor: { fontFamily: fonts.sansBold, fontSize: 24, color: colors.onPrimary },
  taxaAvaliacao: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: '#F3C7C9',
    maxWidth: 110,
    textAlign: 'right',
  },
  atalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
  },
  atalhoIcone: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
