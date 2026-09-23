'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import Link from 'next/link';
import { Button } from '@gitroom/react/ui/button';
import { Input } from '@gitroom/react/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@gitroom/react/ui/form';
import { useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ForgotPasswordDto } from '@gitroom/nestjs-libraries/dtos/auth/forgot.password.dto';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
type Inputs = {
  email: string;
};
export function Forgot() {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(false);
  const resolver = useMemo(() => {
    return classValidatorResolver(ForgotPasswordDto);
  }, []);
  const form = useForm<Inputs>({
    resolver,
  });
  const fetchData = useFetch();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    await fetchData('/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        provider: 'LOCAL',
      }),
    });
    setState(true);
    setLoading(false);
  };
  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">
            {t('forgot_password_1', 'Forgot Password')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(
              'enter_your_email_to_reset',
              'Enter your email and we will send you a reset link.'
            )}
          </p>
        </div>

        {!state ? (
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="!h-[48px] !rounded-full px-5 text-base"
                      placeholder={t('email_address', 'Email Address')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-2 !h-[48px] w-full rounded-full text-base"
              isLoading={loading}
              showSpinner={loading}
            >
              {t('send_password_reset_email', 'Send Password Reset Email')}
            </Button>

            <Link
              href="/auth/login"
              className="text-muted-foreground hover:text-foreground mt-1 text-center text-sm transition-colors"
            >
              {t('go_back_to_login', 'Go back to login')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-muted-foreground text-sm">
              {t(
                'we_have_send_you_an_email_with_a_link_to_reset_your_password',
                'We have send you an email with a link to reset your password.'
              )}
            </div>
            <Link
              href="/auth/login"
              className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
            >
              {t('go_back_to_login', 'Go back to login')}
            </Link>
          </div>
        )}
      </form>
    </Form>
  );
}
