import { StyleSheet, View } from 'react-native';

import { urlArquivo } from '@/api/arquivos';
import type { Usuario } from '@/api/types';
import { colors, spacing } from '@/theme';
import { mascaraTelefone } from '@/utils/masks';

import { Avatar } from './Avatar';
import { Card } from './Card';
import { Text } from './Text';

/** Cabeçalho do perfil com avatar/logo, nome e contatos. */
export function PerfilResumo({ usuario }: { usuario: Usuario }) {
  const empresa = usuario.tipo === 'EMPRESA';
  return (
    <Card>
      <View style={styles.linha}>
        <Avatar
          nome={usuario.nome}
          uri={urlArquivo(usuario.fotoUrl)}
          tamanho={64}
          formato={empresa ? 'quadrado' : 'circulo'}
        />
        <View style={styles.textos}>
          <Text variant="subtitle">{usuario.nome}</Text>
          <Text variant="caption">{usuario.email}</Text>
          <Text variant="caption">
            {mascaraTelefone(usuario.telefone)} · {usuario.cidade}
          </Text>
        </View>
      </View>
      {empresa && usuario.codigo ? (
        <View style={styles.codigo}>
          <Text variant="label">Código da empresa</Text>
          <Text
            variant="title"
            color={colors.primary}
            accessibilityLabel={`Código ${usuario.codigo.split('').join(' ')}`}
          >
            {usuario.codigo}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  textos: { flex: 1, gap: spacing.xxs },
  codigo: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
