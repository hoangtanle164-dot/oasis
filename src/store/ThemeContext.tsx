import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { DarkPalette, LightPalette, ThemeColors } from '../utils/theme';
import { useData } from './DataContext';

interface ThemeContextValue {
  dark: boolean;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({ dark: false, colors: LightPalette });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const { settings, loading } = useData();

  const dark = loading ? system === 'dark' : settings.darkMode;
  const colors = dark ? DarkPalette : LightPalette;

  const value = useMemo(() => ({ dark, colors }), [dark, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
