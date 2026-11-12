import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { urlArquivo } from '@/api/arquivos';
import { mensagemDeErro } from '@/api/client';
import type { EmpresaPerfil } from '@/api/types';
import {
  Avatar,
  Banner,
  Button,
  Chip,
  EmptyState,
  FotosEditaveis,
  Header,
  Screen,
  SectionHeader,
  Text,
} from '@/components';
import { CampoTexto } from '@/components/form/CampoTexto';
import { useCategorias } from '@/hooks/useAuth';
import {
  useAtualizarEmpresa,
  useEnviarImagemEmpresa,
  useMinhaEmpresa,
  useRemoverFotoPortfolio,
} from '@/hooks/useEmpresa';
import { perfilEmpresaSchema, type PerfilEmpresaForm } from '@/schemas/empresa';
import { colors, fonts, radii, spacing } from '@/theme';
import { confirmar } from '@/utils/confirmar';
import { aplicarErrosDoServidor } from '@/utils/errosDoServidor';
import { escolherImagem } from '@/utils/escolherImagem';
import { mascaraCnpj, mascaraTelefone } from '@/utils/masks';

const MAX_PORTFOLIO = 12;

/** Editar perfil da empresa (ID04): logo, capa, dados, categorias e portfólio. */
export default function EditarPerfilEmpresaScreen() {
  const perfil = useMinhaEmpresa();
  if (perfil.isLoading) {
    return (
      <Screen topo={<Header titulo="Editar perfil" />}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }
  if (!perfil.data) {
    return (
      <Screen topo={<Header titulo="Editar perfil" />}>
        <EmptyState
          titulo="Não foi possível carregar"
          descricao={mensagemDeErro(perfil.error)}
          icone="alert-circle"
          acao="Tentar de novo"
          onAcao={() => perfil.refetch()}
        />
      </Screen>
    );
  }
  return <Formulario perfil={perfil.data} />;
}

function Formulario({ perfil }: { perfil: EmpresaPerfil }) {
  const categorias = useCategorias();
  const atualizar = useAtualizarEmpresa();
  const enviarImagem = useEnviarImagemEmpresa();
  const removerFoto = useRemoverFotoPortfolio();
  const [enviando, setEnviando] = useState<'logo' | 'capa' | 'portfolio' | null>(null);

  const { control, handleSubmit, setError, getValues, setValue } = useForm<PerfilEmpresaForm>({
    resolver: zodResolver(perfilEmpresaSchema),
    defaultValues: {
      nomeFantasia: perfil.nomeFantasia,
      telefone: mascaraTelefone(perfil.telefone),
      cidade: perfil.cidade,
      endereco: perfil.endereco ?? '',
      descricao: perfil.descricao ?? '',
      categoriaIds: perfil.categorias.map((c) => c.id),
    },
  });

  async function trocarImagem(tipo: 'logo' | 'capa' | 'portfolio') {
    const arquivo = await escolherImagem(
      tipo === 'capa' ? [16, 9] : tipo === 'portfolio' ? [4, 3] : [1, 1],
    );
    if (!arquivo) return;
    setEnviando(tipo);
    try {
      await enviarImagem.mutateAsync({ tipo, arquivo });
    } finally {
      setEnviando(null);
    }
  }

  const salvar = handleSubmit(async (dados) => {
    try {
      await atualizar.mutateAsync({
        ...dados,
        endereco: dados.endereco.trim() || undefined,
        descricao: dados.descricao.trim() || undefined,
      });
      router.back();
    } catch (e) {
      aplicarErrosDoServidor(e, setError);
    }
  });

  const erroImagem = enviarImagem.error ?? removerFoto.error;

  return (
    <Screen
      topo={<Header titulo="Editar perfil" subtitulo={perfil.nomeFantasia} />}
      rodape={
        <Button
          testID="salvar-perfil"
          titulo="Salvar alterações"
          icone="check"
          larguraTotal
          carregando={atualizar.isPending}
          onPress={salvar}
        />
      }
    >
      {atualizar.isError ? <Banner tipo="erro" mensagem={mensagemDeErro(atualizar.error)} /> : null}
      {erroImagem ? <Banner tipo="erro" mensagem={mensagemDeErro(erroImagem)} /> : null}

      {/* Capa e logo: enviadas na hora */}
      <View>
        <Pressable
          testID="trocar-capa"
          onPress={() => trocarImagem('capa')}
          accessibilityRole="button"
          accessibilityLabel="Trocar foto de capa"
          style={styles.capa}
        >
          {perfil.capaUrl ? (
            <Image
              source={{ uri: urlArquivo(perfil.capaUrl) }}
              style={styles.capaImagem}
              contentFit="cover"
            />
          ) : null}
          <View style={styles.capaAcao}>
            {enviando === 'capa' ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.capaTexto}>
                {perfil.capaUrl ? 'Trocar capa' : 'Adicionar capa'}
              </Text>
            )}
          </View>
        </Pressable>
        <Pressable
          testID="trocar-logo"
          onPress={() => trocarImagem('logo')}
          accessibilityRole="button"
          accessibilityLabel="Trocar logo"
          style={styles.logo}
        >
          <Avatar
            nome={perfil.nomeFantasia}
            uri={urlArquivo(perfil.logoUrl)}
            tamanho={72}
            formato="quadrado"
          />
          <View style={styles.logoBadge}>
            {enviando === 'logo' ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.logoBadgeTexto}>Trocar</Text>
            )}
          </View>
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.xl, gap: spacing.lg }}>
        <SectionHeader titulo="Dados da empresa" />
        <CampoTexto
          control={control}
          name="nomeFantasia"
          testID="campo-nome-fantasia"
          label="Nome fantasia"
          icone="briefcase"
        />
        <View style={styles.somenteLeitura}>
          <Text variant="caption">CNPJ: {mascaraCnpj(perfil.cnpj)}</Text>
          <Text variant="caption">E-mail de acesso: {perfil.email}</Text>
          <Text variant="caption">E-mail e CNPJ não podem ser alterados.</Text>
        </View>
        <CampoTexto
          control={control}
          name="telefone"
          testID="campo-telefone"
          label="Telefone (WhatsApp)"
          icone="message-circle"
          keyboardType="phone-pad"
          mascara={mascaraTelefone}
        />
        <CampoTexto
          control={control}
          name="cidade"
          testID="campo-cidade"
          label="Cidade"
          icone="map-pin"
          placeholder="São Paulo, SP"
        />
        <CampoTexto
          control={control}
          name="endereco"
          testID="campo-endereco"
          label="Endereço (opcional)"
          icone="home"
          placeholder="Rua das Flores, 100 - Centro"
        />
        <CampoTexto
          control={control}
          name="descricao"
          testID="campo-descricao"
          label="Sobre a empresa"
          multiline
          placeholder="Conte o que torna seu trabalho especial."
        />

        <Controller
          control={control}
          name="categoriaIds"
          render={({ field, fieldState }) => (
            <View style={{ gap: spacing.sm }}>
              <Text variant="label">Principais categorias</Text>
              <View style={styles.chips}>
                {(categorias.data ?? []).map((c) => (
                  <Chip
                    key={c.id}
                    rotulo={c.nome}
                    variante="suave"
                    selecionado={field.value.includes(c.id)}
                    onPress={() => {
                      const atuais = getValues('categoriaIds');
                      setValue(
                        'categoriaIds',
                        atuais.includes(c.id)
                          ? atuais.filter((x) => x !== c.id)
                          : [...atuais, c.id],
                        { shouldValidate: !!fieldState.error },
                      );
                    }}
                  />
                ))}
              </View>
              {fieldState.error ? (
                <Text variant="caption" color={colors.danger}>
                  {fieldState.error.message}
                </Text>
              ) : null}
            </View>
          )}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionHeader titulo="Portfólio" />
        <Text variant="caption">As fotos são salvas assim que você adiciona ou remove.</Text>
        <FotosEditaveis
          titulo="Fotos dos seus eventos"
          fotos={perfil.portfolio.map((f) => ({
            chave: String(f.id),
            uri: urlArquivo(f.url) ?? f.url,
          }))}
          maximo={MAX_PORTFOLIO}
          carregando={enviando === 'portfolio'}
          onAdicionar={() => trocarImagem('portfolio')}
          onRemover={(chave) =>
            confirmar({
              titulo: 'Remover foto',
              mensagem: 'A foto será removida do seu portfólio.',
              acao: 'Remover',
              onConfirmar: () => removerFoto.mutate(Number(chave)),
            })
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  capa: {
    height: 140,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  capaImagem: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  capaAcao: {
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.overlay,
    minHeight: 32,
    justifyContent: 'center',
  },
  capaTexto: { fontFamily: fonts.sansSemibold, fontSize: 12, color: colors.onPrimary },
  logo: {
    position: 'absolute',
    left: spacing.lg,
    bottom: -36,
    borderRadius: radii.md + 4,
    borderWidth: 4,
    borderColor: colors.background,
  },
  logoBadge: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  logoBadgeTexto: { fontFamily: fonts.sansSemibold, fontSize: 11, color: colors.primary },
  somenteLeitura: {
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
