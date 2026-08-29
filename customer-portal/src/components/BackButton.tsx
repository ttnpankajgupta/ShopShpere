import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/tokens';

export function BackButton({ onPress, label = 'Back' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.button}>
      <Text style={styles.arrow}>‹</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  arrow: { fontSize: 18, color: colors.muted, lineHeight: 20 },
  label: { fontSize: 14, color: colors.muted },
});
