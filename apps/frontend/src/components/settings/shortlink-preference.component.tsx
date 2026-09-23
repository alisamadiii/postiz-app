'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@gitroom/react/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gitroom/react/ui/select';
import { Skeleton } from '@gitroom/react/ui/skeleton';

type ShortLinkPreference = 'ASK' | 'YES' | 'NO';

interface ShortlinkPreferenceResponse {
  shortlink: ShortLinkPreference;
}

export const useShortlinkPreference = () => {
  const fetch = useFetch();

  const load = useCallback(async () => {
    return (await fetch('/settings/shortlink')).json();
  }, []);

  return useSWR<ShortlinkPreferenceResponse>('shortlink-preference', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  });
};

const ShortlinkPreferenceComponent = () => {
  const t = useT();
  const fetch = useFetch();
  const toaster = useToaster();
  const { data, isLoading, mutate } = useShortlinkPreference();

  const [localValue, setLocalValue] = useState<ShortLinkPreference>('ASK');

  // Sync local state with fetched data
  useEffect(() => {
    if (data?.shortlink) {
      setLocalValue(data.shortlink);
    }
  }, [data]);

  const handleChange = useCallback(
    async (value: string) => {
      const newValue = value as ShortLinkPreference;

      // Update local state immediately
      setLocalValue(newValue);

      await fetch('/settings/shortlink', {
        method: 'POST',
        body: JSON.stringify({ shortlink: newValue }),
      });

      mutate({ shortlink: newValue });
      toaster.show(t('settings_updated', 'Settings updated'), 'success');
    },
    [fetch, mutate, toaster, t]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('shortlink_settings', 'Shortlink Settings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[36px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('shortlink_settings', 'Shortlink Settings')}</CardTitle>
        <CardDescription>
          {t(
            'shortlink_preference_description',
            'Control how URLs in your posts are handled. Shortlinks provide click statistics.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-[24px]">
          <div className="flex flex-col">
            <div className="text-sm font-medium">
              {t('shortlink_preference', 'Shortlink Preference')}
            </div>
          </div>
          <Select value={localValue} onValueChange={handleChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASK">
                {t('shortlink_ask', 'Ask every time')}
              </SelectItem>
              <SelectItem value="YES">
                {t('shortlink_yes', 'Always shortlink')}
              </SelectItem>
              <SelectItem value="NO">
                {t('shortlink_no', 'Never shortlink')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShortlinkPreferenceComponent;
