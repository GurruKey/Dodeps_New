import { AuthProvider } from './auth';
import { ThemeProvider } from './theme';

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
