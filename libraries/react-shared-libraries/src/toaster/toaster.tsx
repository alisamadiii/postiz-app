'use client';

import { useCallback, useEffect, useState } from 'react';
import { Toaster as SonnerToaster, toast } from 'sonner';

// Only the first mounted <Toaster /> renders the Sonner container, so multiple
// mount sites (auth layout, app layout, preview) never duplicate toasts.
let instances = 0;

export const Toaster = () => {
  const [primary, setPrimary] = useState(false);
  useEffect(() => {
    instances += 1;
    if (instances === 1) {
      setPrimary(true);
    }
    return () => {
      instances -= 1;
    };
  }, []);

  if (!primary) {
    return null;
  }

  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        className: 'font-sans',
      }}
    />
  );
};

export const useToaster = () => {
  return {
    show: useCallback(
      (text: string, type?: 'success' | 'warning' | 'error') => {
        if (type === 'warning') {
          toast.warning(text);
          return;
        }
        if (type === 'error') {
          toast.error(text);
          return;
        }
        toast.success(text);
      },
      []
    ),
  };
};
