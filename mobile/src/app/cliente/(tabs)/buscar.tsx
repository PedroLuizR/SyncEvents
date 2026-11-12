import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { FiltrosBusca as Filtros } from '@/api/busca';
import { mensagemDeErro } from '@/api/client';
import type { OrdenacaoBusca } from '@/api/types';
import {
  BarraBusca,
  Card,
  Chip,
  EmpresaCard,
  EmptyState,
  FiltrosBusca,
  ORDENACOES,
  Text,
} from '@/components';
import { useCategorias } from '@/hooks/useAuth';
import { useBuscaEmpresas } from '@/hooks/useBusca';
import { useSessionStore } from '@/store/session';
import { colors, fonts, radii, spacing } from '@/theme';

type Params = { q?: string; categoriaId?: string; cidade?: string; ordenar?: string };

/**
 * Tela 6 do Figma: resultados de busca (ID06).
 * Os filtros ficam nos parâmetros da rota, então o Início pode abrir a busca já filtrada.
 */
export default function BuscarScreen() {
  const params = useLocalSearchParams<Params>();
  const usuario = useSessionStore((s) => s.usuario);
  const categorias = useCategorias();
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const filtros: Filtros = useMemo(
    () => ({
      q: params.q || undefined,
      categoriaId: params.categoriaId ? Number(params.categoriaId) : undefined,
      cidade: params.cidade || undefined,
      ordenar: (params.ordenar as OrdenacaoBusca) || undefined,
    }),
    [params.q, params.categoriaId, params.cidade, params.ordenar],
  );
  const busca = useBuscaEmpresas(filtros);

  const empresas = busca.data?.pages.flatMap((p) => p.conteudo) ?? [];
  const total = busca.data?.pages[0]?.total ?? 0;
  const ordenacao = ORDENACOES.find((o) => o.valor === (filtros.ordenar ?? 'relevancia'));
  const qtdFiltros = [
    filtros.categoriaId,
    filtros.cidade,
    filtros.ordenar && filtros.ordenar !== 'relevancia',
  ].filter(Boolean).length;

  const atualizar = (novos: Partial<Params>) => router.setParams({ ...params, ...novos });

  const cabecalho = (
    <View style={styles.cabecalho}>
      <View>
        <Text variant="title" accessibilityRole="header">
          Empresas
        </Text>
        <Text variant="caption" testID="contagem">
          {busca.isLoading
            ? 'Buscando...'
            : `${total} ${total === 1 ? 'resultado' : 'resultados'} ${
                filtros.cidade ? `em ${filtros.cidade}` : 'em todas as cidades'
              }`}
        </Text>
      </View>

      <BarraBusca
        key={params.q ?? ''}
        testID="busca"
        valorInicial={params.q ?? ''}
        placeholder="Buscar por empresa, serviço ou categoria"
        onBuscar={(q) => atualizar({ q })}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Pressable
          testID="abrir-filtros"
          onPress={() => setFiltrosAbertos(true)}
          accessibilityRole="button"
          accessibilityLabel={`Filtros${qtdFiltros ? `, ${qtdFiltros} ativos` : ''}`}
          style={styles.botaoFiltros}
        >
          <Feather name="sliders" size={14} color={colors.text} />
          <Text style={styles.botaoFiltrosTexto}>
            Filtros{qtdFiltros ? ` · ${qtdFiltros}` : ''}
          </Text>
        </Pressable>
        {(categorias.data ?? []).map((c) => {
          const ativa = filtros.categoriaId === c.id;
          return (
            <Chip
              key={c.id}
              rotulo={c.nome}
              variante="suave"
              selecionado={ativa}
              onPress={() => atualizar({ categoriaId: ativa ? '' : String(c.id) })}
            />
          );
        })}
      </ScrollView>

      {filtros.cidade ? (
        <View style={styles.chipsFixos}>
          <Chip
            rotulo={filtros.cidade}
            icone="x"
            selecionado
            onPress={() => atualizar({ cidade: '' })}
          />
        </View>
      ) : null}

      <View style={styles.ordem}>
        <Text variant="caption">Melhores opções primeiro</Text>
        <Pressable onPress={() => setFiltrosAbertos(true)} accessibilityRole="button" hitSlop={10}>
          <Text style={styles.ordemTexto}>{ordenacao?.rotulo} ▾</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <FlatList
        testID="lista-busca"
        data={empresas}
        keyExtractor={(e) => String(e.id)}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={cabecalho}
        renderItem={({ item }) => (
          <EmpresaCard empresa={item} onPress={() => router.push(`/cliente/empresa/${item.id}`)} />
        )}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (busca.hasNextPage && !busca.isFetchingNextPage) busca.fetchNextPage();
        }}
        ListEmptyComponent={
          busca.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
          ) : busca.isError ? (
            <Card>
              <EmptyState
                titulo="Não foi possível buscar"
                descricao={mensagemDeErro(busca.error)}
                icone="wifi-off"
                acao="Tentar de novo"
                onAcao={() => busca.refetch()}
              />
            </Card>
          ) : (
            <Card>
              <EmptyState
                titulo="Nenhuma empresa encontrada"
                descricao="Tente outra palavra, outra categoria ou remova os filtros."
                icone="search"
                acao={qtdFiltros || filtros.q ? 'Limpar filtros' : undefined}
                onAcao={() => router.setParams({ q: '', categoriaId: '', cidade: '', ordenar: '' })}
              />
            </Card>
          )
        }
        ListFooterComponent={
          busca.isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} />
          ) : empresas.length > 0 ? (
            <View style={styles.dica}>
              <Feather name="zap" size={16} color={colors.warning} />
              <Text variant="caption" style={{ flex: 1 }}>
                <Text style={styles.dicaTitulo}>Dica SyncEvents: </Text>
                compare portfólios e envie o mesmo briefing para mais de uma empresa.
              </Text>
            </View>
          ) : undefined
        }
      />
      <FiltrosBusca
        key={`${filtrosAbertos}-${filtros.cidade}-${filtros.ordenar}`}
        visivel={filtrosAbertos}
        inicial={{ cidade: filtros.cidade ?? '', ordenar: filtros.ordenar ?? 'relevancia' }}
        minhaCidade={usuario?.cidade}
        onFechar={() => setFiltrosAbertos(false)}
        onAplicar={(v) => {
          setFiltrosAbertos(false);
          atualizar({ cidade: v.cidade, ordenar: v.ordenar === 'relevancia' ? '' : v.ordenar });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  lista: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl },
  cabecalho: { gap: spacing.md, marginBottom: spacing.xs },
  chips: { gap: spacing.sm, alignItems: 'center', paddingRight: spacing.xl },
  chipsFixos: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  botaoFiltros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  botaoFiltrosTexto: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.text },
  ordem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ordemTexto: { fontFamily: fonts.sansSemibold, fontSize: 13, color: colors.primary },
  dica: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.warningSoft,
  },
  dicaTitulo: { fontFamily: fonts.sansSemibold, fontSize: 11, color: colors.text },
});
