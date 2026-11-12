import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { mensagemDeErro } from '@/api/client';
import type { Categoria } from '@/api/types';
import {
  Banner,
  Button,
  Checkbox,
  Chip,
  Header,
  ImagePickerField,
  ProgressSteps,
  Screen,
  Text,
} from '@/components';
import { CampoTexto } from '@/components/form/CampoTexto';
import { useCadastroEmpresa, useCategorias } from '@/hooks/useAuth';
import {
  CAMPOS_ETAPA1_EMPRESA,
  cadastroEmpresaSchema,
  type CadastroEmpresaForm,
} from '@/schemas/auth';
import { colors, spacing } from '@/theme';
import { aplicarErrosDoServidor } from '@/utils/errosDoServidor';
import { mascaraCnpj, mascaraTelefone } from '@/utils/masks';

/** Tela 4 do Figma: cadastro de empresa (ID02) em 2 etapas. */
export default function CadastroEmpresaScreen() {
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const cadastro = useCadastroEmpresa();
  const categorias = useCategorias();

  const { control, handleSubmit, trigger, setError, getValues, setValue } =
    useForm<CadastroEmpresaForm>({
      resolver: zodResolver(cadastroEmpresaSchema),
      mode: 'onTouched',
      defaultValues: {
        logo: null,
        nomeFantasia: '',
        cnpj: '',
        email: '',
        telefone: '',
        cidade: '',
        categoriaIds: [],
        descricao: '',
        endereco: '',
        senha: '',
        confirmarSenha: '',
        aceiteTermos: false,
      },
    });

  async function continuar() {
    if (await trigger([...CAMPOS_ETAPA1_EMPRESA])) setEtapa(2);
  }

  const criarConta = handleSubmit(async (dados) => {
    const { confirmarSenha: _ignorar, ...valores } = cadastroEmpresaSchema.parse(dados);
    try {
      await cadastro.mutateAsync(valores);
      router.dismissTo({
        pathname: '/login',
        params: { tipo: 'EMPRESA', cadastro: 'ok', email: valores.email },
      });
    } catch (e) {
      const campos = aplicarErrosDoServidor(e, setError);
      if (campos.some((c) => (CAMPOS_ETAPA1_EMPRESA as readonly string[]).includes(c))) {
        setEtapa(1);
      }
    }
  });

  return (
    <Screen
      topo={
        <>
          <Header
            titulo="Cadastre sua empresa"
            subtitulo={`Perfil profissional · etapa ${etapa} de 2`}
            onVoltar={etapa === 2 ? () => setEtapa(1) : undefined}
          />
          <ProgressSteps total={2} atual={etapa} />
        </>
      }
      rodape={
        etapa === 1 ? (
          <Button
            testID="salvar-continuar"
            titulo="Salvar e continuar"
            icone="arrow-right"
            larguraTotal
            onPress={continuar}
          />
        ) : (
          <Button
            testID="criar-conta"
            titulo="Criar conta"
            icone="check"
            larguraTotal
            carregando={cadastro.isPending}
            onPress={criarConta}
          />
        )
      }
    >
      {cadastro.isError ? <Banner tipo="erro" mensagem={mensagemDeErro(cadastro.error)} /> : null}

      {etapa === 1 ? (
        <>
          <View style={styles.titulos}>
            <Text variant="title">Leve seu trabalho a novas celebrações</Text>
            <Text variant="body" color={colors.textMuted}>
              Crie um perfil confiável para receber pedidos de clientes da sua região.
            </Text>
          </View>

          <Controller
            control={control}
            name="logo"
            render={({ field, fieldState }) => (
              <ImagePickerField
                titulo="Adicione seu logotipo"
                descricao="PNG ou JPG, até 5 MB"
                valor={field.value}
                onChange={field.onChange}
                erro={fieldState.error?.message}
              />
            )}
          />
          <CampoTexto
            control={control}
            name="nomeFantasia"
            testID="campo-nome-fantasia"
            label="Nome fantasia"
            placeholder="Ateliê Aurora Eventos"
            icone="briefcase"
            autoCapitalize="words"
          />
          <CampoTexto
            control={control}
            name="cnpj"
            testID="campo-cnpj"
            label="CNPJ"
            placeholder="00.000.000/0000-00"
            icone="file-text"
            keyboardType="number-pad"
            mascara={mascaraCnpj}
          />
          <CampoTexto
            control={control}
            name="email"
            testID="campo-email"
            label="E-mail comercial"
            placeholder="contato@empresa.com.br"
            icone="mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.linha}>
            <View style={styles.metade}>
              <CampoTexto
                control={control}
                name="telefone"
                testID="campo-telefone"
                label="Telefone (WhatsApp)"
                placeholder="(11) 3456-7890"
                keyboardType="phone-pad"
                mascara={mascaraTelefone}
              />
            </View>
            <View style={styles.metade}>
              <CampoTexto
                control={control}
                name="cidade"
                testID="campo-cidade"
                label="Cidade"
                placeholder="São Paulo, SP"
                autoCapitalize="words"
              />
            </View>
          </View>

          <Controller
            control={control}
            name="categoriaIds"
            render={({ field, fieldState }) => (
              <View style={styles.grupo}>
                <Text variant="label">Principais categorias</Text>
                <SeletorCategorias
                  carregando={categorias.isLoading}
                  erro={categorias.isError}
                  onTentarDeNovo={() => categorias.refetch()}
                  categorias={categorias.data ?? []}
                  selecionadas={field.value}
                  onAlternar={(id) => {
                    const atuais = getValues('categoriaIds');
                    setValue(
                      'categoriaIds',
                      atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id],
                      { shouldValidate: !!fieldState.error, shouldTouch: true },
                    );
                  }}
                />
                {fieldState.error ? (
                  <Text variant="caption" color={colors.danger}>
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </View>
            )}
          />

          <CampoTexto
            control={control}
            name="descricao"
            label="Sobre a empresa"
            placeholder="Criamos experiências afetivas com flores, cenografia e gastronomia autoral."
            multiline
          />
        </>
      ) : (
        <>
          <View style={styles.titulos}>
            <Text variant="title">Crie seu acesso</Text>
            <Text variant="body" color={colors.textMuted}>
              Defina a senha da conta. O endereço é opcional e pode ser editado depois no perfil.
            </Text>
          </View>
          <CampoTexto
            control={control}
            name="senha"
            testID="campo-senha"
            label="Crie uma senha"
            placeholder="••••••••"
            icone="lock"
            senha
            autoCapitalize="none"
            dica="Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo."
          />
          <CampoTexto
            control={control}
            name="confirmarSenha"
            testID="campo-confirmar-senha"
            label="Confirme a senha"
            placeholder="••••••••"
            icone="lock"
            senha
            autoCapitalize="none"
          />
          <CampoTexto
            control={control}
            name="endereco"
            testID="campo-endereco"
            label="Endereço (opcional)"
            placeholder="Rua das Flores, 100 - Centro"
            icone="map-pin"
          />
          <Controller
            control={control}
            name="aceiteTermos"
            render={({ field, fieldState }) => (
              <Checkbox
                testID="aceite-termos"
                marcado={field.value}
                onChange={field.onChange}
                erro={fieldState.error?.message}
              >
                Li e aceito os Termos de Uso e a Política de Privacidade do SyncEvents.
              </Checkbox>
            )}
          />
        </>
      )}
    </Screen>
  );
}

function SeletorCategorias({
  carregando,
  erro,
  onTentarDeNovo,
  categorias,
  selecionadas,
  onAlternar,
}: {
  carregando: boolean;
  erro: boolean;
  onTentarDeNovo: () => void;
  categorias: Categoria[];
  selecionadas: number[];
  onAlternar: (id: number) => void;
}) {
  if (carregando) return <ActivityIndicator color={colors.primary} />;
  if (erro) {
    return (
      <View style={styles.erroCategorias}>
        <Text variant="caption" color={colors.danger}>
          Não foi possível carregar as categorias.
        </Text>
        <Button titulo="Tentar de novo" variante="texto" compacto onPress={onTentarDeNovo} />
      </View>
    );
  }
  return (
    <View style={styles.chips}>
      {categorias.map((c) => {
        const selecionada = selecionadas.includes(c.id);
        return (
          <Chip
            key={c.id}
            rotulo={c.nome}
            variante="suave"
            selecionado={selecionada}
            onPress={() => onAlternar(c.id)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  titulos: { gap: spacing.sm },
  grupo: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  linha: { flexDirection: 'row', gap: spacing.md },
  metade: { flex: 1 },
  erroCategorias: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
