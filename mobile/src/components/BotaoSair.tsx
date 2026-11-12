import { useQueryClient } from '@tanstack/react-query';
import { Alert, Platform } from 'react-native';

import { useLogout } from '@/hooks/useAuth';

import { Button } from './Button';

export function BotaoSair() {
  const sair = useLogout();
  const queryClient = useQueryClient();
  const encerrar = async () => {
    await sair();
    queryClient.clear();
  };
  const confirmar = () => {
    if (Platform.OS === 'web') {
      // Alert não funciona na web (usada só para visualização)
      if (globalThis.confirm?.('Deseja mesmo sair?')) encerrar();
      return;
    }
    Alert.alert('Sair da conta', 'Deseja mesmo sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: encerrar,
      },
    ]);
  };
  return (
    <Button
      testID="sair"
      titulo="Sair"
      variante="contorno"
      icone="log-out"
      larguraTotal
      onPress={confirmar}
    />
  );
}
