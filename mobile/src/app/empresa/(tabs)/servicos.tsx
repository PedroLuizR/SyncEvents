import { router } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mensagemDeErro } from '@/api/client';
import { Banner, Button, Card, EmptyState, ServicoCard, Text } from '@/components';
import { useExcluirServico, useMeusServicos } from '@/hooks/useServicos';
import { colors, spacing } from '@/theme';
import { confirmar } from '@/utils/confirmar';

/** Lista "Meus serviços" da empresa (ID05). */
export default function MeusServicosScreen() {
  const servicos = useMeusServicos();
  const excluir = useExcluirServico();

  const novo = () => router.push('/empresa/servico/novo');

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <FlatList
        data={servicos.data ?? []}
        keyExtractor={(s) => String(s.id)}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={servicos.isRefetching}
            onRefresh={() => {
              servicos.refetch();
            }}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <View style={styles.titulo}>
              <Text variant="title" accessibilityRole="header">
                Meus serviços
              </Text>
              {servicos.data && servicos.data.length > 0 ? (
                <Button testID="novo-servico" titulo="Novo" icone="plus" compacto onPress={novo} />
              ) : null}
            </View>
            {excluir.isError ? (
              <Banner tipo="erro" mensagem={mensagemDeErro(excluir.error)} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          servicos.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
          ) : servicos.isError ? (
            <Card>
              <EmptyState
                titulo="Não foi possível carregar"
                descricao={mensagemDeErro(servicos.error)}
                icone="alert-circle"
                acao="Tentar de novo"
                onAcao={() => servicos.refetch()}
              />
            </Card>
          ) : (
            <Card>
              <EmptyState
                titulo="Nenhum serviço ainda"
                descricao="Cadastre os serviços que você oferece para aparecer nas buscas dos clientes."
                icone="briefcase"
                acao="Cadastrar serviço"
                onAcao={novo}
              />
            </Card>
          )
        }
        renderItem={({ item }) => (
          <ServicoCard
            servico={item}
            onEditar={() => router.push(`/empresa/servico/${item.id}`)}
            onExcluir={() =>
              confirmar({
                titulo: 'Excluir serviço',
                mensagem: `"${item.nome}" será removido e deixará de aparecer para os clientes. Esta ação não pode ser desfeita.`,
                acao: 'Excluir',
                onConfirmar: () => excluir.mutate(item.id),
              })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  lista: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl },
  cabecalho: { gap: spacing.md, marginBottom: spacing.xs },
  titulo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
