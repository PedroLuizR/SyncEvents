import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { urlArquivo } from '@/api/arquivos';
import { mensagemDeErro } from '@/api/client';
import type { EmpresaPerfil } from '@/api/types';
import { Avatar, Button, Card, Chip, EmptyState, Screen, SectionHeader, Text } from '@/components';
import { BotaoSair } from '@/components/BotaoSair';
import { useMinhaEmpresa } from '@/hooks/useEmpresa';
import { colors, radii, spacing } from '@/theme';
import { mascaraCnpj, mascaraTelefone } from '@/utils/masks';

/** Perfil da própria empresa (ID04): visualização. A edição fica em /empresa/perfil-editar. */
export default function PerfilEmpresaScreen() {
  const perfil = useMinhaEmpresa();

  if (perfil.isLoading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }
  if (perfil.isError || !perfil.data) {
    return (
      <Screen>
        <EmptyState
          titulo="Não foi possível carregar"
          descricao={mensagemDeErro(perfil.error)}
          icone="alert-circle"
          acao="Tentar de novo"
          onAcao={() => perfil.refetch()}
        />
        <BotaoSair />
      </Screen>
    );
  }
  return <Conteudo e={perfil.data} />;
}

function Conteudo({ e }: { e: EmpresaPerfil }) {
  return (
    <Screen>
      <View>
        <View style={styles.capa}>
          {e.capaUrl ? (
            <Image
              source={{ uri: urlArquivo(e.capaUrl) }}
              style={styles.capaImagem}
              contentFit="cover"
            />
          ) : null}
        </View>
        <View style={styles.logo}>
          <Avatar
            nome={e.nomeFantasia}
            uri={urlArquivo(e.logoUrl)}
            tamanho={72}
            formato="quadrado"
          />
        </View>
      </View>

      <View style={{ gap: spacing.xs, marginTop: spacing.xxl }}>
        <Text variant="title" accessibilityRole="header">
          {e.nomeFantasia}
        </Text>
        <Text variant="label">
          {e.categorias.map((c) => c.nome).join(', ')} · {e.cidade}
        </Text>
      </View>

      <Button
        testID="editar-perfil"
        titulo="Editar perfil"
        icone="edit-2"
        variante="secundario"
        larguraTotal
        onPress={() => router.push('/empresa/perfil-editar')}
      />

      <Card>
        <View style={styles.codigo}>
          <View>
            <Text variant="label">Código da empresa</Text>
            <Text variant="caption">Compartilhe com sua equipe</Text>
          </View>
          <Text
            variant="title"
            color={colors.primary}
            accessibilityLabel={`Código ${e.codigo.split('').join(' ')}`}
          >
            {e.codigo}
          </Text>
        </View>
      </Card>

      <Card>
        <View style={{ gap: spacing.md }}>
          <Linha icone="message-circle" rotulo="WhatsApp" valor={mascaraTelefone(e.telefone)} />
          <Linha icone="mail" rotulo="E-mail" valor={e.email} />
          <Linha icone="file-text" rotulo="CNPJ" valor={mascaraCnpj(e.cnpj)} />
          <Linha icone="map-pin" rotulo="Endereço" valor={e.endereco ?? 'Não informado'} />
        </View>
      </Card>

      {e.descricao ? (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader titulo="Sobre" />
          <Text variant="body" color={colors.textMuted}>
            {e.descricao}
          </Text>
        </View>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <SectionHeader titulo="Categorias" />
        <View style={styles.chips}>
          {e.categorias.map((c) => (
            <Chip key={c.id} rotulo={c.nome} variante="suave" selecionado />
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionHeader
          titulo="Portfólio"
          acao={e.portfolio.length > 0 ? 'Gerenciar' : undefined}
          onAcao={() => router.push('/empresa/perfil-editar')}
        />
        {e.portfolio.length === 0 ? (
          <Text variant="caption">
            Nenhuma foto ainda. Adicione fotos dos seus eventos em “Editar perfil”.
          </Text>
        ) : (
          <View style={styles.grade}>
            {e.portfolio.map((f) => (
              <Image
                key={f.id}
                source={{ uri: urlArquivo(f.url) }}
                style={styles.foto}
                contentFit="cover"
              />
            ))}
          </View>
        )}
      </View>

      <BotaoSair />
    </Screen>
  );
}

function Linha({
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
      <Feather name={icone} size={18} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text variant="caption">{rotulo}</Text>
        <Text variant="body">{valor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  capa: {
    height: 140,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  capaImagem: { width: '100%', height: '100%' },
  logo: {
    position: 'absolute',
    left: spacing.lg,
    bottom: -36,
    borderRadius: radii.md + 4,
    borderWidth: 4,
    borderColor: colors.background,
  },
  codigo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  foto: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
});
