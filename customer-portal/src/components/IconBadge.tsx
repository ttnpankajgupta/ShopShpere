import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../theme/tokens';

type IconBadgeVariant = 'accent' | 'success' | 'warning' | 'neutral';

interface IconBadgeProps {
  children: ReactNode;
  variant?: IconBadgeVariant;
  size?: 'md' | 'lg';
}

const variantStyles: Record<IconBadgeVariant, { bg: string; color: string }> = {
  accent: { bg: colors.accentLight, color: colors.accent },
  success: { bg: colors.successLight, color: colors.success },
  warning: { bg: '#fffbeb', color: colors.warning },
  neutral: { bg: colors.surfaceAlt, color: colors.muted },
};

export function IconBadge({ children, variant = 'accent', size = 'lg' }: IconBadgeProps) {
  const palette = variantStyles[variant];
  const dim = size === 'lg' ? 80 : 64;

  return (
    <View
      style={[
        styles.badge,
        { width: dim, height: dim, borderRadius: size === 'lg' ? radii.xl : radii.lg, backgroundColor: palette.bg },
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.emoji, { fontSize: size === 'lg' ? 32 : 24 }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
  emoji: { lineHeight: 36 },
});
