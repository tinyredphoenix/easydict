/**
 * EasyDict – Premium Design System Colors
 * System-adaptive: dark / light based on user OS setting
 */

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  // Brand accent
  accent: string;
  accentSoft: string;
  accentDim: string;
  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnAccent: string;
  // Borders
  border: string;
  divider: string;
  // Semantic
  success: string;
  error: string;
  warning: string;
  // Tab bar
  tabIconDefault: string;
  tabIconSelected: string;
  tabBackground: string;
  // Shadow
  shadow: string;
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: '#F5F4F0',
    surface: '#FFFFFF',
    surfaceAlt: '#EEECEA',
    card: '#FFFFFF',
    accent: '#5C5BD6',
    accentSoft: '#EAE9FF',
    accentDim: '#9898E0',
    text: '#18181C',
    textSecondary: '#6B6B80',
    textMuted: '#A0A0B2',
    textOnAccent: '#FFFFFF',
    border: '#E2E0DC',
    divider: '#EBEBF0',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    tabIconDefault: '#A0A0B2',
    tabIconSelected: '#5C5BD6',
    tabBackground: '#FFFFFF',
    shadow: '#000000',
  },

  dark: {
    background: '#0E0E12',
    surface: '#1A1A24',
    surfaceAlt: '#22222E',
    card: '#1E1E2A',
    accent: '#7C7AFF',
    accentSoft: '#25243A',
    accentDim: '#5554CC',
    text: '#F0EFFF',
    textSecondary: '#9898B4',
    textMuted: '#5C5C78',
    textOnAccent: '#FFFFFF',
    border: '#2E2E3E',
    divider: '#232330',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    tabIconDefault: '#5C5C78',
    tabIconSelected: '#7C7AFF',
    tabBackground: '#13131A',
    shadow: '#000000',
  },
};
