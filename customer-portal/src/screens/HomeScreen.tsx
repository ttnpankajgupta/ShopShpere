import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../components';
import { colors, spacing, typography } from '../theme/tokens';
import { useAuth } from '../features/auth/AuthContext';

export function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>ShopSphere</Text>
      <Card>
        <Text style={styles.greeting}>
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Button title="Sign out" onPress={() => void signOut()} variant="secondary" style={styles.button} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.surface },
  heading: { ...typography.title, color: colors.navy, marginBottom: spacing.lg },
  greeting: { fontSize: 18, fontWeight: '600', marginBottom: spacing.xs, color: colors.navy },
  email: { color: colors.muted, marginBottom: spacing.lg },
  button: { marginTop: spacing.sm },
});
