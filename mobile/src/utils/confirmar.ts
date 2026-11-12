import { Alert, Platform } from 'react-native';

/**
 * Pede confirmação antes de uma ação destrutiva. Na web (usada só para visualização)
 * usa o confirm do navegador, porque o Alert não funciona lá.
 */
export function confirmar(opcoes: {
  titulo: string;
  mensagem: string;
  acao: string;
  onConfirmar: () => void;
}) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${opcoes.titulo}\n\n${opcoes.mensagem}`)) opcoes.onConfirmar();
    return;
  }
  Alert.alert(opcoes.titulo, opcoes.mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: opcoes.acao, style: 'destructive', onPress: opcoes.onConfirmar },
  ]);
}
