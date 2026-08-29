import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LaunchScreenLayout } from '../../../layout/LaunchScreenLayout';
import { useResponsive } from '../../../hooks/useResponsive';
import { colors, radii, spacing, typography } from '../../../theme/tokens';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Launch'>;
type Phase = 'splash' | 'loading' | 'ready';

const PRODUCT_CARDS = [
  { label: 'New Arrivals', price: '$89', badge: 'NEW', emoji: '👟' },
  { label: 'Trending', price: '$124', badge: 'HOT', emoji: '👜' },
];

function LaunchLogoMark() {
  return (
    <View style={styles.logoWrap}>
      <View style={styles.logoGlow} />
      <View style={styles.logoBox}>
        <Text style={styles.logoLetter}>S</Text>
      </View>
    </View>
  );
}

export function LaunchScreen({ navigation }: Props) {
  const { isMobileLayout } = useResponsive();
  const [phase, setPhase] = useState<Phase>('splash');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('loading'), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'loading') return;

    let value = 0;
    const interval = setInterval(() => {
      value += Math.random() * 18 + 6;
      if (value >= 100) {
        value = 100;
        clearInterval(interval);
        setTimeout(() => setPhase('ready'), 400);
      }
      setProgress(value);
    }, 180);

    return () => clearInterval(interval);
  }, [phase]);

  const loadingMessage =
    progress < 40 ? 'Initialising…' : progress < 75 ? 'Loading catalogue…' : 'Almost ready…';

  if (phase === 'splash') {
    return (
      <LaunchScreenLayout>
        <View style={styles.centeredPhase}>
          <LaunchLogoMark />
          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>
              Shop<Text style={styles.brandAccent}>Sphere</Text>
            </Text>
            <Text style={styles.brandTagline}>Your world. Your store.</Text>
          </View>
        </View>
      </LaunchScreenLayout>
    );
  }

  if (phase === 'loading') {
    return (
      <LaunchScreenLayout>
        <View style={styles.centeredPhase}>
          <LaunchLogoMark />
          <View style={styles.loadingBlock}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.4)" />
              <Text style={styles.loadingText}>{loadingMessage}</Text>
            </View>
          </View>
        </View>
      </LaunchScreenLayout>
    );
  }

  return (
    <LaunchScreenLayout>
      <View style={styles.readyRoot}>
        <View style={styles.hero}>
          <View style={styles.heroPattern} />
          <View style={styles.heroGlowTop} />
          <View style={styles.heroGlowBottom} />
          <View style={[styles.cardsWrap, !isMobileLayout && styles.cardsWrapWide]}>
            <View style={styles.cardRow}>
              {PRODUCT_CARDS.map((card) => (
                <View key={card.label} style={styles.productCard}>
                  <View style={styles.productEmojiWrap}>
                    <Text style={styles.productEmoji}>{card.emoji}</Text>
                  </View>
                  <View style={styles.productBody}>
                    <Text style={styles.productBadge}>{card.badge}</Text>
                    <Text style={styles.productLabel}>{card.label}</Text>
                    <Text style={styles.productPrice}>{card.price}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.cartCard}>
              <Text style={styles.cartEmoji}>🛒</Text>
              <View style={styles.cartText}>
                <Text style={styles.cartLabel}>Your cart</Text>
                <Text style={styles.cartValue}>3 items · $312.00</Text>
              </View>
              <View style={styles.cartArrow}>
                <Text style={styles.cartArrowText}>›</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.bottomPanel, !isMobileLayout && styles.bottomPanelWide]}>
          <View style={[styles.bottomPanelInner, !isMobileLayout && styles.bottomPanelInnerWide]}>
            <View style={styles.headlineBlock}>
              <Text style={styles.headline}>
                Shop smarter,{'\n'}
                <Text style={styles.headlineAccent}>live better.</Text>
              </Text>
              <Text style={styles.headlineSub}>
                Millions of products. Trusted sellers.{'\n'}Fast delivery, easy returns.
              </Text>
            </View>

            <Pressable
              style={styles.primaryCta}
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="button"
            >
              <Text style={styles.primaryCtaText}>Create free account</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryCta}
              onPress={() => navigation.navigate('Login')}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryCtaText}>Sign in</Text>
            </Pressable>

            <Text style={styles.legal}>
              By continuing you agree to our <Text style={styles.legalLink}>Terms</Text> and{' '}
              <Text style={styles.legalLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </View>
      </View>
    </LaunchScreenLayout>
  );
}

const styles = StyleSheet.create({
  centeredPhase: {
    flex: 1,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  logoWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 34,
    backgroundColor: colors.accent,
    opacity: 0.2,
    transform: [{ scale: 1.25 }],
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: { color: colors.white, fontSize: 42, fontWeight: '700' },
  brandBlock: { alignItems: 'center' },
  brandTitle: { ...typography.title, color: colors.white, letterSpacing: -0.5 },
  brandAccent: { color: '#818cf8' },
  brandTagline: { marginTop: 4, fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 },
  loadingBlock: { width: 192, gap: spacing.lg, alignItems: 'center' },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  readyRoot: {
    flex: 1,
    backgroundColor: colors.navy,
    overflow: 'hidden',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    minHeight: 0,
  },
  heroPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    backgroundColor: colors.navy,
  },
  heroGlowTop: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(79,70,229,0.2)',
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(124,58,237,0.2)',
  },
  cardsWrap: { alignItems: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl, zIndex: 1 },
  cardsWrapWide: { width: '100%', maxWidth: 480 },
  cardRow: { flexDirection: 'row', gap: spacing.md },
  productCard: {
    width: 120,
    borderRadius: radii.xl,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  productEmojiWrap: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  productEmoji: { fontSize: 36 },
  productBody: { padding: 10 },
  productBadge: {
    alignSelf: 'flex-start',
    fontSize: 9,
    fontWeight: '600',
    color: colors.accent,
    backgroundColor: 'rgba(79,70,229,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  productLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  productPrice: { fontSize: 12, fontWeight: '700', color: colors.white, marginTop: 2 },
  cartCard: {
    width: 264,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: '#1e293b',
  },
  cartEmoji: { fontSize: 24 },
  cartText: { flex: 1 },
  cartLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  cartValue: { fontSize: 12, fontWeight: '600', color: colors.white },
  cartArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartArrowText: { color: colors.white, fontSize: 16, lineHeight: 18 },
  bottomPanel: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    paddingTop: spacing.lg,
    gap: spacing.md,
    flexShrink: 0,
  },
  bottomPanelWide: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  bottomPanelInner: { gap: spacing.md, width: '100%' },
  bottomPanelInnerWide: { maxWidth: 480 },
  headlineBlock: { alignItems: 'center', marginBottom: spacing.xs },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  headlineAccent: { color: '#818cf8' },
  headlineSub: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryCta: {
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryCtaText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  secondaryCta: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryCtaText: { color: colors.white, fontWeight: '500', fontSize: 14 },
  legal: {
    textAlign: 'center',
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  legalLink: { color: 'rgba(255,255,255,0.5)', textDecorationLine: 'underline' },
});
