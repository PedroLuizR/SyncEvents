import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, fontSizes, spacing, touchTarget } from '@/theme';

import { Text } from './Text';

export interface TabBarItem {
  chave: string;
  rotulo: string;
  icone: ComponentProps<typeof Feather>['name'];
}

export interface TabBarProps {
  itens: TabBarItem[];
  ativa: string;
  onSelecionar: (chave: string) => void;
}

/**
 * Barra de abas inferior estilizada. Componente de apresentação:
 * nas fases seguintes é ligado ao navegador de abas do Expo Router via prop `tabBar`.
 */
export function TabBar({ itens, ativa, onSelecionar }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.barra, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
    >
      {itens.map((item) => {
        const selecionada = item.chave === ativa;
        const cor = selecionada ? colors.primary : colors.textSubtle;
        return (
          <Pressable
            key={item.chave}
            testID={`tab-${item.chave}`}
            onPress={() => onSelecionar(item.chave)}
            accessibilityRole="tab"
            accessibilityState={{ selected: selecionada }}
            accessibilityLabel={item.rotulo}
            style={styles.item}
          >
            <Feather name={item.icone} size={22} color={cor} />
            <Text
              style={[
                styles.rotulo,
                { color: cor, fontFamily: selecionada ? fonts.sansSemibold : fonts.sansMedium },
              ]}
            >
              {item.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    minHeight: touchTarget,
  },
  rotulo: { fontSize: fontSizes.xs },
});
