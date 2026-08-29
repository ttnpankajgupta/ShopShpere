import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';

interface AlertProps {
  type: 'error' | 'success' | 'info' | 'warning';
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export function Alert({ type, title, message, onDismiss }: AlertProps) {
  const palette = {
    error: { bg: colors.errorLight, border: '#fecaca', text: '#991b1b' },
    success: { bg: colors.successLight, border: '#6ee7b7', text: '#047857' },
    info: { bg: colors.accentLight, border: '#c7d2fe', text: '#4338ca' },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
  }[type];

  return (
    <View style={[styles.container, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <View style={styles.content}>
        {title ? <Text style={[styles.title, { color: palette.text }]}>{title}</Text> : null}
        <Text style={[styles.message, { color: palette.text }]}>{message}</Text>
      </View>
      {onDismiss ? (
        <Pressable onPress={onDismiss} accessibilityRole="button">
          <Text style={styles.dismiss}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  content: { flex: 1 },
  title: { fontWeight: '600', fontSize: 14, marginBottom: 4 },
  message: { fontSize: 12, lineHeight: 18 },
  dismiss: { fontSize: 18, color: colors.muted, paddingHorizontal: 4 },
});
