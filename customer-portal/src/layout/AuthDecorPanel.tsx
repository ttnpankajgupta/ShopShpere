import { StyleSheet, Text, View } from 'react-native';
import { ShopSphereLogo } from '../components';
import { colors, spacing } from '../theme/tokens';

const FEATURES = ['Free shipping', 'Easy returns', 'Secure payments', '24/7 support'];

export function AuthDecorPanel() {
  return (
    <View style={styles.panel}>
      <View>
        <ShopSphereLogo variant="light" size="sm" />
        <Text style={styles.tagline}>
          Shop millions of products from trusted sellers worldwide.
        </Text>
        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View style={styles.dot} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.copyright}>© 2026 ShopSphere Inc.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '30%',
    minWidth: 176,
    maxWidth: 280,
    backgroundColor: colors.navy,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  tagline: {
    marginTop: spacing.lg,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.4)',
  },
  features: { marginTop: spacing.lg, gap: spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  featureText: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  copyright: { fontSize: 9, color: 'rgba(255,255,255,0.2)' },
});
