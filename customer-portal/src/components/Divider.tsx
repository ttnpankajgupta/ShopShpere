import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function Divider({ text }: { text?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      {text ? <Text style={styles.text}>{text}</Text> : null}
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  text: { color: colors.mutedLight, fontSize: 12, fontWeight: '500' },
});
