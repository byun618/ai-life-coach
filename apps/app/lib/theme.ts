export const theme = {
  color: {
    bgBase: '#0A0A0B',
    bgSurface: '#16171A',
    bgElevated: '#1F2124',
    border: '#2A2C30',
    textPrimary: '#F5F6F7',
    textSecondary: '#9CA0A8',
    textTertiary: '#5C6069',
    accent: '#3182F6',
    accentPressed: '#1B64DA',
    success: '#1CAF71',
    destructive: '#F04452',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  font: {
    display: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
    title: { fontSize: 20, fontWeight: '700' as const, lineHeight: 28 },
    headline: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
    body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    callout: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
    label: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
    caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  },
} as const

export type Theme = typeof theme
