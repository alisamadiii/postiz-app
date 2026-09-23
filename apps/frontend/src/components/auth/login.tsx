'use client';

import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import Link from 'next/link';
import { Button } from '@gitroom/react/form/button';
import { Input } from '@gitroom/react/form/input';
import { useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { LoginUserDto } from '@gitroom/nestjs-libraries/dtos/auth/login.user.dto';
import { GithubProvider } from '@gitroom/frontend/components/auth/providers/github.provider';
import { OauthProvider } from '@gitroom/frontend/components/auth/providers/oauth.provider';
import { GoogleProvider } from '@gitroom/frontend/components/auth/providers/google.provider';
import { AppleProvider } from '@gitroom/frontend/components/auth/providers/apple.provider';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { FarcasterProvider } from '@gitroom/frontend/components/auth/providers/farcaster.provider';
import WalletProvider from '@gitroom/frontend/components/auth/providers/wallet.provider';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
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
    <FormProvider {...form}>
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
          <Input
            label=""
            translationKey="label_email"
            {...form.register('email')}
            type="email"
            className="!h-[48px] !rounded-full !bg-background !border-border"
            placeholder={t('email_address', 'Email Address')}
          />
          <Input
            label=""
            translationKey="label_password"
            {...form.register('password')}
            autoComplete="off"
            type="password"
            className="!h-[48px] !rounded-full !bg-background !border-border"
            placeholder={t('label_password', 'Password')}
          />

          {notActivated && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-[10px] p-4">
              <p className="text-amber-400 text-sm mb-2">
                {t(
                  'account_not_activated',
                  'Your account is not activated yet. Please check your email for the activation link.'
                )}
              </p>
              <Link
                href="/auth/activate"
                className="text-amber-400 underline hover:font-bold text-sm"
              >
                {t('resend_activation_email', 'Resend Activation Email')}
              </Link>
            </div>
          )}

          <Button
            type="submit"
            className="mt-2 !h-[48px] w-full rounded-full text-base"
            loading={loading}
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

        <div className="flex items-center">
          <div className="flex-1 border-t border-border" />
          <span className="text-muted-foreground px-3 text-xs">
            {t('or_continue_with', 'Or continue with')}
          </span>
          <div className="flex-1 border-t border-border" />
        </div>

        {isGeneral && genericOauth ? (
          <OauthProvider />
        ) : !isGeneral ? (
          <GithubProvider />
        ) : (
          <div className="gap-[8px] flex">
            <GoogleProvider />
            {!!appleClientId && <AppleProvider />}
            {!!neynarClientId && <FarcasterProvider />}
            {billingEnabled && <WalletProvider />}
          </div>
        )}
      </form>
    </FormProvider>
  );
}
