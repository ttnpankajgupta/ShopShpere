import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ShopSphereLogo } from '../../../components';
import { useResponsive } from '../../../hooks/useResponsive';
import { AuthScreenLayout } from '../../../layout/AuthScreenLayout';
import { colors, spacing, typography } from '../../../theme/tokens';

const STEPS = ['Verifying token', 'Loading profile', 'Syncing cart'];

export function SessionRestorationScreen() {
  const { isMobileLayout } = useResponsive();

  return (
    <AuthScreenLayout scroll={false}>
      <View style={styles.root}>
        <ShopSphereLogo size={isMobileLayout ? 'sm' : 'md'} />
        <View style={styles.center}>
          <View style={styles.iconWrap}>
            <View style={styles.iconBox}>
              <Text style={styles.iconGlyph}>👤</Text>
            </View>
            <ActivityIndicator style={styles.spinnerRing} size="large" color={colors.accent} />
          </View>
          <Text style={styles.title}>Restoring your session…</Text>
          <Text style={styles.subtitle}>Securely reconnecting to your account</Text>
          <View style={styles.steps}>
            {STEPS.map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <ActivityIndicator size="small" color={colors.mutedLight} />
                <Text style={styles.stepText}>{step}</Text>
                {index < STEPS.length - 1 ? <Text style={styles.stepDot}>·</Text> : null}
              </View>
            ))}
          </View>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 400 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  iconWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: { fontSize: 32 },
  spinnerRing: { position: 'absolute' },
  title: { ...typography.body, fontWeight: '500', color: colors.navy, fontSize: 16 },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: -spacing.sm },
  steps: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepText: { fontSize: 12, color: colors.mutedLight },
  stepDot: { marginLeft: 4, color: colors.mutedLight, opacity: 0.3 },
});
