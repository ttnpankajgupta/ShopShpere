import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../theme/tokens';

interface LaunchScreenLayoutProps {
  children: ReactNode;
}

/** Full-viewport navy shell for launch on all platforms (including web). */
export function LaunchScreenLayout({ children }: LaunchScreenLayoutProps) {
  const { height, isWeb } = useResponsive();

  return (
    <View style={[styles.fullBleed, isWeb && { minHeight: height }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fullBleed: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.navy,
  },
});
