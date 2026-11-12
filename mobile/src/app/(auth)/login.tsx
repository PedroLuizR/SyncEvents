import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { mensagemDeErro } from '@/api/client';
import type { TipoUsuario } from '@/api/types';
import { Banner, Button, Header, Screen, SegmentedControl, Text } from '@/components';
import { CampoTexto } from '@/components/form/CampoTexto';
import { useLogin } from '@/hooks/useAuth';
import { loginSchema, type LoginForm } from '@/schemas/auth';
import { colors, fonts, spacing } from '@/theme';
import { emBreve } from '@/utils/emBreve';

/** Tela 2 do Figma: login (ID03). */
export default function LoginScreen() {
  const params = useLocalSearchParams<{ tipo?: string; cadastro?: string; email?: string }>();
  // A aba vem do parâmetro (boas-vindas / volta do cadastro) até o usuário trocar manualmente.
  const [tipoEscolhido, setTipo] = useState<TipoUsuario | null>(null);
  const tipo: TipoUsuario = tipoEscolhido ?? (params.tipo === 'EMPRESA' ? 'EMPRESA' : 'CLIENTE');
  const login = useLogin();

  const { control, handleSubmit, setValue } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: params.email ?? '', senha: '' },
  });

  // Ao voltar do cadastro (dismissTo), a tela já montada recebe o e-mail cadastrado.
  useEffect(() => {
    if (params.email) setValue('login', params.email);
  }, [params.email, setValue]);

  const entrar = handleSubmit((dados) => login.mutate({ ...dados, tipo }));

  const trocarTipo = (novo: TipoUsuario) => {
    setTipo(novo);
    login.reset();
  };

  const irParaCadastro = () =>
    router.push(tipo === 'CLIENTE' ? '/cadastro-cliente' : '/cadastro-empresa');

  return (
    <Screen
      topo={
        <Header
          titulo="Acesse sua conta"
          subtitulo="Bem-vindo de volta ao SyncEvents"
          onVoltar={router.canGoBack() ? () => router.back() : () => router.replace('/')}
        />
      }
    >
      <SegmentedControl
        opcoes={[
          { valor: 'CLIENTE', rotulo: 'Cliente' },
          { valor: 'EMPRESA', rotulo: 'Empresa' },
        ]}
        valor={tipo}
        onChange={trocarTipo}
      />

      <View style={styles.titulos}>
        <Text variant="display">
          {tipo === 'CLIENTE'
            ? 'Sua próxima celebração está por aqui.'
            : 'Seus próximos clientes estão por aqui.'}
        </Text>
        <Text variant="body" color={colors.textMuted}>
          {tipo === 'CLIENTE'
            ? 'Entre para acompanhar conversas, propostas e seus fornecedores favoritos.'
            : 'Entre para responder solicitações, enviar propostas e gerenciar seus serviços.'}
        </Text>
      </View>

      {params.cadastro === 'ok' && !login.isError ? (
        <Banner tipo="sucesso" mensagem="Cadastro realizado! Entre com seu e-mail e senha." />
      ) : null}
      {login.isError ? <Banner tipo="erro" mensagem={mensagemDeErro(login.error)} /> : null}

      <CampoTexto
        control={control}
        name="login"
        testID="campo-login"
        label={tipo === 'EMPRESA' ? 'E-mail ou CNPJ' : 'E-mail'}
        placeholder={tipo === 'EMPRESA' ? 'contato@empresa.com.br' : 'marina.alves@email.com'}
        icone="mail"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <View style={{ gap: spacing.xs }}>
        <CampoTexto
          control={control}
          name="senha"
          testID="campo-senha"
          label="Senha"
          placeholder="••••••••"
          icone="lock"
          senha
          autoCapitalize="none"
          autoComplete="password"
          onSubmitEditing={() => entrar()}
          returnKeyType="go"
        />
        <Pressable
          onPress={() => emBreve('A recuperação de senha')}
          accessibilityRole="button"
          hitSlop={12}
          style={styles.esqueci}
        >
          <Text style={styles.link}>Esqueci minha senha</Text>
        </Pressable>
      </View>

      <Button
        testID="entrar"
        titulo="Entrar"
        larguraTotal
        carregando={login.isPending}
        onPress={entrar}
      />

      <View style={styles.ou}>
        <View style={styles.linha} />
        <Text variant="caption">ou</Text>
        <View style={styles.linha} />
      </View>

      <Button
        titulo="Continuar com Google"
        variante="contorno"
        icone="globe"
        larguraTotal
        onPress={() => emBreve('O login com Google')}
      />

      <View style={styles.cadastro}>
        <Text variant="label">Ainda não tem conta?</Text>
        <Pressable onPress={irParaCadastro} accessibilityRole="link" hitSlop={12}>
          <Text style={styles.link}>Cadastre-se</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titulos: { gap: spacing.sm, marginTop: spacing.sm },
  esqueci: { alignSelf: 'flex-end', paddingVertical: spacing.xs },
  link: { fontFamily: fonts.sansSemibold, color: colors.primary },
  ou: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  linha: { flex: 1, height: 1, backgroundColor: colors.border },
  cadastro: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
