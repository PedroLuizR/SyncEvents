import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useBootstrapSessao } from '@/hooks/useBootstrapSessao';
import { AppProviders } from '@/providers/AppProviders';
import { useSessionStore } from '@/store/session';
import { colors, useAppFonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

function Navegacao() {
  const usuario = useSessionStore((s) => s.usuario);
  const tipo = usuario?.tipo;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Público: boas-vindas, login e cadastros */}
      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="catalogo" />
        <Stack.Screen name="servidor" />
      </Stack.Protected>

      {/* Área do cliente */}
      <Stack.Protected guard={tipo === 'CLIENTE'}>
        <Stack.Screen name="cliente" />
      </Stack.Protected>

      {/* Área da empresa */}
      <Stack.Protected guard={tipo === 'EMPRESA'}>
        <Stack.Screen name="empresa" />
      </Stack.Protected>

      {/* Compartilhado pelos dois perfis */}
      <Stack.Protected guard={!!usuario}>
        <Stack.Screen name="conversas" />
        <Stack.Screen name="chat/[conversaId]" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const fontesProntas = useAppFonts();
  const sessaoPronta = useSessionStore((s) => s.pronto);
  useBootstrapSessao();

  const pronto = fontesProntas && sessaoPronta;

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync();
  }, [pronto]);

  if (!pronto) return null;

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Navegacao />
    </AppProviders>
  );
}
