import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Text } from './Text';

export interface SwitchCardProps {
  titulo: string;
  descricao: string;
  valor: boolean;
  onChange: (valor: boolean) => void;
  testID?: string;
}

/** Cartão com chave liga/desliga (ex.: "Serviço publicado"). Verde quando ligado, como no Figma. */
export function SwitchCard({ titulo, descricao, valor, onChange, testID }: SwitchCardProps) {
  return (
    <Pressable
      onPress={() => onChange(!valor)}
      accessibilityRole="switch"
      accessibilityState={{ checked: valor }}
      accessibilityLabel={titulo}
      testID={testID}
      style={[styles.card, valor ? styles.ligado : styles.desligado]}
    >
      <Feather
        name={valor ? 'check-circle' : 'eye-off'}
        size={20}
        color={valor ? colors.success : colors.textMuted}
      />
      <View style={styles.textos}>
        <Text variant="bodyStrong" color={valor ? colors.success : colors.text}>
          {titulo}
        </Text>
        <Text variant="caption">{descricao}</Text>
      </View>
      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{ false: colors.borderStrong, true: colors.success }}
        thumbColor={colors.surface}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  ligado: { backgroundColor: colors.successSoft, borderColor: colors.successSoft },
  desligado: { backgroundColor: colors.surface, borderColor: colors.border },
  textos: { flex: 1, gap: spacing.xxs },
});
