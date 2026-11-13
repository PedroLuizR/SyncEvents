import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { urlArquivo } from '@/api/arquivos';
import { mensagemDeErro } from '@/api/client';
import type { EmpresaPublica, Servico } from '@/api/types';
import {
  AvaliacaoCard,
  Avatar,
  Button,
  Card,
  EmptyState,
  Header,
  Nota,
  SectionHeader,
  Text,
} from '@/components';
import { useAvaliacoesEmpresa } from '@/hooks/useAvaliacoes';
import { useEmpresaPublica } from '@/hooks/useBusca';
import { colors, fonts, radii, shadows, spacing, touchTarget } from '@/theme';
import { linkWhatsapp } from '@/utils/whatsapp';
import { formatarPrecoServico } from '@/utils/servico';

/** Tela 7 do Figma: perfil da empresa visto pelo cliente (ID07). */
export default function PerfilEmpresaPublicoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const perfil = useEmpresaPublica(Number(id));

  if (perfil.isLoading) {
    return (
      <SafeAreaView style={styles.tela}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxxl }} />
      </SafeAreaView>
    );
  }
  if (perfil.isError || !perfil.data) {
    return (
      <SafeAreaView style={[styles.tela, { padding: spacing.xl }]}>
        <Header titulo="Empresa" />
        <EmptyState
          titulo="Não foi possível abrir o perfil"
          descricao={mensagemDeErro(perfil.error)}
          icone="alert-circle"
          acao="Tentar de novo"
          onAcao={() => perfil.refetch()}
        />
      </SafeAreaView>
    );
  }
  return <Conteudo e={perfil.data} />;
}

function Conteudo({ e }: { e: EmpresaPublica }) {
  const insets = useSafeAreaInsets();
  const avaliacoes = useAvaliacoesEmpresa(e.id, 5);
  const lista = avaliacoes.data?.avaliacoes.conteudo ?? [];
  const compartilhar = () =>
    Share.share({
      message: `${e.nomeFantasia} no SyncEvents: ${e.categorias.map((c) => c.nome).join(', ')} em ${e.cidade}.`,
    });

  return (
    <View style={styles.tela}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.capa}>
          {e.capaUrl ? (
            <Image
              source={{ uri: urlArquivo(e.capaUrl) }}
              style={styles.capaImagem}
              contentFit="cover"
            />
          ) : null}
          <View style={[styles.acoesCapa, { top: insets.top + spacing.sm }]}>
            <BotaoRedondo icone="arrow-left" rotulo="Voltar" onPress={() => router.back()} />
            <BotaoRedondo icone="share-2" rotulo="Compartilhar" onPress={compartilhar} />
          </View>
        </View>

        <View style={styles.corpo}>
          <View style={styles.identidade}>
            <View style={styles.logo}>
              <Avatar
                nome={e.nomeFantasia}
                uri={urlArquivo(e.logoUrl)}
                tamanho={64}
                formato="quadrado"
              />
            </View>
            <View style={styles.flex}>
              <View style={styles.nomeLinha}>
                <Text variant="title" accessibilityRole="header" style={{ flexShrink: 1 }}>
                  {e.nomeFantasia}
                </Text>
                <Feather
                  name="check-circle"
                  size={16}
                  color={colors.success}
                  accessibilityLabel="Empresa verificada"
                />
              </View>
              <Text variant="caption">
                {e.categorias.map((c) => c.nome).join(', ')} · {e.cidade}
              </Text>
              <Nota nota={e.nota} total={e.totalAvaliacoes} />
            </View>
          </View>

          {e.descricao ? (
            <Text variant="body" color={colors.textMuted}>
              {e.descricao}
            </Text>
          ) : null}

          <View style={styles.indicadores}>
            <Indicador
              valor={String(e.indicadores.eventosRealizados)}
              rotulo={
                e.indicadores.eventosRealizados === 1 ? 'evento realizado' : 'eventos realizados'
              }
            />
            {e.indicadores.recomendam != null ? (
              <Indicador valor={`${e.indicadores.recomendam}%`} rotulo="recomendam" />
            ) : (
              <Indicador valor={String(e.indicadores.fotos)} rotulo="fotos no portfólio" />
            )}
            <Indicador
              valor={String(e.indicadores.servicos)}
              rotulo={e.indicadores.servicos === 1 ? 'serviço' : 'serviços'}
            />
          </View>

          <Button
            testID="whatsapp"
            titulo="Conversar no WhatsApp"
            variante="contorno"
            icone="message-circle"
            larguraTotal
            onPress={() => Linking.openURL(linkWhatsapp(e.telefoneWhatsapp, e.nomeFantasia))}
          />

          <View style={styles.secao}>
            <SectionHeader titulo="Portfólio" />
            {e.portfolio.length === 0 ? (
              <Text variant="caption">Esta empresa ainda não publicou fotos.</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.sm }}
              >
                {e.portfolio.map((f, i) => (
                  <Image
                    key={f.id}
                    source={{ uri: urlArquivo(f.url) }}
                    style={styles.fotoPortfolio}
                    contentFit="cover"
                    accessibilityLabel={`Foto ${i + 1} do portfólio`}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.secao}>
            <SectionHeader titulo="Serviços" />
            {e.servicos.length === 0 ? (
              <Text variant="caption">Nenhum serviço publicado ainda.</Text>
            ) : (
              <Card>
                <View style={{ gap: spacing.lg }}>
                  {e.servicos.map((s) => (
                    <LinhaServico key={s.id} servico={s} />
                  ))}
                </View>
              </Card>
            )}
          </View>

          <View style={styles.secao}>
            <SectionHeader
              titulo={e.totalAvaliacoes > 0 ? `Avaliações (${e.totalAvaliacoes})` : 'Avaliações'}
            />
            {lista.length === 0 ? (
              <Card>
                <EmptyState
                  titulo="Ainda sem avaliações"
                  descricao="As avaliações aparecem aqui depois dos primeiros eventos concluídos."
                  icone="star"
                />
              </Card>
            ) : (
              lista.map((a) => <AvaliacaoCard key={a.id} avaliacao={a} />)
            )}
          </View>

          {e.endereco ? (
            <View style={styles.endereco}>
              <Feather name="map-pin" size={16} color={colors.primary} />
              <Text variant="caption" style={styles.flex}>
                {e.endereco} · {e.cidade}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.rodape, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          testID="solicitar-orcamento"
          titulo="Solicitar orçamento"
          icone="file-text"
          larguraTotal
          onPress={() => router.push(`/cliente/orcamento/${e.id}`)}
        />
      </View>
    </View>
  );
}

function BotaoRedondo({
  icone,
  rotulo,
  onPress,
}: {
  icone: ComponentProps<typeof Feather>['name'];
  rotulo: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={styles.botaoRedondo}
    >
      <Feather name={icone} size={20} color={colors.text} />
    </Pressable>
  );
}

function Indicador({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={styles.indicador}>
      <Text style={styles.indicadorValor}>{valor}</Text>
      <Text variant="caption">{rotulo}</Text>
    </View>
  );
}

function LinhaServico({ servico }: { servico: Servico }) {
  return (
    <View style={styles.servico}>
      <View style={styles.servicoIcone}>
        <Feather
          name={servico.categoria.icone as ComponentProps<typeof Feather>['name']}
          size={18}
          color={colors.primary}
        />
      </View>
      <View style={styles.flex}>
        <Text variant="bodyStrong">{servico.nome}</Text>
        {servico.itensInclusos.length > 0 ? (
          <Text variant="caption" numberOfLines={1}>
            {servico.itensInclusos.join(' · ')}
          </Text>
        ) : servico.descricao ? (
          <Text variant="caption" numberOfLines={1}>
            {servico.descricao}
          </Text>
        ) : null}
      </View>
      <Text style={styles.preco}>{formatarPrecoServico(servico)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1, gap: spacing.xxs },
  capa: { height: 260, backgroundColor: colors.primary },
  capaImagem: { width: '100%', height: '100%' },
  acoesCapa: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoRedondo: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radii.pill,
    backgroundColor: colors.overlayLeve,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corpo: {
    marginTop: -24,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  identidade: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  logo: { borderRadius: radii.md, ...shadows.card },
  nomeLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  indicadores: { flexDirection: 'row', gap: spacing.sm },
  indicador: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    gap: spacing.xxs,
  },
  indicadorValor: { fontFamily: fonts.serif, fontSize: 20, color: colors.text },
  secao: { gap: spacing.md },
  fotoPortfolio: {
    width: 120,
    height: 120,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  servico: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  servicoIcone: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preco: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
    color: colors.primary,
    maxWidth: 110,
    textAlign: 'right',
  },
  endereco: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  rodape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
