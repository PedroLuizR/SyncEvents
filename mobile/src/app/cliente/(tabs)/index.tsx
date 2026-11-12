import { StyleSheet, View } from 'react-native';

import { Avatar, Card, EmptyState, Screen, Text } from '@/components';
import { urlArquivo } from '@/api/arquivos';
import { useSessionStore } from '@/store/session';
import { spacing } from '@/theme';

/** Início do cliente. Conteúdo completo (categorias, banner, recomendados) na Fase 3. */
export default function InicioClienteScreen() {
  const usuario = useSessionStore((s) => s.usuario);
  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';
  return (
    <Screen>
      <View style={styles.topo}>
        <View style={styles.flex}>
          <Text variant="label">Olá, {primeiroNome}</Text>
          <Text variant="display" accessibilityRole="header">
            Vamos celebrar?
          </Text>
        </View>
        {usuario ? (
          <Avatar nome={usuario.nome} uri={urlArquivo(usuario.fotoUrl)} tamanho={44} />
        ) : null}
      </View>
      <Card>
        <EmptyState
          titulo="Em breve"
          descricao="Busca por categoria e empresas recomendadas para você (Fase 3)."
          icone="search"
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: spacing.xs },
});
