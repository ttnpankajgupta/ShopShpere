import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, radii } from '../theme/tokens';

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, error, disabled }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH).split('');

  return (
    <View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, OTP_LENGTH))}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        editable={!disabled}
        style={styles.hiddenInput}
        accessibilityLabel="Verification code"
      />
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel="Enter verification code"
      >
        {digits.map((digit, index) => {
          const filled = digit.trim().length > 0;
          return (
            <View
              key={index}
              style={[
                styles.cell,
                error && styles.cellError,
                filled && !error && styles.cellFilled,
              ]}
            >
              <TextInput
                style={[styles.cellText, filled && !error && styles.cellTextFilled]}
                value={filled ? digit : ''}
                editable={false}
                pointerEvents="none"
              />
            </View>
          );
        })}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  cell: {
    width: 44,
    height: 56,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  cellError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  cellText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.navy,
    textAlign: 'center',
    padding: 0,
  },
  cellTextFilled: { color: colors.accent },
});
