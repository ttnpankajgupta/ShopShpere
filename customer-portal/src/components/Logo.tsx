import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, typography } from '../theme/tokens';

type LogoSize = 'sm' | 'md' | 'lg';
type LogoVariant = 'default' | 'light';

interface ShopSphereLogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { icon: 28, font: 18, radius: 8 },
  md: { icon: 32, font: 24, radius: 8 },
  lg: { icon: 40, font: 32, radius: 10 },
};

export function ShopSphereLogo({ size = 'md', variant = 'default', style }: ShopSphereLogoProps) {
  const dims = sizeMap[size];
  const isLight = variant === 'light';

  return (
    <View style={[styles.row, style]}>
      <View
        style={[
          styles.icon,
          {
            width: dims.icon,
            height: dims.icon,
            borderRadius: dims.radius,
          },
        ]}
      >
        <Text style={[styles.iconText, { fontSize: dims.icon * 0.45 }]}>S</Text>
      </View>
      <Text
        style={[
          styles.wordmark,
          { fontSize: dims.font },
          isLight && styles.wordmarkLight,
        ]}
      >
        Shop<Text style={[styles.accent, isLight && styles.accentLight]}>Sphere</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: colors.white, fontWeight: '700' },
  wordmark: { ...typography.heading, color: colors.navy },
  wordmarkLight: { color: colors.white },
  accent: { color: colors.accent },
  accentLight: { color: '#818cf8' },
});
