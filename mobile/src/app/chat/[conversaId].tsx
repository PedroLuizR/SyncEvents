import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { urlArquivo } from '@/api/arquivos';
import { mensagemDeErro } from '@/api/client';
import type { Conversa, Mensagem } from '@/api/types';
import {
  Avatar,
  Banner,
  BolhaMensagem,
  EmptyState,
  StatusSolicitacaoBadge,
  Text,
} from '@/components';
import { rotuloTipoEvento } from '@/constants/tiposEvento';
import { useChat, useConversa } from '@/hooks/useChat';
import { useResponderProposta } from '@/hooks/useSolicitacoes';
import { useSessionStore } from '@/store/session';
import { colors, fonts, fontSizes, radii, spacing, touchTarget } from '@/theme';
import { mensagensParaLista, mesmoDia, rotuloDia, type PaginasChat } from '@/utils/chat';
import { confirmar } from '@/utils/confirmar';
import { convidados, formatarDataEvento } from '@/utils/solicitacao';

/** Tela 9 do Figma: conversa entre cliente e empresa (ID09). */
export default function ChatScreen() {
  const { conversaId } = useLocalSearchParams<{ conversaId: string }>();
  const id = Number(conversaId);
  const conversa = useConversa(id);

  if (conversa.isLoading) {
    return (
      <SafeAreaView style={styles.tela}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxxl }} />
      </SafeAreaView>
    );
  }
  if (!conversa.data) {
    return (
      <SafeAreaView style={[styles.tela, { padding: spacing.xl }]}>
        <EmptyState
          titulo="Não foi possível abrir a conversa"
          descricao={mensagemDeErro(conversa.error)}
          icone="message-circle"
          acao="Voltar"
          onAcao={() => router.back()}
        />
      </SafeAreaView>
    );
  }
  return <Chat conversa={conversa.data} />;
}

function Chat({ conversa }: { conversa: Conversa }) {
  const usuario = useSessionStore((s) => s.usuario);
  const cliente = usuario?.tipo === 'CLIENTE';
  const { historico, conectado, enviar, enviando, erroEnvio } = useChat(conversa.id);
  const responder = useResponderProposta();
  const [texto, setTexto] = useState('');

  const mensagens = mensagensParaLista(historico.data as PaginasChat | undefined);
  const caminhoSolicitacao = `/${cliente ? 'cliente' : 'empresa'}/solicitacao/${conversa.solicitacaoId}`;

  const mandar = async () => {
    const t = texto.trim();
    if (!t) return;
    setTexto('');
    try {
      await enviar(t);
    } catch {
      setTexto(t); // devolve o texto para tentar de novo
    }
  };

  const responderProposta = (m: Mensagem, status: 'ACEITA' | 'RECUSADA') =>
    confirmar({
      titulo: status === 'ACEITA' ? 'Aceitar proposta' : 'Recusar proposta',
      mensagem:
        status === 'ACEITA'
          ? 'Ao aceitar, a empresa é avisada e seu pedido passa para "Proposta aceita".'
          : 'A empresa poderá enviar uma nova proposta.',
      acao: status === 'ACEITA' ? 'Aceitar' : 'Recusar',
      onConfirmar: () => m.proposta && responder.mutate({ propostaId: m.proposta.id, status }),
    });

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
      <View style={styles.cabecalho}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={12}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Avatar
          nome={conversa.contato.nome}
          uri={urlArquivo(conversa.contato.fotoUrl)}
          tamanho={40}
          formato={cliente ? 'quadrado' : 'circulo'}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.nomeLinha}>
            <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
              {conversa.contato.nome}
            </Text>
            {cliente ? <Feather name="check-circle" size={14} color={colors.success} /> : null}
          </View>
          <View style={styles.nomeLinha} testID="estado-conexao">
            <View
              style={[
                styles.ponto,
                { backgroundColor: conectado ? colors.success : colors.warning },
              ]}
            />
            <Text variant="caption">
              {conectado ? 'Conectado em tempo real' : 'Reconectando… atualizando a cada 5 s'}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        testID="contexto-orcamento"
        onPress={() => router.push(caminhoSolicitacao)}
        accessibilityRole="button"
        accessibilityLabel="Ver solicitação"
        style={styles.contexto}
      >
        <View style={styles.contextoIcone}>
          <Feather name="heart" size={18} color={colors.onPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {rotuloTipoEvento(conversa.tipoEvento)} · {formatarDataEvento(conversa.dataEvento)}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {convidados(conversa.qtdConvidados)} · {conversa.local}
          </Text>
        </View>
        <StatusSolicitacaoBadge status={conversa.status} quem={cliente ? 'CLIENTE' : 'EMPRESA'} />
      </Pressable>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {historico.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : (
          <FlatList
            testID="lista-mensagens"
            inverted
            data={mensagens}
            keyExtractor={(m) => String(m.id)}
            contentContainerStyle={styles.mensagens}
            onEndReachedThreshold={0.3}
            onEndReached={() => {
              if (historico.hasNextPage && !historico.isFetchingNextPage) historico.fetchNextPage();
            }}
            ListFooterComponent={
              historico.isFetchingNextPage ? (
                <ActivityIndicator color={colors.primary} />
              ) : undefined
            }
            ListEmptyComponent={
              <View style={styles.vazio}>
                <Text variant="caption" style={{ textAlign: 'center' }}>
                  Nenhuma mensagem ainda. Diga olá e combine os detalhes do evento!
                </Text>
              </View>
            }
            renderItem={({ item, index }) => {
              const anterior = mensagens[index + 1]; // lista invertida: o próximo índice é a mensagem anterior
              const novoDia = !anterior || !mesmoDia(anterior.enviadaEm, item.enviadaEm);
              return (
                <View>
                  {novoDia ? <Text style={styles.dia}>{rotuloDia(item.enviadaEm)}</Text> : null}
                  <BolhaMensagem
                    mensagem={item}
                    minha={item.remetenteUsuarioId === conversa.meuUsuarioId}
                    respondendo={responder.isPending}
                    onVerProposta={() => router.push(caminhoSolicitacao)}
                    onAceitar={cliente ? () => responderProposta(item, 'ACEITA') : undefined}
                    onRecusar={cliente ? () => responderProposta(item, 'RECUSADA') : undefined}
                  />
                </View>
              );
            }}
          />
        )}

        {erroEnvio || responder.error ? (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <Banner tipo="erro" mensagem={mensagemDeErro(erroEnvio ?? responder.error)} />
          </View>
        ) : null}

        <View style={styles.barra}>
          <TextInput
            testID="campo-mensagem"
            value={texto}
            onChangeText={setTexto}
            placeholder="Escreva uma mensagem…"
            placeholderTextColor={colors.textSubtle}
            multiline
            maxLength={2000}
            accessibilityLabel="Mensagem"
            style={styles.input}
          />
          <Pressable
            testID="enviar-mensagem"
            onPress={mandar}
            disabled={!texto.trim() || enviando}
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            style={[styles.enviar, (!texto.trim() || enviando) && { opacity: 0.5 }]}
          >
            {enviando ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Feather name="send" size={18} color={colors.onPrimary} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  nomeLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ponto: { width: 8, height: 8, borderRadius: radii.pill },
  contexto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primarySoft,
  },
  contextoIcone: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mensagens: { padding: spacing.lg, gap: spacing.xs, flexGrow: 1 },
  vazio: { flex: 1, justifyContent: 'center', padding: spacing.xxl, transform: [{ scaleY: -1 }] },
  dia: {
    alignSelf: 'center',
    marginVertical: spacing.md,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  barra: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: touchTarget - 4,
    maxHeight: 120,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceMuted,
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.text,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  enviar: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
