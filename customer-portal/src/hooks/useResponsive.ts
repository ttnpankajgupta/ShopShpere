import { useWindowDimensions, Platform } from 'react-native';

const MOBILE_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isMobileLayout = !isWeb || width < MOBILE_BREAKPOINT;
  const isDesktopWeb = isWeb && width >= DESKTOP_BREAKPOINT;
  const contentMaxWidth = isDesktopWeb ? 384 : isWeb ? 480 : undefined;

  return {
    width,
    height,
    isWeb,
    isMobileLayout,
    isDesktopWeb,
    contentMaxWidth,
  };
}
