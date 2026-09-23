'use client';

import { FC, ReactNode, useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';

const LegacyModeMigration: FC = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    const legacyMode = document.cookie
      .split('; ')
      .find((row) => row.startsWith('mode='))
      ?.split('=')[1];

    if (legacyMode === 'dark' || legacyMode === 'light') {
      setTheme(legacyMode);
      document.cookie = 'mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }, []);

  return null;
};

export const ThemeProviderClient = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <LegacyModeMigration />
      {children}
    </ThemeProvider>
  );
};
