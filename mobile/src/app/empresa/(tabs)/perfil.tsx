import { View } from 'react-native';

import { Chip, Screen, Text } from '@/components';
import { BotaoSair } from '@/components/BotaoSair';
import { PerfilResumo } from '@/components/PerfilResumo';
import { useSessionStore } from '@/store/session';
import { spacing } from '@/theme';

/** Perfil da empresa. Edição completa (logo, capa, portfólio, endereço) na Fase 2. */
export default function PerfilEmpresaScreen() {
  const usuario = useSessionStore((s) => s.usuario);
  if (!usuario) return null;
  return (
    <Screen>
      <Text variant="title" accessibilityRole="header">
        Perfil da empresa
      </Text>
      <PerfilResumo usuario={usuario} />
      {usuario.categorias && usuario.categorias.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <Text variant="label">Categorias</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {usuario.categorias.map((c) => (
              <Chip key={c.id} rotulo={c.nome} variante="suave" selecionado />
            ))}
          </View>
        </View>
      ) : null}
      <BotaoSair />
    </Screen>
  );
}
