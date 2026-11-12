import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const metricas = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/** Renderiza com React Query e área segura. */
export function renderTela(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  return render(
    <SafeAreaProvider initialMetrics={metricas}>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </SafeAreaProvider>,
  );
}

/** Erro no formato do axios com o corpo padrão da API. */
export function erroApi(status: number, mensagem: string, campos?: Record<string, string>) {
  return Object.assign(new Error(mensagem), {
    isAxiosError: true,
    response: { status, data: { status, erro: 'X', mensagem, campos } },
  });
}
