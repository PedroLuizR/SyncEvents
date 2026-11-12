import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';

import { urlArquivo } from '@/api/arquivos';
import { mensagemDeErro } from '@/api/client';
import type { StatusSolicitacao } from '@/api/types';
import {
  Avatar,
  Banner,
  Button,
  Card,
  DadosDoEvento,
  EmptyState,
  FormProposta,
  Header,
  PropostaCard,
  Screen,
  SectionHeader,
  StatusSolicitacaoBadge,
  Text,
} from '@/components';
import { useEnviarProposta, useMudarStatus, useSolicitacao } from '@/hooks/useSolicitacoes';
import { colors, spacing } from '@/theme';
import { confirmar } from '@/utils/confirmar';
import { mascaraTelefone } from '@/utils/masks';
import { tempoRelativo } from '@/utils/solicitacao';
import { linkWhatsapp } from '@/utils/whatsapp';

/** Detalhe de uma solicitação recebida (ID10): mudar status e enviar proposta. */
export default function DetalheSolicitacaoEmpresaScreen() {
  const params = useLocalSearchParams<{ id: string; proposta?: string }>();
  const solicitacao = useSolicitacao(Number(params.id));
  const mudarStatus = useMudarStatus();
  const enviarProposta = useEnviarProposta();
  const [formAberto, setFormAberto] = useState(params.proposta === '1');

  if (solicitacao.isLoading) {
    return (
      <Screen topo={<Header titulo="Solicitação" />}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }
  const s = solicitacao.data;
  if (!s) {
    return (
      <Screen topo={<Header titulo="Solicitação" />}>
        <EmptyState
          titulo="Não foi possível carregar"
          descricao={mensagemDeErro(solicitacao.error)}
          icone="alert-circle"
          acao="Tentar de novo"
          onAcao={() => solicitacao.refetch()}
        />
      </Screen>
    );
  }

  const podePropor = ['PENDENTE', 'EM_ANALISE', 'EM_NEGOCIACAO'].includes(s.status);
  const propostaAberta = s.propostas.find((p) => p.status === 'ENVIADA');

  const mudar = (status: StatusSolicitacao, titulo: string, mensagem: string, acao: string) =>
    confirmar({
      titulo,
      mensagem,
      acao,
      onConfirmar: () => mudarStatus.mutate({ id: s.id, status }),
    });

  const acoes = (
    <View style={{ gap: spacing.sm }}>
      {podePropor && !propostaAberta ? (
        <Button
          testID="abrir-proposta"
          titulo="Enviar proposta"
          icone="send"
          larguraTotal
          onPress={() => setFormAberto(true)}
        />
      ) : null}
      {s.status === 'PENDENTE' ? (
        <Button
          testID="marcar-analise"
          titulo="Marcar como em análise"
          variante="secundario"
          larguraTotal
          carregando={mudarStatus.isPending}
          onPress={() => mudarStatus.mutate({ id: s.id, status: 'EM_ANALISE' })}
        />
      ) : null}
      {s.status === 'ACEITA' ? (
        <Button
          testID="marcar-concluida"
          titulo="Marcar evento como concluído"
          icone="check-circle"
          larguraTotal
          carregando={mudarStatus.isPending}
          onPress={() =>
            mudar(
              'CONCLUIDA',
              'Concluir evento',
              'Confirme que o evento já aconteceu. O cliente poderá avaliar sua empresa.',
              'Concluir',
            )
          }
        />
      ) : null}
      {podePropor ? (
        <Button
          testID="recusar-solicitacao"
          titulo="Recusar solicitação"
          variante="texto"
          larguraTotal
          onPress={() =>
            mudar(
              'RECUSADA',
              'Recusar solicitação',
              'O cliente será avisado de que você não pode atender este pedido.',
              'Recusar',
            )
          }
        />
      ) : null}
    </View>
  );

  const erro = mudarStatus.error;

  return (
    <Screen
      topo={<Header titulo="Solicitação" subtitulo={`Recebida ${tempoRelativo(s.criadoEm)}`} />}
    >
      {erro ? <Banner tipo="erro" mensagem={mensagemDeErro(erro)} /> : null}

      <Card>
        <View style={{ gap: spacing.md }}>
          <View style={styles.cliente}>
            <Avatar nome={s.cliente.nome} uri={urlArquivo(s.cliente.fotoUrl)} tamanho={48} />
            <View style={{ flex: 1, gap: spacing.xxs }}>
              <Text variant="bodyStrong">{s.cliente.nome}</Text>
              <Text variant="caption">{s.cliente.cidade}</Text>
            </View>
            <StatusSolicitacaoBadge status={s.status} quem="EMPRESA" />
          </View>
          <View style={{ gap: spacing.xxs }}>
            <Text variant="caption">
              {mascaraTelefone(s.cliente.telefone)} · {s.cliente.email}
            </Text>
          </View>
          {s.conversaId ? (
            <Button
              testID="abrir-conversa"
              titulo="Abrir conversa"
              icone="message-circle"
              compacto
              onPress={() => router.push(`/chat/${s.conversaId}`)}
            />
          ) : null}
          <Button
            titulo="Chamar no WhatsApp"
            variante="contorno"
            icone="message-circle"
            compacto
            onPress={() => Linking.openURL(linkWhatsapp(s.cliente.telefone))}
          />
        </View>
      </Card>

      {propostaAberta ? (
        <Banner tipo="info" mensagem="Proposta enviada. Aguardando a resposta do cliente." />
      ) : null}
      {s.status === 'ACEITA' ? (
        <Banner tipo="sucesso" mensagem="O cliente aceitou sua proposta!" />
      ) : null}

      {acoes}

      {s.propostas.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader titulo="Propostas" />
          {[...s.propostas].reverse().map((p) => (
            <PropostaCard
              key={p.id}
              proposta={p}
              titulo={p.status === 'ENVIADA' ? 'Proposta atual' : 'Proposta'}
            />
          ))}
        </View>
      ) : null}

      <DadosDoEvento s={s} />

      <FormProposta
        key={String(formAberto)}
        visivel={formAberto && podePropor && !propostaAberta}
        onFechar={() => setFormAberto(false)}
        enviando={enviarProposta.isPending}
        erro={enviarProposta.error ? mensagemDeErro(enviarProposta.error) : undefined}
        onEnviar={async (dados) => {
          try {
            await enviarProposta.mutateAsync({ id: s.id, ...dados });
            setFormAberto(false);
          } catch {
            // a mensagem aparece no formulário
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cliente: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
