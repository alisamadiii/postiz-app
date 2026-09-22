'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

export const ThemeProviderClient = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
};
