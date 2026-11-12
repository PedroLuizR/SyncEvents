import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

export interface ScreenProps {
  children: ReactNode;
  /** Conteúdo fixo no topo (ex.: Header + barra de progresso). */
  topo?: ReactNode;
  /** Conteúdo fixo no rodapé (ex.: botão principal). */
  rodape?: ReactNode;
  rolavel?: boolean;
}

/** Estrutura padrão de tela: área segura, teclado, rolagem e rodapé fixo. */
export function Screen({ children, topo, rodape, rolavel = true }: ScreenProps) {
  return (
    <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {topo ? <View style={styles.topo}>{topo}</View> : null}
        {rolavel ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.conteudo}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.conteudo]}>{children}</View>
        )}
        {rodape ? <View style={styles.rodape}>{rodape}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  topo: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.md },
  conteudo: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl },
  rodape: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
});
