import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { urlArquivo } from '@/api/arquivos';
import {
  Avatar,
  BarraBusca,
  CategoriaAtalho,
  EmpresaCard,
  EmptyState,
  SectionHeader,
  Text,
} from '@/components';
import { useCategorias } from '@/hooks/useAuth';
import { useRecomendadas } from '@/hooks/useBusca';
import { useSessionStore } from '@/store/session';
import { colors, fonts, radii, spacing } from '@/theme';

type ParamsBusca = { q?: string; categoriaId?: string };

function irParaBusca(params: ParamsBusca = {}) {
  router.navigate({ pathname: '/cliente/buscar', params });
}

/** Tela 5 do Figma: Início do cliente (ID06). */
export default function InicioClienteScreen() {
  const usuario = useSessionStore((s) => s.usuario);
  const categorias = useCategorias();
  const recomendadas = useRecomendadas();
  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';
  const casamento = categorias.data?.find((c) => c.nome === 'Decoração');

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.topo}>
          <View style={styles.flex}>
            <Text variant="overline" color={colors.textMuted}>
              Olá, {primeiroNome}
            </Text>
            <Text variant="display" accessibilityRole="header">
              Vamos celebrar?
            </Text>
          </View>
          {usuario ? (
            <Pressable
              onPress={() => router.navigate('/cliente/perfil')}
              accessibilityRole="button"
              accessibilityLabel="Meu perfil"
            >
              <Avatar nome={usuario.nome} uri={urlArquivo(usuario.fotoUrl)} tamanho={44} />
            </Pressable>
          ) : null}
        </View>

        <BarraBusca
          testID="busca-inicio"
          onBuscar={(q) => irParaBusca(q ? { q } : {})}
          onFiltros={() => irParaBusca()}
        />

        <View style={styles.secao}>
          <SectionHeader
            titulo="Explore por categoria"
            acao="Ver todas"
            onAcao={() => irParaBusca()}
          />
          {categorias.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categorias}
            >
              {(categorias.data ?? []).map((c, i) => (
                <CategoriaAtalho
                  key={c.id}
                  categoria={c}
                  indice={i}
                  onPress={() => irParaBusca({ categoriaId: String(c.id) })}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <Pressable
          testID="banner-casamento"
          onPress={() => irParaBusca({ q: 'casamento' })}
          accessibilityRole="button"
          accessibilityLabel="Planejando um casamento? Ver fornecedores"
          style={styles.banner}
        >
          <View style={styles.bannerCirculo} />
          <View style={styles.flex}>
            <Text style={styles.bannerOverline}>SUGESTÃO PARA VOCÊ</Text>
            <Text variant="subtitle" color={colors.onPrimary}>
              Planejando um casamento?
            </Text>
            <Text variant="caption" color="rgba(255,255,255,0.8)">
              Encontre {casamento ? 'decoração, buffet e fotografia' : 'fornecedores'} em um só
              lugar.
            </Text>
          </View>
          <View style={styles.bannerSeta}>
            <Feather name="arrow-right" size={18} color={colors.primary} />
          </View>
        </Pressable>

        <View style={styles.secao}>
          <SectionHeader
            titulo="Recomendados para você"
            acao="Ver mais"
            onAcao={() => irParaBusca()}
          />
          {recomendadas.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : recomendadas.isError ? (
            <EmptyState
              titulo="Não foi possível carregar"
              descricao="Verifique sua conexão e tente de novo."
              icone="wifi-off"
              acao="Tentar de novo"
              onAcao={() => recomendadas.refetch()}
            />
          ) : (recomendadas.data ?? []).length === 0 ? (
            <EmptyState
              titulo="Nenhuma recomendação ainda"
              descricao="Explore as categorias acima."
              icone="compass"
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recomendadas}
            >
              {(recomendadas.data ?? []).map((e) => (
                <EmpresaCard
                  key={e.id}
                  empresa={e}
                  variante="destaque"
                  onPress={() => router.push(`/cliente/empresa/${e.id}`)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxxl },
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: spacing.xxs },
  secao: { gap: spacing.md },
  categorias: { gap: spacing.sm, paddingRight: spacing.xl },
  recomendadas: { gap: spacing.md, paddingRight: spacing.xl, paddingBottom: spacing.xs },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  bannerCirculo: {
    position: 'absolute',
    right: -40,
    top: -30,
    width: 160,
    height: 160,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bannerOverline: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: '#F3C7C9',
  },
  bannerSeta: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
