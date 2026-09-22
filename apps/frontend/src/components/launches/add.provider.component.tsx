'use client';

import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { Input } from '@gitroom/react/form/input';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { Button } from '@gitroom/react/form/button';
import { Button as UIButton } from '@gitroom/react/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@gitroom/react/ui/dialog';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ApiKeyDto } from '@gitroom/nestjs-libraries/dtos/integrations/api.key.dto';
import { useRouter } from 'next/navigation';
import { TopTitle } from '@gitroom/frontend/components/launches/helpers/top.title.component';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { object, string } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { web3List } from '@gitroom/frontend/components/launches/web3/web3.list';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { cn } from '@gitroom/react/helpers/cn';
import copy from 'copy-to-clipboard';
import { capitalize } from 'lodash';
import { X, Info } from 'lucide-react';
const resolver = classValidatorResolver(ApiKeyDto);

export const useAddProvider = (update?: () => void, invite?: boolean) => {
  const modal = useModals();
  const fetch = useFetch();
  return useCallback(async () => {
    const data = await (await fetch('/integrations')).json();
    modal.openModal({
      title: 'Add Channel',
      withCloseButton: true,
      children: (
        <AddProviderComponent invite={!!invite} update={update} {...data} />
      ),
    });
  }, []);
};
export const AddProviderButton: FC<{
  update?: () => void;
}> = (props) => {
  const { update } = props;
  const fetch = useFetch();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState(false);
  const [data, setData] = useState<any>(null);

  const openDialog = useCallback(
    (asInvite: boolean) => async () => {
      const res = await (await fetch('/integrations')).json();
      setData(res);
      setInvite(asInvite);
      setOpen(true);
    },
    [fetch]
  );

  return (
    <div className="flex gap-[8px]">
      <UIButton
        variant="secondary"
        onClick={openDialog(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="size-5"
        >
          <path
            d="M1.66675 10.0417C3.35907 10.2299 4.93698 10.9884 6.14101 12.1924C7.34504 13.3964 8.10353 14.9743 8.29175 16.6667M1.66675 13.4167C2.46749 13.58 3.20253 13.9751 3.7804 14.553C4.35827 15.1309 4.75344 15.8659 4.91675 16.6667M1.66675 16.6667H1.67508M11.6667 17.5H14.3334C15.7335 17.5 16.4336 17.5 16.9684 17.2275C17.4388 16.9878 17.8212 16.6054 18.0609 16.135C18.3334 15.6002 18.3334 14.9001 18.3334 13.5V6.5C18.3334 5.09987 18.3334 4.3998 18.0609 3.86502C17.8212 3.39462 17.4388 3.01217 16.9684 2.77248C16.4336 2.5 15.7335 2.5 14.3334 2.5H5.66675C4.26662 2.5 3.56655 2.5 3.03177 2.77248C2.56137 3.01217 2.17892 3.39462 1.93923 3.86502C1.66675 4.3998 1.66675 5.09987 1.66675 6.5V6.66667"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[14px]">
          {t('add_channel', 'Add Channel')}
        </span>
      </UIButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {invite
                ? t('invite', 'Invite')
                : t('add_channel', 'Add Channel')}
            </DialogTitle>
          </DialogHeader>
          {data && (
            <AddProviderComponent invite={invite} update={update} {...data} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const UrlModal: FC<{
  gotoUrl(url: string): void;
}> = (props) => {
  const { gotoUrl } = props;
  const methods = useForm({
    mode: 'onChange',
  });

  const t = useT();

  const submit = useCallback(async (data: FieldValues) => {
    gotoUrl(data.url);
  }, []);
  return (
    <div className="rounded-[4px] border border-border bg-muted px-[16px] pb-[16px] relative">
      <TopTitle title={`Instance URL`} />
      <button
        onClick={close}
        className="outline-none absolute end-[20px] top-[20px] mantine-UnstyledButton-root mantine-ActionIcon-root hover:bg-border cursor-pointer mantine-Modal-close mantine-1dcetaa"
        type="button"
      >
        <X width={16} height={16} />
      </button>
      <FormProvider {...methods}>
        <form
          className="gap-[8px] flex flex-col"
          onSubmit={methods.handleSubmit(submit)}
        >
          <div className="pt-[10px]">
            <Input label="URL" name="url" />
          </div>
          <div>
            <Button type="submit">{t('connect', 'Connect')}</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
export const CustomVariables: FC<{
  variables: Array<{
    key: string;
    label: string;
    defaultValue?: string;
    validation: string;
    type: 'text' | 'password';
    hint?: string;
  }>;
  close?: () => void;
  identifier: string;
  gotoUrl(url: string): void;
  onboarding?: boolean;
}> = (props) => {
  const { close, gotoUrl, identifier, variables, onboarding } = props;
  const fetch = useFetch();
  const modals = useModals();
  const schema = useMemo(() => {
    return object({
      ...variables.reduce((aIcc, item) => {
        const splitter = item.validation.split('/');
        const regex = new RegExp(
          splitter.slice(1, -1).join('/'),
          splitter.pop()
        );
        return {
          ...aIcc,
          [item.key]: string()
            .matches(regex, `${item.label} is invalid`)
            .required(),
        };
      }, {}),
    });
  }, [variables]);
  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    values: variables.reduce(
      (acc, item) => ({
        ...acc,
        ...(item.defaultValue
          ? {
              [item.key]: item.defaultValue,
            }
          : {}),
      }),
      {}
    ),
  });
  const submit = useCallback(
    async (data: FieldValues) => {
      const { url } = await (
        await fetch(
          `/integrations/social/${identifier}${
            onboarding ? '?onboarding=true' : ''
          }`
        )
      ).json();
      modals.closeAll();
      gotoUrl(
        `/integrations/social/${identifier}?state=${url}&code=${Buffer.from(
          JSON.stringify(data)
        ).toString('base64')}${onboarding ? '&onboarding=true' : ''}`
      );
    },
    [variables, onboarding]
  );

  const t = useT();

  return (
    <div className="rounded-[4px] relative">
      <FormProvider {...methods}>
        <form
          className="gap-[8px] flex flex-col pt-[10px]"
          onSubmit={methods.handleSubmit(submit)}
        >
          {variables.map((variable) => (
            <div key={variable.key}>
              {variable.hint ? (
                <div className="flex flex-col gap-[6px]">
                  <div className="text-[14px] flex items-center gap-[6px]">
                    <span>{variable.label}</span>
                    <span
                      data-tooltip-id="tooltip"
                      data-tooltip-content={variable.hint}
                      className="w-[16px] h-[16px] rounded-full border border-foreground/60 text-foreground/60 flex items-center justify-center text-[11px] leading-none cursor-help select-none"
                    >
                      i
                    </span>
                  </div>
                  <Input
                    label=""
                    name={variable.key}
                    type={variable.type == 'text' ? 'text' : 'password'}
                  />
                </div>
              ) : (
                <Input
                  label={variable.label}
                  name={variable.key}
                  type={variable.type == 'text' ? 'text' : 'password'}
                />
              )}
            </div>
          ))}
          <div>
            <Button type="submit">{t('connect', 'Connect')}</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
const ExtensionNotFound: FC = () => {
  const modals = useModals();
  const t = useT();
  return (
    <div className="flex flex-col gap-[16px] pt-[8px]">
      <p className="text-[14px] text-foreground/80">
        {t(
          'extension_not_available',
          'The Postiz browser extension is not installed. You need to install it before connecting this channel.'
        )}
      </p>
      <div className="flex gap-[10px]">
        <Button
          type="button"
          className="flex-1"
          onClick={() => {
            window.open(
              'https://chromewebstore.google.com/detail/postiz/cidhffagahknaeodkplfbcpfeielnkjl?hl=en',
              '_blank'
            );
            modals.closeCurrent();
          }}
        >
          {t('install_extension', 'Install Extension')}
        </Button>
        <Button
          type="button"
          className="flex-1 !bg-transparent border border-border text-foreground"
          onClick={() => modals.closeCurrent()}
        >
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    </div>
  );
};

const ChromeExtensionWarning: FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => {
  const modals = useModals();
  const t = useT();
  return (
    <div className="flex flex-col gap-[16px] pt-[8px]">
      <p className="text-[14px] text-foreground/80">
        {t(
          'chrome_extension_warning_intro',
          'This channel connects via the browser extension. Please be aware of the following:'
        )}
      </p>
      <ul className="flex flex-col gap-[8px] list-disc ps-[20px] text-[14px] text-foreground/80">
        <li>
          {t(
            'chrome_extension_warning_tos',
            'Using a browser extension to interact with a platform may violate its terms of service and could result in your account being suspended or banned.'
          )}
        </li>
        <li>
          {t(
            'chrome_extension_warning_unstable',
            'This method is not as reliable as native integrations and may experience random disconnections.'
          )}
        </li>
        <li>
          {t(
            'chrome_extension_warning_reconnect',
            'You may need to reconnect periodically if the session expires.'
          )}
        </li>
        <li>
          We will store your cookies securely to facilitate the connection.
        </li>
        <li>
          Postiz does not take responsibility for any issues arising or account
          termination due to the use of this method.
        </li>
      </ul>
      <div className="flex gap-[10px] mt-[8px]">
        <Button
          type="button"
          className="flex-1"
          onClick={() => {
            modals.closeCurrent();
            onConfirm();
          }}
        >
          {t('i_understand_continue', 'I understand, continue')}
        </Button>
        <Button
          type="button"
          className="flex-1 !bg-transparent border border-border text-foreground"
          onClick={() => {
            modals.closeCurrent();
            onCancel();
          }}
        >
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    </div>
  );
};

export const AddProviderComponent: FC<{
  social: Array<{
    identifier: string;
    name: string;
    toolTip?: string;
    isExternal: boolean;
    isWeb3: boolean;
    isChromeExtension?: boolean;
    extensionCookies?: Array<{
      name: string;
      domain: string;
    }>;
    customFields?: Array<{
      key: string;
      label: string;
      validation: string;
      type: 'text' | 'password';
      hint?: string;
    }>;
  }>;
  article: Array<{
    identifier: string;
    name: string;
  }>;
  invite: boolean;
  update?: () => void;
  onboarding?: boolean;
  isMobile?: boolean;
}> = (props) => {
  const { update, social, article, onboarding, isMobile } = props;
  const { isGeneral, extensionId } = useVariables();
  const toaster = useToaster();
  const router = useRouter();
  const fetch = useFetch();
  const modal = useModals();
  const getSocialLink = useCallback(
    (
        invite: boolean,
        identifier: string,
        isExternal: boolean,
        isWeb3: boolean,
        isChromeExtension?: boolean,
        customFields?: Array<{
          key: string;
          label: string;
          validation: string;
          defaultValue?: string;
          type: 'text' | 'password';
          hint?: string;
        }>
      ) =>
      async () => {
        const onboardingParam = onboarding ? 'onboarding=true' : '';
        const openWeb3 = async () => {
          const { component: Web3Providers } = web3List.find(
            (item) => item.identifier === identifier
          )!;
          const { url } = await (
            await fetch(
              `/integrations/social/${identifier}${
                onboarding ? '?onboarding=true' : ''
              }`
            )
          ).json();
          modal.openModal({
            title: `Add ${capitalize(identifier)}`,
            withCloseButton: true,
            ...(isMobile ? { removeLayout: true, fullScreen: true } : {}),
            classNames: {
              modal: 'bg-transparent text-foreground',
            },
            children: (
              <div
                {...(isMobile ? { className: 'h-full bg-black p-[20px]' } : {})}
              >
                <Web3Providers
                  onComplete={(code, newState) => {
                    window.location.href = `/integrations/social/${identifier}?code=${encodeURIComponent(code)}&state=${newState}${
                      onboarding ? '&onboarding=true' : ''
                    }`;
                  }}
                  nonce={url}
                />
              </div>
            ),
          });
          return;
        };
        const gotoIntegration = async (externalUrl?: string) => {
          // Mobile WebView: reuse the existing `externalUrl` param to
          // carry the `postiz://` deep link so the backend redirects
          // back to the iOS/Android app after OAuth completes, instead
          // of the default web redirect.
          const params = [
            `externalUrl=${encodeURIComponent(externalUrl)}`,
            onboardingParam,
            isMobile
              ? `redirectUrl=${encodeURIComponent('postiz://integrations')}`
              : '',
          ]
            .filter(Boolean)
            .join('&');
          const { url, err } = await (
            await fetch(
              `/integrations/social/${identifier}${params ? `?${params}` : ''}`
            )
          ).json();
          if (err) {
            toaster.show(
              t(
                'could_not_connect_to_platform',
                'Could not connect to the platform'
              ),
              'warning'
            );
            return;
          }

          if (invite) {
            toaster.show(
              'Invite link copied to clipboard, link will be available for 1 hour',
              'success'
            );
            modal.closeAll();
            copy(url);
            return;
          }

          if (isMobile) {
            // In the mobile WebView the OAuth provider (Google, Facebook,
            // etc.) typically refuses in-WebView sign-in. Post the URL
            // out to React Native so it can open the system browser;
            // `window.open`/`location.href` aren't reliable here because
            // RN WebView doesn't always route them through the native
            // navigation intercept. The backend redirects back to the
            // app via `postiz://` once OAuth completes.
            const rn = (window as any).ReactNativeWebView;
            if (rn && typeof rn.postMessage === 'function') {
              rn.postMessage(JSON.stringify({ type: 'open-external', url }));
              return;
            }
            window.open(url, '_blank');
            return;
          }

          window.location.href = url;
        };
        if (isWeb3) {
          openWeb3();
          return;
        }
        if (isChromeExtension) {
          const confirmed = await new Promise<boolean>((resolve) => {
            modal.openModal({
              title: t('chrome_extension_notice', 'Browser Extension Notice'),
              withCloseButton: true,
              onClose: () => resolve(false),
              children: (
                <ChromeExtensionWarning
                  onConfirm={() => {
                    resolve(true);
                  }}
                  onCancel={() => {
                    resolve(false);
                  }}
                />
              ),
            });
          });
          if (!confirmed) {
            return;
          }
          if (!extensionId || !chrome?.runtime?.sendMessage) {
            modal.openModal({
              title: t('extension_not_available_title', 'Extension Not Found'),
              withCloseButton: true,
              children: <ExtensionNotFound />,
            });
            return;
          }
          try {
            await new Promise<void>((resolve, reject) => {
              chrome.runtime.sendMessage(
                extensionId,
                { type: 'PING' },
                (response: any) => {
                  if (chrome.runtime.lastError || !response?.status) {
                    reject(new Error('Extension not reachable'));
                  } else {
                    resolve();
                  }
                }
              );
            });
          } catch {
            toaster.show(
              t(
                'extension_not_installed',
                'Postiz browser extension is not installed or not reachable.'
              ),
              'warning'
            );
            return;
          }
          try {
            const cookieResponse = await new Promise<any>((resolve, reject) => {
              chrome.runtime.sendMessage(
                extensionId,
                { type: 'GET_COOKIES', provider: identifier },
                (response: any) => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve(response);
                  }
                }
              );
            });
            if (!cookieResponse.success) {
              toaster.show(
                cookieResponse.error ||
                  t(
                    'extension_cookies_missing',
                    'Could not get cookies. Please log in to the platform first.'
                  ),
                'warning'
              );
              return;
            }
            const { url } = await (
              await fetch(
                `/integrations/social/${identifier}${
                  onboarding ? '?onboarding=true' : ''
                }`
              )
            ).json();
            modal.closeAll();
            window.location.href = `/integrations/social/${identifier}?state=${url}&code=${Buffer.from(
              JSON.stringify(cookieResponse.cookies)
            ).toString('base64')}${onboarding ? '&onboarding=true' : ''}`;
          } catch {
            toaster.show(
              t(
                'extension_communication_error',
                'Failed to communicate with the browser extension.'
              ),
              'warning'
            );
          }
          return;
        }
        if (isExternal) {
          modal.openModal({
            title: 'URL',
            withCloseButton: true,
            ...(isMobile ? { removeLayout: true, fullScreen: true } : {}),
            classNames: {
              modal: 'bg-transparent text-foreground',
            },
            children: <UrlModal gotoUrl={gotoIntegration} />,
          });
          return;
        }
        if (customFields) {
          modal.openModal({
            title: t('add_provider_title', 'Add Provider'),
            withCloseButton: true,
            ...(isMobile ? { removeLayout: true, fullScreen: true } : {}),
            classNames: {
              modal: 'bg-transparent text-foreground',
            },
            children: (
              <div
                {...(isMobile ? { className: 'h-full bg-black p-[20px]' } : {})}
              >
                <CustomVariables
                  identifier={identifier}
                  gotoUrl={(url: string) => router.push(url)}
                  variables={customFields}
                  onboarding={onboarding}
                />
              </div>
            ),
          });
          return;
        }
        await gotoIntegration();
      },
    [onboarding]
  );

  const t = useT();

  return (
    <div className="w-full flex flex-col gap-[20px] rounded-[4px] relative]">
      <div className="flex flex-col">
        <div
          className={cn(
            isMobile && 'gap-[20px] flex flex-col',
            !isMobile &&
              'grid grid-cols-5 gap-[10px] justify-items-center justify-center',
            isMobile ? {} : onboarding ? 'grid-cols-9' : 'grid-cols-5'
          )}
        >
          {social
            .filter((item) => {
              if (!props.invite) {
                return true;
              }

              return (
                !item.isExternal &&
                !item.isWeb3 &&
                !item.isChromeExtension &&
                !item.customFields
              );
            })
            .map((item) => (
              <div
                key={item.identifier}
                onClick={getSocialLink(
                  props.invite,
                  item.identifier,
                  item.isExternal,
                  item.isWeb3,
                  item.isChromeExtension,
                  item.customFields
                )}
                {...(!!item.toolTip
                  ? {
                      'data-tooltip-id': 'tooltip',
                      'data-tooltip-content': item.toolTip,
                    }
                  : {})}
                className={cn(
                  isMobile
                    ? 'flex-row h-[72px] p-[16px]'
                    : 'flex-col p-[10px] h-[100px] justify-center',
                  'w-full text-[14px] rounded-[8px] bg-muted text-foreground relative items-center flex gap-[10px] cursor-pointer'
                )}
              >
                <div>
                  {item.identifier === 'youtube' ? (
                    <img src={`/icons/platforms/youtube.svg`} />
                  ) : (
                    <img
                      className={cn(
                        'w-[32px] h-[32px]',
                        item.identifier !== 'google_my_business' &&
                          'rounded-full'
                      )}
                      src={`/icons/platforms/${item.identifier}.png`}
                    />
                  )}
                </div>
                <div
                  className={cn(
                    isMobile ? '' : 'whitespace-pre-wrap',
                    'text-center'
                  )}
                >
                  {item.name}
                  {!!item.toolTip && !isMobile && (
                    <Info
                      width={15}
                      height={15}
                      className="absolute top-[10px] end-[10px]"
                    />
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
