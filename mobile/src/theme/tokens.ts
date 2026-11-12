/**
 * Design tokens do SyncEvents.
 * Valores extraídos da imagem de visão geral do Figma (docs/design/00-visao-geral.png).
 * Nunca use cores, fontes ou espaçamentos fixos nos componentes: importe daqui.
 */
export const colors = {
  primary: '#5A1F3C',
  primaryPressed: '#47182F',
  primarySoft: '#F3E6EB',
  onPrimary: '#FFFFFF',

  background: '#F8F2EC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1E9E2',
  border: '#E8DDD4',
  borderStrong: '#CDBFB5',

  text: '#2B1B23',
  textMuted: '#7B6B71',
  textSubtle: '#A3959A',

  star: '#D9A035',
  starEmpty: '#E3D8D0',
  success: '#2F7D4F',
  successSoft: '#E3F1E8',
  warning: '#B7791F',
  warningSoft: '#FBEFD9',
  danger: '#B3261E',
  dangerSoft: '#F9E3E1',

  overlay: 'rgba(43, 27, 35, 0.45)',
  overlayLeve: 'rgba(255, 255, 255, 0.9)',
  transparent: 'transparent',
} as const;

/** Fundos suaves dos ícones de categoria (Início), em ordem. */
export const tonsCategoria = [
  '#FCEBDD',
  '#F1E3F0',
  '#FBE4E6',
  '#E3F1EC',
  '#E6ECF7',
  '#FFF3D6',
] as const;

export const fonts = {
  serif: 'PlayfairDisplay_700Bold',
  serifSemibold: 'PlayfairDisplay_600SemiBold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemibold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  display: 30,
} as const;

export const typography = {
  display: {
    fontFamily: fonts.serif,
    fontSize: fontSizes.display,
    lineHeight: 36,
    color: colors.text,
  },
  title: { fontFamily: fonts.serif, fontSize: fontSizes.xxl, lineHeight: 30, color: colors.text },
  subtitle: {
    fontFamily: fonts.serifSemibold,
    fontSize: fontSizes.xl,
    lineHeight: 26,
    color: colors.text,
  },
  body: { fontFamily: fonts.sans, fontSize: fontSizes.md, lineHeight: 21, color: colors.text },
  bodyStrong: {
    fontFamily: fonts.sansSemibold,
    fontSize: fontSizes.md,
    lineHeight: 21,
    color: colors.text,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.sm,
    lineHeight: 18,
    color: colors.textMuted,
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    lineHeight: 15,
    color: colors.textMuted,
  },
  overline: {
    fontFamily: fonts.sansSemibold,
    fontSize: fontSizes.xs,
    lineHeight: 15,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
    color: colors.primary,
  },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/** Área mínima de toque (acessibilidade). */
export const touchTarget = 48;

export const shadows = {
  card: {
    shadowColor: '#2B1B23',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;

export const theme = {
  colors,
  tonsCategoria,
  fonts,
  fontSizes,
  typography,
  spacing,
  radii,
  shadows,
  touchTarget,
};
export type Theme = typeof theme;
