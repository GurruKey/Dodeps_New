import { createContext, useContext } from 'react';

export const ThemeCtx = createContext(null);

export function useTheme() {
  const context = useContext(ThemeCtx);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
