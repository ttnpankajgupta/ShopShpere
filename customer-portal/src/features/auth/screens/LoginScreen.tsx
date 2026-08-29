import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ApiClientError, ApiTimeoutError } from '../../../api/types';
import { Alert, Button, Input, ShopSphereLogo } from '../../../components';
import { useResponsive } from '../../../hooks/useResponsive';
import { AuthScreenLayout } from '../../../layout/AuthScreenLayout';
import { colors, spacing, typography } from '../../../theme/tokens';
import { authApi } from '../api';
import { useAuth } from '../AuthContext';
import { AuthStackParamList } from '../navigation/types';
import { isValidEmail } from '../validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const { isMobileLayout } = useResponsive();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!email) next.email = 'Email address is required';
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    return next;
  };

  const handleSubmit = async () => {
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      const session = await authApi.login(email.trim().toLowerCase(), password);
      await signIn(session);
    } catch (error) {
      if (error instanceof ApiTimeoutError) {
        setApiError('Request timed out. Please try again.');
      } else if (error instanceof ApiClientError) {
        setApiError(error.message);
      } else {
        setApiError('Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout>
      <View style={styles.stack}>
        <ShopSphereLogo size={isMobileLayout ? 'sm' : 'md'} />
        <View>
          <Text style={[styles.title, !isMobileLayout && styles.titleWeb]}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your ShopSphere account</Text>
        </View>

        {apiError ? (
          <Alert type="error" title="Sign-in failed" message={apiError} onDismiss={() => setApiError('')} />
        ) : null}

        <Input
          label="Email address"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setErrors((p) => ({ ...p, email: undefined }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setErrors((p) => ({ ...p, password: undefined }));
          }}
          secureTextEntry
          autoComplete="password"
          error={errors.password}
          placeholder="••••••••"
        />

        <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkWrap}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>

        <Button
          title={loading ? 'Signing in…' : 'Sign in'}
          onPress={() => void handleSubmit()}
          loading={loading}
          fullWidth
          size={isMobileLayout ? 'lg' : 'md'}
        />

        <Text style={styles.footer}>
          Don&apos;t have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            Create account
          </Text>
        </Text>

        {!isMobileLayout ? (
          <Text style={styles.legal}>
            By signing in you agree to our <Text style={styles.link}>Terms</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        ) : null}
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.lg },
  title: { ...typography.heading, color: colors.navy },
  titleWeb: { fontSize: 30 },
  subtitle: { color: colors.muted, marginTop: spacing.xs, fontSize: 14 },
  linkWrap: { alignSelf: 'flex-end', marginTop: -spacing.sm },
  link: { color: colors.accent, fontWeight: '600', fontSize: 14 },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 14 },
  legal: { textAlign: 'center', color: colors.mutedLight, fontSize: 12, lineHeight: 18 },
});
