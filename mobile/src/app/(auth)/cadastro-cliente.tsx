import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { mensagemDeErro } from '@/api/client';
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
import { TIPOS_EVENTO } from '@/constants/tiposEvento';
import { useCadastroCliente } from '@/hooks/useAuth';
import {
  CAMPOS_ETAPA1_CLIENTE,
  cadastroClienteSchema,
  type CadastroClienteForm,
} from '@/schemas/auth';
import { colors, spacing } from '@/theme';
import { aplicarErrosDoServidor } from '@/utils/errosDoServidor';
import { mascaraCpf, mascaraTelefone } from '@/utils/masks';

/** Tela 3 do Figma: cadastro de cliente (ID01) em 2 etapas. */
export default function CadastroClienteScreen() {
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const cadastro = useCadastroCliente();

  const { control, handleSubmit, trigger, setError, getValues, setValue } =
    useForm<CadastroClienteForm>({
      resolver: zodResolver(cadastroClienteSchema),
      mode: 'onTouched',
      defaultValues: {
        nome: '',
        email: '',
        telefone: '',
        cidade: '',
        senha: '',
        interesses: [],
        aceiteTermos: false,
        cpf: '',
        foto: null,
      },
    });

  async function continuar() {
    if (await trigger([...CAMPOS_ETAPA1_CLIENTE])) setEtapa(2);
  }

  const criarConta = handleSubmit(async (dados) => {
    const valores = cadastroClienteSchema.parse(dados);
    try {
      await cadastro.mutateAsync(valores);
      router.dismissTo({
        pathname: '/login',
        params: { tipo: 'CLIENTE', cadastro: 'ok', email: valores.email },
      });
    } catch (e) {
      const campos = aplicarErrosDoServidor(e, setError);
      if (campos.some((c) => (CAMPOS_ETAPA1_CLIENTE as readonly string[]).includes(c))) {
        setEtapa(1);
      }
    }
  });

  const erroGeral = cadastro.isError ? cadastro.error : null;

  return (
    <Screen
      topo={
        <>
          <Header
            titulo="Crie sua conta"
            subtitulo={`Cadastro de cliente · etapa ${etapa} de 2`}
            onVoltar={etapa === 2 ? () => setEtapa(1) : undefined}
          />
          <ProgressSteps total={2} atual={etapa} />
        </>
      }
      rodape={
        etapa === 1 ? (
          <Button
            testID="continuar-cadastro"
            titulo="Continuar cadastro"
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
      {etapa === 1 ? (
        <>
          <View style={styles.titulos}>
            <Text variant="title">Conte um pouco sobre você</Text>
            <Text variant="body" color={colors.textMuted}>
              Usaremos estes dados para deixar seus pedidos mais simples e seguros.
            </Text>
          </View>

          {erroGeral ? <Banner tipo="erro" mensagem={mensagemDeErro(erroGeral)} /> : null}

          <CampoTexto
            control={control}
            name="nome"
            testID="campo-nome"
            label="Nome completo"
            placeholder="Marina Alves"
            icone="user"
            autoCapitalize="words"
            autoComplete="name"
          />
          <CampoTexto
            control={control}
            name="email"
            testID="campo-email"
            label="E-mail"
            placeholder="marina.alves@email.com"
            icone="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <CampoTexto
            control={control}
            name="telefone"
            testID="campo-telefone"
            label="Celular"
            placeholder="(11) 98765-4321"
            icone="phone"
            keyboardType="phone-pad"
            mascara={mascaraTelefone}
          />
          <CampoTexto
            control={control}
            name="cidade"
            testID="campo-cidade"
            label="Cidade"
            placeholder="São Paulo, SP"
            icone="map-pin"
            autoCapitalize="words"
          />
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

          <Controller
            control={control}
            name="interesses"
            render={({ field }) => (
              <View style={styles.grupo}>
                <Text variant="label">O que você está planejando?</Text>
                <View style={styles.chips}>
                  {TIPOS_EVENTO.map((t) => {
                    const selecionado = field.value.includes(t.valor);
                    return (
                      <Chip
                        key={t.valor}
                        rotulo={t.rotulo}
                        variante="suave"
                        selecionado={selecionado}
                        onPress={() => {
                          const atuais = getValues('interesses');
                          setValue(
                            'interesses',
                            atuais.includes(t.valor)
                              ? atuais.filter((v) => v !== t.valor)
                              : [...atuais, t.valor],
                          );
                        }}
                      />
                    );
                  })}
                </View>
              </View>
            )}
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
      ) : (
        <>
          <View style={styles.titulos}>
            <Text variant="title">Só mais um detalhe</Text>
            <Text variant="body" color={colors.textMuted}>
              Estes dados são opcionais. Você pode preencher agora ou depois, no seu perfil.
            </Text>
          </View>

          {erroGeral ? <Banner tipo="erro" mensagem={mensagemDeErro(erroGeral)} /> : null}

          <Controller
            control={control}
            name="foto"
            render={({ field, fieldState }) => (
              <ImagePickerField
                titulo="Adicione uma foto"
                descricao="PNG ou JPG, até 5 MB (opcional)"
                formato="circulo"
                valor={field.value}
                onChange={field.onChange}
                erro={fieldState.error?.message}
              />
            )}
          />
          <CampoTexto
            control={control}
            name="cpf"
            testID="campo-cpf"
            label="CPF (opcional)"
            placeholder="000.000.000-00"
            icone="credit-card"
            keyboardType="number-pad"
            mascara={mascaraCpf}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titulos: { gap: spacing.sm },
  grupo: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
