export const colors = {
  background: '#ffffff',
  surface: '#f8f8f9',
  surfaceAlt: '#f1f1f4',
  navy: '#0f172a',
  accent: '#4f46e5',
  accentHover: '#4338ca',
  accentLight: '#eef2ff',
  success: '#10b981',
  successLight: '#d1fae5',
  error: '#ef4444',
  errorLight: '#fef2f2',
  warning: '#f59e0b',
  border: '#e2e8f0',
  muted: '#64748b',
  mutedLight: '#94a3b8',
  white: '#ffffff',
} as const;

export const radii = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const },
  heading: { fontSize: 24, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  label: { fontSize: 14, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};
