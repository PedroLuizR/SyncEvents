import { View } from 'react-native';

import { Chip, Screen, Text } from '@/components';
import { BotaoSair } from '@/components/BotaoSair';
import { PerfilResumo } from '@/components/PerfilResumo';
import { rotuloTipoEvento } from '@/constants/tiposEvento';
import { useSessionStore } from '@/store/session';
import { spacing } from '@/theme';

export default function PerfilClienteScreen() {
  const usuario = useSessionStore((s) => s.usuario);
  if (!usuario) return null;
  return (
    <Screen>
      <Text variant="title" accessibilityRole="header">
        Meu perfil
      </Text>
      <PerfilResumo usuario={usuario} />
      {usuario.interesses && usuario.interesses.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <Text variant="label">Tipos de evento de interesse</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {usuario.interesses.map((i) => (
              <Chip key={i} rotulo={rotuloTipoEvento(i)} variante="suave" selecionado />
            ))}
          </View>
        </View>
      ) : null}
      <BotaoSair />
    </Screen>
  );
}
