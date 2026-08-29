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
import { isValidEmail, splitFullName, validatePassword } from '../validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { setPendingEmail } = useAuth();
  const { isMobileLayout } = useResponsive();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    const nameParts = splitFullName(fullName);
    if (!nameParts) next.fullName = 'Please enter your first and last name';
    if (!email) next.email = 'Email address is required';
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address';
    const passwordError = validatePassword(password);
    if (passwordError) next.password = passwordError;
    if (!confirm) next.confirm = 'Please confirm your password';
    else if (confirm !== password) next.confirm = 'Passwords do not match';
    return next;
  };

  const handleSubmit = async () => {
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    const nameParts = splitFullName(fullName)!;
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await authApi.register({
        email: normalizedEmail,
        password,
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
      });
      setPendingEmail(normalizedEmail);
      navigation.navigate('OtpVerification', { email: normalizedEmail, purpose: 'REGISTRATION' });
    } catch (error) {
      if (error instanceof ApiTimeoutError) {
        setApiError('Request timed out. Please try again.');
      } else if (error instanceof ApiClientError) {
        setApiError(error.message);
      } else {
        setApiError('Unable to register. Please try again.');
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
          <Text style={[styles.title, !isMobileLayout && styles.titleWeb]}>Create your account</Text>
          <Text style={styles.subtitle}>Start shopping with ShopSphere today</Text>
        </View>

        {apiError ? (
          <Alert type="error" title="Registration failed" message={apiError} onDismiss={() => setApiError('')} />
        ) : null}

        <Input
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
          placeholder="Alex Johnson"
          autoComplete="name"
        />
        <Input
          label="Email address"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          placeholder="Min. 8 characters"
          autoComplete="new-password"
        />
        <Input
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          secureTextEntry
          placeholder="Repeat your password"
          autoComplete="new-password"
        />

        <Button
          title={loading ? 'Creating account…' : 'Create account'}
          onPress={() => void handleSubmit()}
          loading={loading}
          fullWidth
          size={isMobileLayout ? 'lg' : 'md'}
        />

        <Text style={styles.footer}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Sign in
          </Text>
        </Text>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.lg },
  title: { ...typography.heading, color: colors.navy },
  titleWeb: { fontSize: 30 },
  subtitle: { color: colors.muted, marginTop: spacing.xs, fontSize: 14 },
  link: { color: colors.accent, fontWeight: '600' },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 14 },
});
