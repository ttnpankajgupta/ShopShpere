import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ApiClientError, ApiTimeoutError } from '../../../api/types';
import { Alert, BackButton, Button, Input, ShopSphereLogo } from '../../../components';
import { useResponsive } from '../../../hooks/useResponsive';
import { AuthScreenLayout } from '../../../layout/AuthScreenLayout';
import { colors, spacing, typography } from '../../../theme/tokens';
import { authApi } from '../api';
import { AuthStackParamList } from '../navigation/types';
import { validatePassword } from '../validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ route, navigation }: Props) {
  const { email, code } = route.params;
  const { isMobileLayout } = useResponsive();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    const next: Record<string, string> = {};
    const passwordError = validatePassword(password);
    if (passwordError) next.password = passwordError;
    if (!confirm) next.confirm = 'Please confirm your password';
    else if (confirm !== password) next.confirm = 'Passwords do not match';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await authApi.resetPassword(email, code, password);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiTimeoutError) {
        setApiError('Request timed out. Please try again.');
      } else if (err instanceof ApiClientError) {
        setApiError(err.message);
      } else {
        setApiError('Unable to reset password. Please try again.');
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
          <Text style={[styles.title, !isMobileLayout && styles.titleWeb]}>Reset password</Text>
          <Text style={styles.subtitle}>Choose a new password for {email}</Text>
        </View>

        {done ? (
          <Alert type="success" message="Password updated. You can sign in with your new password." />
        ) : null}
        {apiError ? <Alert type="error" message={apiError} onDismiss={() => setApiError('')} /> : null}

        {!done ? (
          <>
            <Input
              label="New password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              placeholder="Min. 8 characters"
            />
            <Input
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              error={errors.confirm}
              secureTextEntry
              placeholder="Repeat your password"
            />
            <Button
              title={loading ? 'Updating…' : 'Update password'}
              onPress={() => void handleSubmit()}
              loading={loading}
              fullWidth
              size={isMobileLayout ? 'lg' : 'md'}
            />
          </>
        ) : (
          <Button
            title="Back to sign in"
            onPress={() => navigation.navigate('Login')}
            fullWidth
            size={isMobileLayout ? 'lg' : 'md'}
          />
        )}
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.heading, color: colors.navy },
  titleWeb: { fontSize: 30 },
  subtitle: { color: colors.muted, marginTop: spacing.xs, fontSize: 14 },
});
