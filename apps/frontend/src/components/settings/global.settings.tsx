'use client';

import React from 'react';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import dynamic from 'next/dynamic';
import EmailNotificationsComponent from '@gitroom/frontend/components/settings/email-notifications.component';
import ShortlinkPreferenceComponent from '@gitroom/frontend/components/settings/shortlink-preference.component';
import DeleteAccountComponent from '@gitroom/frontend/components/settings/delete-account.component';

const MetricComponent = dynamic(
  () => import('@gitroom/frontend/components/settings/metric.component'),
  {
    ssr: false,
  }
);

export const GlobalSettings = () => {
  const t = useT();
  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex flex-col gap-[4px]">
        <h3 className="text-2xl font-semibold">
          {t('global_settings', 'Global Settings')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(
            'global_settings_description',
            'Manage your preferences, notifications and account'
          )}
        </p>
      </div>
      <MetricComponent />
      <EmailNotificationsComponent />
      <ShortlinkPreferenceComponent />
      <DeleteAccountComponent />
    </div>
  );
};
