import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { TipoUsuario } from '@/api/types';
import { Button, OptionCard, Text } from '@/components';
import { HeroBoasVindas } from '@/components/HeroBoasVindas';
import { colors, spacing } from '@/theme';

/** Tela 1 do Figma: boas-vindas com a escolha do perfil. */
export default function BoasVindasScreen() {
  const [tipo, setTipo] = useState<TipoUsuario>('CLIENTE');

  return (
    <SafeAreaView style={styles.tela} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.rolagem} bounces={false}>
        <HeroBoasVindas />
        <View style={styles.conteudo}>
          <Text variant="label">Como você quer acessar?</Text>
          <OptionCard
            testID="opcao-cliente"
            titulo="Sou cliente"
            descricao="Quero encontrar empresas e pedir orçamentos."
            icone="gift"
            selecionado={tipo === 'CLIENTE'}
            onPress={() => setTipo('CLIENTE')}
          />
          <OptionCard
            testID="opcao-empresa"
            titulo="Sou empresa"
            descricao="Quero divulgar serviços e receber solicitações."
            icone="briefcase"
            selecionado={tipo === 'EMPRESA'}
            onPress={() => setTipo('EMPRESA')}
          />
        </View>
      </ScrollView>
      <View style={styles.rodape}>
        <Button
          testID="continuar"
          titulo={tipo === 'CLIENTE' ? 'Continuar como cliente' : 'Continuar como empresa'}
          icone="arrow-right"
          larguraTotal
          onPress={() => router.push({ pathname: '/login', params: { tipo } })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  rolagem: { flexGrow: 1 },
  conteudo: { padding: spacing.xl, gap: spacing.md },
  rodape: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, paddingTop: spacing.sm },
});
