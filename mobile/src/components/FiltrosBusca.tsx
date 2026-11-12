import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { OrdenacaoBusca } from '@/api/types';
import { colors, radii, spacing } from '@/theme';

import { Button } from './Button';
import { Chip } from './Chip';
import { Text } from './Text';
import { TextInput } from './TextInput';

export const ORDENACOES: { valor: OrdenacaoBusca; rotulo: string }[] = [
  { valor: 'relevancia', rotulo: 'Mais relevantes' },
  { valor: 'nota', rotulo: 'Melhor avaliadas' },
  { valor: 'preco', rotulo: 'Menor preço' },
];

export interface ValoresFiltro {
  cidade: string;
  ordenar: OrdenacaoBusca;
}

/** Folha inferior com cidade e ordenação. */
export function FiltrosBusca({
  visivel,
  inicial,
  minhaCidade,
  onAplicar,
  onFechar,
}: {
  visivel: boolean;
  inicial: ValoresFiltro;
  minhaCidade?: string;
  onAplicar: (valores: ValoresFiltro) => void;
  onFechar: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [cidade, setCidade] = useState(inicial.cidade);
  const [ordenar, setOrdenar] = useState<OrdenacaoBusca>(inicial.ordenar);

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={styles.fundo} onPress={onFechar} accessibilityLabel="Fechar filtros" />
      <View style={[styles.folha, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.alca} />
        <Text variant="subtitle">Filtros</Text>

        <View style={styles.grupo}>
          <TextInput
            testID="filtro-cidade"
            label="Cidade"
            placeholder="Todas as cidades"
            icone="map-pin"
            value={cidade}
            onChangeText={setCidade}
          />
          <View style={styles.chips}>
            {minhaCidade ? (
              <Chip
                rotulo={`Minha cidade (${minhaCidade.split(',')[0]})`}
                variante="suave"
                selecionado={cidade === minhaCidade}
                onPress={() => setCidade(cidade === minhaCidade ? '' : minhaCidade)}
              />
            ) : null}
            <Chip
              rotulo="Todas as cidades"
              variante="suave"
              selecionado={cidade === ''}
              onPress={() => setCidade('')}
            />
          </View>
        </View>

        <View style={styles.grupo}>
          <Text variant="label">Ordenar por</Text>
          <View style={styles.chips}>
            {ORDENACOES.map((o) => (
              <Chip
                key={o.valor}
                rotulo={o.rotulo}
                variante="suave"
                selecionado={ordenar === o.valor}
                onPress={() => setOrdenar(o.valor)}
              />
            ))}
          </View>
        </View>

        <View style={styles.botoes}>
          <Button
            titulo="Limpar"
            variante="contorno"
            style={styles.flex}
            onPress={() => onAplicar({ cidade: '', ordenar: 'relevancia' })}
          />
          <Button
            testID="aplicar-filtros"
            titulo="Aplicar"
            style={styles.flex}
            onPress={() => onAplicar({ cidade: cidade.trim(), ordenar })}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: colors.overlay },
  folha: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  alca: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
  },
  grupo: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  botoes: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
});
