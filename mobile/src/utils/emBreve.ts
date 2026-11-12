import { Alert } from 'react-native';

/** Funções fora do MVP (login com Google, recuperar senha): visíveis, mas "Em breve". */
export function emBreve(funcao?: string) {
  Alert.alert('Em breve', `${funcao ?? 'Esta função'} estará disponível em uma próxima versão.`);
}
