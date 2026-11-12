import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { TabBar } from '@/components/TabBar';
import { colors } from '@/theme';

export interface AbaConfig {
  nome: string;
  rotulo: string;
  icone: ComponentProps<typeof Feather>['name'];
}

/** Navegador de abas do Expo Router usando a TabBar do design system. */
export function AbasDoApp({ abas }: { abas: AbaConfig[] }) {
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
      tabBar={({ state, navigateToTab }) => {
        const ativa = state.routes[state.index]?.name;
        return (
          <TabBar
            ativa={ativa}
            itens={abas.map((a) => ({ chave: a.nome, rotulo: a.rotulo, icone: a.icone }))}
            onSelecionar={(nome) => {
              const rota = state.routes.find((r) => r.name === nome);
              if (rota) navigateToTab(rota.key);
            }}
          />
        );
      }}
    >
      {abas.map((a) => (
        <Tabs.Screen key={a.nome} name={a.nome} options={{ title: a.rotulo }} />
      ))}
    </Tabs>
  );
}
