import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Banner, Button, Card, Header, Screen, Text, TextInput } from '@/components';
import { URL_PADRAO, normalizarUrl, useConfigStore } from '@/store/config';
import { colors, spacing } from '@/theme';

type Teste = { tipo: 'sucesso' | 'erro'; mensagem: string } | null;

/** Configuração do endereço do backend (útil para testar o APK no emulador ou num celular na rede). */
export default function ServidorScreen() {
  const atual = useConfigStore((s) => s.apiUrl);
  const salvar = useConfigStore((s) => s.salvar);
  const restaurarPadrao = useConfigStore((s) => s.restaurarPadrao);
  const [texto, setTexto] = useState(atual);
  const [erro, setErro] = useState<string | undefined>();
  const [teste, setTeste] = useState<Teste>(null);
  const [testando, setTestando] = useState(false);

  async function testar(): Promise<string | null> {
    const url = normalizarUrl(texto);
    if (!url) {
      setErro('Informe um endereço como 192.168.0.10:8080');
      return null;
    }
    setErro(undefined);
    setTestando(true);
    setTeste(null);
    try {
      const { data } = await axios.get(`${url}/actuator/health`, { timeout: 6000 });
      if (data?.status === 'UP') {
        setTeste({ tipo: 'sucesso', mensagem: `Servidor encontrado em ${url}` });
        return url;
      }
      setTeste({ tipo: 'erro', mensagem: 'O servidor respondeu, mas não está pronto.' });
    } catch {
      setTeste({
        tipo: 'erro',
        mensagem:
          'Não foi possível conectar. Confira o endereço, a porta e se o celular está na mesma rede.',
      });
    } finally {
      setTestando(false);
    }
    return null;
  }

  async function testarESalvar() {
    const url = await testar();
    if (url) {
      await salvar(url);
      setTexto(url);
      router.back();
    }
  }

  return (
    <Screen topo={<Header titulo="Servidor" subtitulo="Endereço do backend do SyncEvents" />}>
      <Card>
        <View style={{ gap: spacing.xs }}>
          <Text variant="label">Em uso agora</Text>
          <Text variant="bodyStrong" testID="servidor-atual">
            {atual}
          </Text>
        </View>
      </Card>

      <TextInput
        testID="campo-servidor"
        label="Novo endereço"
        placeholder="192.168.0.10:8080"
        icone="server"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        value={texto}
        onChangeText={(t) => {
          setTexto(t);
          setTeste(null);
        }}
        erro={erro}
      />

      {teste ? <Banner tipo={teste.tipo} mensagem={teste.mensagem} /> : null}

      <Button
        testID="salvar-servidor"
        titulo="Testar e salvar"
        icone="check"
        larguraTotal
        carregando={testando}
        onPress={testarESalvar}
      />
      <Button
        titulo="Só testar"
        variante="contorno"
        larguraTotal
        desabilitado={testando}
        onPress={() => {
          testar();
        }}
      />
      <Button
        titulo={`Voltar ao padrão (${URL_PADRAO})`}
        variante="texto"
        larguraTotal
        onPress={async () => {
          await restaurarPadrao();
          setTexto(URL_PADRAO);
          setTeste(null);
        }}
      />

      <View style={styles.dicas}>
        <Text variant="label">Dicas</Text>
        <Text variant="caption">• Emulador Android: http://10.0.2.2:8080</Text>
        <Text variant="caption">
          • Celular: use o IP do computador onde o backend roda (ex.: http://192.168.0.10:8080), na
          mesma rede Wi-Fi.
        </Text>
        <Text variant="caption">• O backend deve estar rodando (veja o README do projeto).</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dicas: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
});
