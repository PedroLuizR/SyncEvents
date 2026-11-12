import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { typography } from '@/theme';

export type TextVariant = keyof typeof typography;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

/** Texto com as variantes tipográficas do tema. */
export function Text({ variant = 'body', color, style, ...rest }: TextProps) {
  return <RNText style={[typography[variant], color ? { color } : null, style]} {...rest} />;
}
