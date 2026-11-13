import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { urlArquivo } from '@/api/arquivos';
import { mensagemDeErro } from '@/api/client';
import type { Solicitacao } from '@/api/types';
import {
  Avatar,
  Banner,
  Button,
  Card,
  DadosDoEvento,
  EmptyState,
  FormAvaliacao,
  Header,
  PropostaCard,
  Screen,
  SectionHeader,
  StatusSolicitacaoBadge,
  Text,
} from '@/components';
import {
  useCancelarSolicitacao,
  useResponderProposta,
  useSolicitacao,
} from '@/hooks/useSolicitacoes';
import { colors, spacing } from '@/theme';
import { confirmar } from '@/utils/confirmar';
import { tempoRelativo } from '@/utils/solicitacao';

const TEXTO_STATUS: Record<Solicitacao['status'], string> = {
  PENDENTE: 'A empresa ainda não abriu seu pedido.',
  EM_ANALISE: 'A empresa está analisando seu pedido.',
  EM_NEGOCIACAO: 'Você recebeu uma proposta. Aceite ou recuse abaixo.',
  ACEITA: 'Proposta aceita! Agora é só combinar os detalhes com a empresa.',
  CONCLUIDA: 'Evento concluído! Conte como foi avaliando a empresa.',
  RECUSADA: 'A empresa não pôde atender este pedido.',
  CANCELADA: 'Você cancelou esta solicitação.',
};

/** Detalhe da solicitação para o cliente: proposta (aceitar/recusar) e cancelamento. */
export default function DetalheSolicitacaoClienteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const solicitacao = useSolicitacao(Number(id));
  const responder = useResponderProposta();
  const cancelar = useCancelarSolicitacao();
  const [respondendo, setRespondendo] = useState<'aceitar' | 'recusar' | null>(null);
  const [avaliando, setAvaliando] = useState(false);

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

  const aberta = s.propostas.find((p) => p.status === 'ENVIADA');
  const anteriores = s.propostas.filter((p) => p.id !== aberta?.id).reverse();
  const podeCancelar = ['PENDENTE', 'EM_ANALISE', 'EM_NEGOCIACAO'].includes(s.status);

  const responderProposta = async (status: 'ACEITA' | 'RECUSADA') => {
    if (!aberta) return;
    setRespondendo(status === 'ACEITA' ? 'aceitar' : 'recusar');
    try {
      await responder.mutateAsync({ propostaId: aberta.id, status });
    } finally {
      setRespondendo(null);
    }
  };

  const erro = responder.error ?? cancelar.error;

  return (
    <Screen
      topo={<Header titulo="Solicitação" subtitulo={`Enviada ${tempoRelativo(s.criadoEm)}`} />}
      rodape={
        podeCancelar ? (
          <Button
            testID="cancelar-solicitacao"
            titulo="Cancelar solicitação"
            variante="contorno"
            larguraTotal
            carregando={cancelar.isPending}
            onPress={() =>
              confirmar({
                titulo: 'Cancelar solicitação',
                mensagem: `A empresa ${s.empresa.nomeFantasia} será avisada de que você desistiu deste pedido.`,
                acao: 'Cancelar pedido',
                onConfirmar: () => cancelar.mutate(s.id),
              })
            }
          />
        ) : undefined
      }
    >
      {erro ? <Banner tipo="erro" mensagem={mensagemDeErro(erro)} /> : null}

      <Card
        onPress={() => router.push(`/cliente/empresa/${s.empresa.id}`)}
        accessibilityLabel={`Ver perfil de ${s.empresa.nomeFantasia}`}
      >
        <View style={styles.empresa}>
          <Avatar
            nome={s.empresa.nomeFantasia}
            uri={urlArquivo(s.empresa.logoUrl)}
            tamanho={48}
            formato="quadrado"
          />
          <View style={{ flex: 1, gap: spacing.xxs }}>
            <Text variant="bodyStrong">{s.empresa.nomeFantasia}</Text>
            <Text variant="caption">{s.empresa.cidade}</Text>
          </View>
          <StatusSolicitacaoBadge status={s.status} quem="CLIENTE" />
        </View>
      </Card>

      {s.conversaId ? (
        <Button
          testID="abrir-conversa"
          titulo="Conversar com a empresa"
          variante="secundario"
          icone="message-circle"
          larguraTotal
          onPress={() => router.push(`/chat/${s.conversaId}`)}
        />
      ) : null}

      <Banner
        tipo={s.status === 'ACEITA' || s.status === 'CONCLUIDA' ? 'sucesso' : 'info'}
        mensagem={TEXTO_STATUS[s.status]}
      />

      {s.status === 'CONCLUIDA' ? (
        s.avaliada ? (
          <Banner tipo="sucesso" mensagem="Você já avaliou este evento. Obrigado!" />
        ) : (
          <Button
            testID="avaliar-empresa"
            titulo="Avaliar empresa"
            icone="star"
            larguraTotal
            onPress={() => setAvaliando(true)}
          />
        )
      ) : null}
      <FormAvaliacao solicitacao={avaliando ? s : null} onFechar={() => setAvaliando(false)} />

      {aberta ? (
        <PropostaCard
          proposta={aberta}
          titulo="Proposta da empresa"
          carregando={respondendo}
          onAceitar={() =>
            confirmar({
              titulo: 'Aceitar proposta',
              mensagem:
                'Ao aceitar, a empresa é avisada e seu pedido passa para "Proposta aceita".',
              acao: 'Aceitar',
              onConfirmar: () => responderProposta('ACEITA'),
            })
          }
          onRecusar={() =>
            confirmar({
              titulo: 'Recusar proposta',
              mensagem: 'A empresa poderá enviar uma nova proposta.',
              acao: 'Recusar',
              onConfirmar: () => responderProposta('RECUSADA'),
            })
          }
        />
      ) : null}

      {anteriores.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader titulo={aberta ? 'Propostas anteriores' : 'Propostas'} />
          {anteriores.map((p) => (
            <PropostaCard key={p.id} proposta={p} />
          ))}
        </View>
      ) : null}

      <DadosDoEvento s={s} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empresa: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
