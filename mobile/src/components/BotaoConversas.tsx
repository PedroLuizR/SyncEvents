import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useNaoLidas } from '@/hooks/useChat';
import { colors, fonts, radii, touchTarget } from '@/theme';

import { Text } from './Text';

/** Ícone de conversas com o número de mensagens não lidas. */
export function BotaoConversas() {
  const naoLidas = useNaoLidas();
  return (
    <Pressable
      testID="botao-conversas"
      onPress={() => router.push('/conversas')}
      accessibilityRole="button"
      accessibilityLabel={naoLidas > 0 ? `Conversas, ${naoLidas} não lidas` : 'Conversas'}
      style={styles.botao}
    >
      <Feather name="message-circle" size={20} color={colors.text} />
      {naoLidas > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeTexto}>{naoLidas > 99 ? '99+' : naoLidas}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: touchTarget - 4,
    height: touchTarget - 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTexto: { fontFamily: fonts.sansBold, fontSize: 10, color: colors.onPrimary },
});
