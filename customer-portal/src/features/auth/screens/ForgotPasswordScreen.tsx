import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ApiClientError, ApiTimeoutError } from '../../../api/types';
import { Alert, BackButton, Button, Input, ShopSphereLogo } from '../../../components';
import { useResponsive } from '../../../hooks/useResponsive';
import { AuthScreenLayout } from '../../../layout/AuthScreenLayout';
import { colors, spacing, typography } from '../../../theme/tokens';
import { authApi } from '../api';
import { AuthStackParamList } from '../navigation/types';
import { isValidEmail } from '../validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { isMobileLayout } = useResponsive();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Email address is required');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setApiError('');
    setLoading(true);
    try {
      const normalized = email.trim().toLowerCase();
      await authApi.forgotPassword(normalized);
      navigation.navigate('OtpVerification', {
        email: normalized,
        purpose: 'PASSWORD_RESET',
      });
    } catch (err) {
      if (err instanceof ApiTimeoutError) {
        setApiError('Request timed out. Please try again.');
      } else if (err instanceof ApiClientError) {
        setApiError(err.message);
      } else {
        setApiError('Unable to send reset code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout>
      <View style={styles.stack}>
        <View style={styles.headerRow}>
          <ShopSphereLogo size={isMobileLayout ? 'sm' : 'md'} />
          <BackButton onPress={() => navigation.navigate('Login')} />
        </View>

        <View>
          <Text style={[styles.title, !isMobileLayout && styles.titleWeb]}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we&apos;ll send a reset code if an account exists.
          </Text>
        </View>

        {apiError ? <Alert type="error" message={apiError} onDismiss={() => setApiError('')} /> : null}

        <Input
          label="Email address"
          value={email}
          onChangeText={setEmail}
          error={error}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
        />

        <Button
          title={loading ? 'Sending…' : 'Send reset code'}
          onPress={() => void handleSubmit()}
          loading={loading}
          fullWidth
          size={isMobileLayout ? 'lg' : 'md'}
        />

        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Back to sign in</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.heading, color: colors.navy },
  titleWeb: { fontSize: 30 },
  subtitle: { color: colors.muted, marginTop: spacing.xs, fontSize: 14, lineHeight: 22 },
  link: { color: colors.accent, fontWeight: '600', textAlign: 'center', fontSize: 14 },
});
