'use client';

import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FC,
} from 'react';
import { Button as UIButton } from '../ui/button';
import { cn } from '../lib/utils';

// API-compatible wrapper: keeps the original Postiz Button props
// (secondary / loading / innerClassName + native button attrs) while
// rendering the shadcn/ui Button underneath (agency-orange design system).
export const Button: FC<
  DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    secondary?: boolean;
    loading?: boolean;
    innerClassName?: string;
  }
> = ({
  children,
  loading,
  innerClassName,
  secondary,
  className,
  type,
  ...props
}) => {
  return (
    <UIButton
      {...props}
      type={type || 'button'}
      variant={secondary ? 'secondary' : 'default'}
      size="lg"
      isLoading={loading}
      showSpinner={loading}
      className={cn('cursor-pointer', className)}
    >
      {innerClassName ? (
        <span className={cn('flex items-center justify-center', innerClassName)}>
          {children}
        </span>
      ) : (
        children
      )}
    </UIButton>
  );
};
