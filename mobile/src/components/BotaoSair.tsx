import { useQueryClient } from '@tanstack/react-query';

import { useLogout } from '@/hooks/useAuth';
import { confirmar } from '@/utils/confirmar';

import { Button } from './Button';

export function BotaoSair() {
  const sair = useLogout();
  const queryClient = useQueryClient();
  return (
    <Button
      testID="sair"
      titulo="Sair"
      variante="contorno"
      icone="log-out"
      larguraTotal
      onPress={() =>
        confirmar({
          titulo: 'Sair da conta',
          mensagem: 'Deseja mesmo sair?',
          acao: 'Sair',
          onConfirmar: async () => {
            await sair();
            queryClient.clear();
          },
        })
      }
    />
  );
}
