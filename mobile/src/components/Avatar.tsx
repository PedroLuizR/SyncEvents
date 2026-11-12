import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { colors, fonts, radii } from '@/theme';

import { Text } from './Text';

export interface AvatarProps {
  nome: string;
  uri?: string | null;
  tamanho?: number;
  /** "circulo" para pessoas, "quadrado" para logos de empresa. */
  formato?: 'circulo' | 'quadrado';
}

/** Iniciais do nome: "Ateliê Aurora" → "AA". */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export function Avatar({ nome, uri, tamanho = 40, formato = 'circulo' }: AvatarProps) {
  const raio = formato === 'circulo' ? radii.pill : radii.md;
  const base = { width: tamanho, height: tamanho, borderRadius: raio };
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, base]}
        contentFit="cover"
        accessibilityLabel={nome}
      />
    );
  }
  return (
    <View style={[styles.base, styles.fallback, base]} accessibilityLabel={nome}>
      <Text style={[styles.texto, { fontSize: tamanho * 0.38 }]}>{iniciais(nome)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', backgroundColor: colors.surfaceMuted },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  texto: { fontFamily: fonts.serif, color: colors.onPrimary },
});
