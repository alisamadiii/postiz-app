'use client';

import { DetailedHTMLProps, FC, InputHTMLAttributes, useMemo } from 'react';
import { cn } from '@gitroom/react/helpers/cn';
import { useFormContext } from 'react-hook-form';
import { TranslatedLabel } from '../translation/translated-label';

export const Textarea: FC<
  DetailedHTMLProps<
    InputHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > & {
    error?: any;
    disableForm?: boolean;
    label: string;
    name: string;
    translationKey?: string;
    translationParams?: Record<string, string | number>;
  }
> = (props) => {
  const {
    label,
    className,
    disableForm,
    error,
    translationKey,
    translationParams,
    ...rest
  } = props;
  const form = useFormContext();
  const err = useMemo(() => {
    if (error) return error;
    if (!form || !form.formState.errors[props?.name!]) return;
    return form?.formState?.errors?.[props?.name!]?.message! as string;
  }, [form?.formState?.errors?.[props?.name!]?.message, error]);
  return (
    <div
      className={cn(
        'flex flex-col gap-[6px]',
        props.disabled && 'opacity-50'
      )}
    >
      <div className={`text-[14px]`}>
        <TranslatedLabel
          label={label}
          translationKey={translationKey}
          translationParams={translationParams}
        />
      </div>
      <textarea
        {...(disableForm ? {} : form.register(props.name))}
        className={cn(
          'bg-input min-h-[150px] p-[16px] outline-none border-border border rounded-md text-muted-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50',
          className
        )}
        {...rest}
      />
      <div className="text-destructive text-[12px]">{err || <>&nbsp;</>}</div>
    </div>
  );
};
