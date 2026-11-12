import { StyleSheet, View } from 'react-native';

import { urlArquivo } from '@/api/arquivos';
import { Avatar, Card, EmptyState, Screen, Text } from '@/components';
import { useSessionStore } from '@/store/session';
import { spacing } from '@/theme';

/** Painel da empresa. Indicadores reais na Fase 4. */
export default function PainelEmpresaScreen() {
  const usuario = useSessionStore((s) => s.usuario);
  return (
    <Screen>
      <View style={styles.topo}>
        <View style={styles.flex}>
          <Text variant="overline">Painel da empresa</Text>
          <Text variant="display" accessibilityRole="header">
            Olá, {usuario?.nome}
          </Text>
        </View>
        {usuario ? (
          <Avatar
            nome={usuario.nome}
            uri={urlArquivo(usuario.fotoUrl)}
            tamanho={44}
            formato="quadrado"
          />
        ) : null}
      </View>
      <Card>
        <EmptyState
          titulo="Em breve"
          descricao="Visualizações, solicitações recebidas e taxa de resposta (Fase 4)."
          icone="bar-chart-2"
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: spacing.xs },
});
