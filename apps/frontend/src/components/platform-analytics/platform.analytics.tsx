'use client';

import useSWR from 'swr';
import { useCallback, useMemo, useState } from 'react';
import { capitalize, orderBy } from 'lodash';
import SafeImage from '@gitroom/react/helpers/safe.image';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { RenderAnalytics } from '@gitroom/frontend/components/platform-analytics/render.analytics';
import { Button } from '@gitroom/react/ui/button';
import { useRouter } from 'next/navigation';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gitroom/react/ui/select';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@gitroom/react/ui/avatar';

const allowedIntegrations = [
  'facebook',
  'instagram',
  'instagram-standalone',
  'linkedin-page',
  'tiktok',
  'tiktok-business',
  'youtube',
  'gmb',
  'pinterest',
  'threads',
  'x',
];

export const PlatformAnalytics = () => {
  const fetch = useFetch();
  const t = useT();
  const router = useRouter();
  const { disableXAnalytics } = useVariables();

  const [current, setCurrent] = useState(0);
  const [key, setKey] = useState(7);
  const [refresh, setRefresh] = useState(false);

  const load = useCallback(async () => {
    const int = (
      await (await fetch('/integrations/list')).json()
    ).integrations.filter((f: any) => {
      if (f.identifier === 'x' && disableXAnalytics) {
        return false;
      }
      return true;
    });
    return int.filter((f: any) => allowedIntegrations.includes(f.identifier));
  }, []);
  const { data, isLoading } = useSWR('analytics-list', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    fallbackData: [],
  });
  const sortedIntegrations = useMemo(() => {
    return orderBy(
      data,
      ['type', 'disabled', 'identifier'],
      ['desc', 'asc', 'asc']
    );
  }, [data]);
  const currentIntegration = useMemo(() => {
    return sortedIntegrations[current];
  }, [current, sortedIntegrations]);
  const options = useMemo(() => {
    if (!currentIntegration) {
      return [];
    }
    const arr = [];
    if (
      [
        'facebook',
        'instagram',
        'instagram-standalone',
        'linkedin-page',
        'pinterest',
        'youtube',
        'threads',
        'gmb',
        'x',
        'tiktok',
        'tiktok-business',
      ].indexOf(currentIntegration.identifier) !== -1
    ) {
      arr.push({ key: 7, value: t('7_days', '7 Days') });
    }
    if (
      [
        'facebook',
        'instagram',
        'instagram-standalone',
        'linkedin-page',
        'pinterest',
        'youtube',
        'threads',
        'gmb',
        'x',
        'tiktok',
        'tiktok-business',
      ].indexOf(currentIntegration.identifier) !== -1
    ) {
      arr.push({ key: 30, value: t('30_days', '30 Days') });
    }
    if (
      ['facebook', 'linkedin-page', 'pinterest', 'youtube', 'x', 'gmb'].indexOf(
        currentIntegration.identifier
      ) !== -1
    ) {
      arr.push({ key: 90, value: t('90_days', '90 Days') });
    }
    return arr;
  }, [currentIntegration]);
  const keys = useMemo(() => {
    if (!currentIntegration) {
      return 7;
    }
    if (options.find((p) => p.key === key)) {
      return key;
    }
    return options[0]?.key;
  }, [key, currentIntegration]);

  const selectChannel = useCallback((index: number) => {
    // Briefly unmount RenderAnalytics so the chart fully re-initializes.
    setRefresh(true);
    setTimeout(() => setRefresh(false), 10);
    setCurrent(index);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-5">
        <LoadingComponent />
      </div>
    );
  }

  if (!sortedIntegrations.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-[15px] p-5 text-center">
        <div>
          <img src="/peoplemarketplace.svg" />
        </div>
        <div className="text-[48px]">
          {t('can_t_show_analytics_yet', "Can't show analytics yet")}
          <br />
          {t(
            'you_have_to_add_social_media_channels',
            'You have to add Social Media channels'
          )}
        </div>
        <div className="text-[20px]">
          {t('supported', 'Supported:')}
          {allowedIntegrations.map((p) => capitalize(p)).join(', ')}
        </div>
        <Button
          type="button"
          size="lg"
          className="cursor-pointer"
          onClick={() => router.push('/platforms')}
        >
          {t('go_to_platforms_to_add_channels', 'Go to Platforms to add channels')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('analytics', 'Analytics')}</h1>
        <div className="flex items-center gap-2">
          <Select
            value={String(current)}
            onValueChange={(v) => selectChannel(+v)}
          >
            <SelectTrigger className="w-auto [&>span]:line-clamp-none [&>span]:overflow-visible">
              <SelectValue placeholder={t('switch_channel', 'Switch channel')} />
            </SelectTrigger>
            <SelectContent>
              {sortedIntegrations.map((integration, index) => (
                <SelectItem
                  key={integration.id}
                  value={String(index)}
                  disabled={integration.disabled}
                >
                  <span className="flex items-center gap-2">
                    <span className="relative shrink-0">
                      <Avatar className="size-6">
                        <AvatarImage
                          src={integration.picture || '/no-picture.jpg'}
                          alt={integration.name}
                        />
                        <AvatarFallback>
                          {integration.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <SafeImage
                        src={`/icons/platforms/${integration.identifier}.png`}
                        className="absolute -bottom-1 -end-1 rounded-[3px] border border-border"
                        alt={integration.identifier}
                        width={12}
                        height={12}
                      />
                    </span>
                    {integration.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!!options.length && (
            <Select value={String(keys)} onValueChange={(v) => setKey(+v)}>
              <SelectTrigger className="min-w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.key} value={String(option.key)}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {!!keys && !!currentIntegration && !refresh && (
        <RenderAnalytics integration={currentIntegration} date={keys} />
      )}
    </div>
  );
};
