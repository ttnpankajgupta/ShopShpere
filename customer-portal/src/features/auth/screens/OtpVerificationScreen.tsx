import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { OtpPurpose } from '../../../api/types';
import { ApiClientError, ApiTimeoutError } from '../../../api/types';
import {
  Alert,
  BackButton,
  Button,
  CountdownTimer,
  IconBadge,
  OtpInput,
  ShopSphereLogo,
} from '../../../components';
import { useResponsive } from '../../../hooks/useResponsive';
import { AuthScreenLayout } from '../../../layout/AuthScreenLayout';
import { colors, spacing, typography } from '../../../theme/tokens';
import { authApi } from '../api';
import { useAuth } from '../AuthContext';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
const EXPIRE_SECONDS = 600;

export function OtpVerificationScreen({ route, navigation }: Props) {
  const { email, purpose } = route.params;
  const { signIn } = useAuth();
  const { isMobileLayout } = useResponsive();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [expired, setExpired] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }
    if (expired) return;
    setError('');

    if (purpose === 'PASSWORD_RESET') {
      navigation.navigate('ResetPassword', { email, code });
      return;
    }

    setLoading(true);
    try {
      const session = await authApi.verifyOtp(email, code, purpose as OtpPurpose);
      await signIn(session);
    } catch (err) {
      if (err instanceof ApiTimeoutError) {
        setError('Request timed out. Please try again.');
      } else if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('The code you entered is incorrect. Please check and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || resending) return;
    setError('');
    setResendSuccess(false);
    setResending(true);
    try {
      await authApi.sendOtp(email, purpose as OtpPurpose);
      setResendIn(RESEND_SECONDS);
      setTimerKey((k) => k + 1);
      setExpired(false);
      setCode('');
      setResendSuccess(true);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      }
    } finally {
      setResending(false);
    }
  };

  const backTarget = purpose === 'PASSWORD_RESET' ? 'ForgotPassword' : 'Register';

  return (
    <AuthScreenLayout>
      <View style={styles.stack}>
        <View style={styles.headerRow}>
          <ShopSphereLogo size={isMobileLayout ? 'sm' : 'md'} />
          <BackButton onPress={() => navigation.navigate(backTarget)} />
        </View>

        <View style={styles.hero}>
          <IconBadge variant="accent">✉️</IconBadge>
          <Text style={[styles.title, !isMobileLayout && styles.titleWeb]}>
            {expired ? 'Code expired' : 'Check your email'}
          </Text>
          <Text style={styles.subtitle}>
            {expired
              ? 'Your verification code has expired. Request a new one below.'
              : (
                <>
                  We sent a 6-digit code to <Text style={styles.email}>{email}</Text>
                </>
              )}
          </Text>
        </View>

        {expired ? (
          <Alert
            type="warning"
            title="Verification code expired"
            message="For security, verification codes expire after 10 minutes. Please request a new code."
          />
        ) : null}

        {error ? <Alert type="error" message={error} onDismiss={() => setError('')} /> : null}

        {resendSuccess && !expired ? (
          <Alert type="success" message={`A new verification code has been sent to ${email}.`} />
        ) : null}

        {!expired ? (
          <>
            <OtpInput
              value={code}
              onChange={setCode}
              error={Boolean(error)}
              disabled={loading || resending}
            />

            <View style={styles.expiryRow}>
              <Text style={styles.expiryLabel}>Expires in</Text>
              <CountdownTimer key={timerKey} seconds={EXPIRE_SECONDS} onExpire={() => setExpired(true)} />
            </View>

            <Button
              title={loading ? 'Verifying…' : 'Verify code'}
              onPress={() => void handleVerify()}
              loading={loading}
              disabled={resending || code.length < OTP_LENGTH}
              fullWidth
              size={isMobileLayout ? 'lg' : 'md'}
            />
          </>
        ) : null}

        <View style={styles.resendBlock}>
          <Text style={styles.resendPrompt}>Didn&apos;t receive a code?</Text>
          <Pressable
            onPress={() => void handleResend()}
            disabled={resending || loading || resendIn > 0}
            style={styles.resendButton}
          >
            {resending ? (
              <View style={styles.resendRow}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.resendLink}>Sending new code…</Text>
              </View>
            ) : (
              <Text style={[styles.resendLink, resendIn > 0 && styles.resendDisabled]}>
                {resendIn > 0 ? `Resend available in ${resendIn}s` : 'Resend code'}
              </Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.hint}>Check your spam folder if you don&apos;t see the email in your inbox.</Text>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hero: { alignItems: 'center', gap: spacing.md },
  title: { ...typography.heading, color: colors.navy, textAlign: 'center' },
  titleWeb: { fontSize: 30 },
  subtitle: { color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  email: { fontWeight: '500', color: colors.navy },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  expiryLabel: { fontSize: 12, color: colors.mutedLight },
  resendBlock: { alignItems: 'center', gap: spacing.sm },
  resendPrompt: { fontSize: 14, color: colors.muted },
  resendButton: { paddingVertical: spacing.xs },
  resendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  resendLink: { fontSize: 14, fontWeight: '600', color: colors.accent },
  resendDisabled: { color: colors.mutedLight, fontWeight: '500' },
  hint: { textAlign: 'center', fontSize: 12, color: colors.mutedLight },
});
