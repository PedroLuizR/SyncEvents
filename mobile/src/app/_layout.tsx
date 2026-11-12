import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProviders } from '@/providers/AppProviders';
import { useSessionStore } from '@/store/session';
import { colors, useAppFonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontesProntas = useAppFonts();
  const sessaoCarregada = useSessionStore((s) => s.carregado);
  const restaurar = useSessionStore((s) => s.restaurar);

  useEffect(() => {
    restaurar();
  }, [restaurar]);

  const pronto = fontesProntas && sessaoCarregada;

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync();
  }, [pronto]);

  if (!pronto) return null;

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </AppProviders>
  );
}
