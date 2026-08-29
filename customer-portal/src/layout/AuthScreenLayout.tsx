import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { colors, spacing } from '../theme/tokens';
import { AuthDecorPanel } from './AuthDecorPanel';

interface AuthScreenLayoutProps {
  children: ReactNode;
  variant?: 'default' | 'fullBleed';
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

export function AuthScreenLayout({
  children,
  variant = 'default',
  scroll = true,
  contentStyle,
}: AuthScreenLayoutProps) {
  const { isWeb, isMobileLayout, isDesktopWeb, contentMaxWidth } = useResponsive();

  if (variant === 'fullBleed') {
    return <View style={styles.fullBleed}>{children}</View>;
  }

  const inner = (
    <View
      style={[
        styles.content,
        isMobileLayout ? styles.contentMobile : styles.contentWeb,
        contentMaxWidth ? { maxWidth: contentMaxWidth, width: '100%' as const } : null,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        isMobileLayout && styles.scrollContentMobile,
        !isMobileLayout && styles.scrollContentWeb,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={isWeb}
    >
      {inner}
    </ScrollView>
  ) : (
    <View style={[styles.scrollContent, styles.flex]}>{inner}</View>
  );

  if (isDesktopWeb) {
    return (
      <View style={styles.desktopRoot}>
        <AuthDecorPanel />
        <KeyboardAvoidingView
          style={styles.desktopMain}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, isWeb && !isMobileLayout && styles.rootWeb]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {isWeb && !isMobileLayout ? (
        <View style={styles.webCard}>{body}</View>
      ) : (
        body
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.background },
  rootWeb: {
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  webCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  desktopMain: { flex: 1 },
  fullBleed: { flex: 1, backgroundColor: colors.navy },
  scrollContent: { flexGrow: 1 },
  scrollContentMobile: { paddingBottom: spacing.xl },
  scrollContentWeb: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    paddingVertical: spacing.xl,
  },
  content: { width: '100%' },
  contentMobile: {
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.xl,
  },
  contentWeb: {
    paddingHorizontal: 40,
    paddingVertical: 40,
    alignSelf: 'center',
  },
});
