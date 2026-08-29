import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/tokens';

interface CountdownTimerProps {
  seconds: number;
  onExpire?: () => void;
}

function formatTime(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function CountdownTimer({ seconds, onExpire }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const timer = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onExpire]);

  return <Text style={styles.text}>{formatTime(remaining)}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: 12, fontWeight: '600', color: colors.navy, fontVariant: ['tabular-nums'] },
});
