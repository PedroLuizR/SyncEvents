import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ComponentProps, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { urlArquivo } from '@/api/arquivos';
import type { Solicitacao } from '@/api/types';
import { rotuloTipoEvento } from '@/constants/tiposEvento';
import { colors, radii, spacing } from '@/theme';
import { convidados, formatarDataEvento, formatarOrcamento } from '@/utils/solicitacao';

import { Card } from './Card';
import { SectionHeader } from './SectionHeader';
import { Text } from './Text';

/** Bloco com os dados do evento, usado no detalhe do cliente e da empresa. */
export function DadosDoEvento({ s, extra }: { s: Solicitacao; extra?: ReactNode }) {
  return (
    <View style={{ gap: spacing.md }}>
      <SectionHeader titulo="Sobre o evento" />
      <Card>
        <View style={{ gap: spacing.md }}>
          <Linha icone="gift" rotulo="Tipo de evento" valor={rotuloTipoEvento(s.tipoEvento)} />
          <Linha icone="calendar" rotulo="Data" valor={formatarDataEvento(s.dataEvento)} />
          <Linha icone="users" rotulo="Convidados" valor={convidados(s.qtdConvidados)} />
          <Linha icone="map-pin" rotulo="Local" valor={s.local} />
          <Linha
            icone="dollar-sign"
            rotulo="Faixa de orçamento"
            valor={formatarOrcamento(s.orcamentoMin, s.orcamentoMax)}
          />
          <Linha
            icone="briefcase"
            rotulo="Serviços desejados"
            valor={s.servicos.map((sv) => sv.nome).join(', ') || 'A combinar'}
          />
          {s.mensagem ? (
            <Linha icone="message-square" rotulo="Mensagem" valor={s.mensagem} />
          ) : null}
          {extra}
        </View>
      </Card>
      {s.anexos.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <Text variant="label">Inspirações</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm }}
          >
            {s.anexos.map((a, i) => (
              <Image
                key={a.id}
                source={{ uri: urlArquivo(a.url) }}
                style={styles.anexo}
                contentFit="cover"
                accessibilityLabel={`Inspiração ${i + 1}`}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export function Linha({
  icone,
  rotulo,
  valor,
}: {
  icone: ComponentProps<typeof Feather>['name'];
  rotulo: string;
  valor: string;
}) {
  return (
    <View style={styles.linha}>
      <Feather name={icone} size={16} color={colors.primary} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text variant="caption">{rotulo}</Text>
        <Text variant="body">{valor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  anexo: { width: 110, height: 110, borderRadius: radii.md, backgroundColor: colors.surfaceMuted },
});
