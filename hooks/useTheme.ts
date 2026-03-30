/**
 * useTheme – returns the correct color palette based on system color scheme.
 * Use this in every component instead of hardcoded colors.
 */

import { useColorScheme } from 'react-native';
import { Colors, ThemeColors } from '@/constants/Colors';

export type { ThemeColors };

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}
