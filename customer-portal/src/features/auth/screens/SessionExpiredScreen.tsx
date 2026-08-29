import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { Alert, Button, IconBadge, ShopSphereLogo } from '../../../components';
import { useResponsive } from '../../../hooks/useResponsive';
import { AuthScreenLayout } from '../../../layout/AuthScreenLayout';
import { colors, spacing, typography } from '../../../theme/tokens';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SessionExpired'>;

export function SessionExpiredScreen({ navigation }: Props) {
  const { isMobileLayout } = useResponsive();

  return (
    <AuthScreenLayout>
      <View style={styles.stack}>
        <ShopSphereLogo size={isMobileLayout ? 'sm' : 'md'} />

        <View style={styles.hero}>
          <IconBadge variant="warning">⚠️</IconBadge>
          <Text style={[styles.title, !isMobileLayout && styles.titleWeb]}>Session expired</Text>
          <Text style={styles.subtitle}>
            For your security, your session has expired after a period of inactivity. Please sign in
            again to continue.
          </Text>
        </View>

        <Alert
          type="warning"
          message="Don't worry — your cart and wishlist have been saved. You can pick up right where you left off."
        />

        <Button
          title="Sign in again"
          onPress={() => navigation.navigate('Login')}
          fullWidth
          size={isMobileLayout ? 'lg' : 'md'}
        />
        <Button
          title="Create new account"
          variant="secondary"
          onPress={() => navigation.navigate('Register')}
          fullWidth
          size={isMobileLayout ? 'lg' : 'md'}
        />

        <Text style={styles.footer}>Sessions expire after 24 hours of inactivity for your security.</Text>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  title: { ...typography.heading, color: colors.navy, textAlign: 'center' },
  titleWeb: { fontSize: 30 },
  subtitle: { color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  footer: { textAlign: 'center', fontSize: 12, color: colors.mutedLight },
});
