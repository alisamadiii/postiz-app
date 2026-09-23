'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { SubmitHandler, useForm } from 'react-hook-form';

import { LoginUserDto } from '@gitroom/nestjs-libraries/dtos/auth/login.user.dto';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { Button } from '@gitroom/react/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@gitroom/react/ui/form';
import { Input } from '@gitroom/react/ui/input';
import { AppleProvider } from '@gitroom/frontend/components/auth/providers/apple.provider';
import { FarcasterProvider } from '@gitroom/frontend/components/auth/providers/farcaster.provider';
import { GithubProvider } from '@gitroom/frontend/components/auth/providers/github.provider';
import { GoogleProvider } from '@gitroom/frontend/components/auth/providers/google.provider';
import { OauthProvider } from '@gitroom/frontend/components/auth/providers/oauth.provider';
import WalletProvider from '@gitroom/frontend/components/auth/providers/wallet.provider';

type Inputs = {
  email: string;
  password: string;
  providerToken: '';
  provider: 'LOCAL';
};
export function Login() {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [notActivated, setNotActivated] = useState(false);
  const {
    isGeneral,
    neynarClientId,
    appleClientId,
    billingEnabled,
    genericOauth,
  } = useVariables();
  const resolver = useMemo(() => {
    return classValidatorResolver(LoginUserDto);
  }, []);
  const form = useForm<Inputs>({
    resolver,
    defaultValues: {
      providerToken: '',
      provider: 'LOCAL',
    },
  });
  const fetchData = useFetch();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    setNotActivated(false);
    const login = await fetchData('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        provider: 'LOCAL',
      }),
    });
    if (login.status === 400) {
      const errorMessage = await login.text();
      if (errorMessage === 'User is not activated') {
        setNotActivated(true);
      } else {
        form.setError('email', {
          message: errorMessage,
        });
      }
      setLoading(false);
    }
  };
  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{t('sign_in', 'Sign In')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('don_t_have_an_account', "Don't Have An Account?")}
            <Link
              href="/auth"
              className="text-foreground ml-1 font-medium transition-opacity hover:opacity-70"
            >
              {t('sign_up', 'Sign Up')}
            </Link>
          </p>
        </div>

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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="off"
                    type="password"
                    className="!h-[48px] !rounded-full px-5 text-base"
                    placeholder={t('label_password', 'Password')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {notActivated && (
            <div className="rounded-[10px] border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="mb-2 text-sm text-amber-400">
                {t(
                  'account_not_activated',
                  'Your account is not activated yet. Please check your email for the activation link.',
                )}
              </p>
              <Link
                href="/auth/activate"
                className="text-sm text-amber-400 underline hover:font-bold"
              >
                {t('resend_activation_email', 'Resend Activation Email')}
              </Link>
            </div>
          )}

          <Button
            type="submit"
            className="mt-2 !h-[48px] w-full rounded-full text-base"
            isLoading={loading}
            showSpinner={loading}
          >
            {t('sign_in_1', 'Sign in')}
          </Button>

          <Link
            href="/auth/forgot"
            className="text-muted-foreground hover:text-foreground mt-1 text-center text-sm transition-colors"
          >
            {t('forgot_password', 'Forgot password')}
          </Link>
        </div>
      </form>
    </Form>
  );
}
