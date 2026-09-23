'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Switch } from '@gitroom/react/ui/switch';
import { Separator } from '@gitroom/react/ui/separator';
import { Skeleton } from '@gitroom/react/ui/skeleton';

interface EmailNotifications {
  sendSuccessEmails: boolean;
  sendFailureEmails: boolean;
  sendStreakEmails: boolean;
}

export const useEmailNotifications = () => {
  const fetch = useFetch();

  const load = useCallback(async () => {
    return (await fetch('/user/email-notifications')).json();
  }, []);

  return useSWR<EmailNotifications>('email-notifications', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  });
};

const EmailNotificationsComponent = () => {
  const t = useT();
  const fetch = useFetch();
  const toaster = useToaster();
  const { data, isLoading } = useEmailNotifications();

  const [localSettings, setLocalSettings] = useState<EmailNotifications>({
    sendSuccessEmails: true,
    sendFailureEmails: true,
    sendStreakEmails: true,
  });

  // Keep a ref to always have the latest state
  const settingsRef = useRef(localSettings);
  settingsRef.current = localSettings;

  // Sync local state with fetched data
  useEffect(() => {
    if (data) {
      setLocalSettings(data);
    }
  }, [data]);

  const updateSetting = useCallback(
    async (key: keyof EmailNotifications, value: boolean) => {
      // Use ref to get the latest state
      const currentSettings = settingsRef.current;
      const newData = {
        ...currentSettings,
        [key]: value,
      };

      // Update local state immediately
      setLocalSettings(newData);

      await fetch('/user/email-notifications', {
        method: 'POST',
        body: JSON.stringify(newData),
      });

      toaster.show(t('settings_updated', 'Settings updated'), 'success');
    },
    []
  );

  const rows: Array<{
    key: keyof EmailNotifications;
    title: string;
    description: string;
  }> = [
    {
      key: 'sendSuccessEmails',
      title: t('success_emails', 'Success Emails'),
      description: t(
        'success_emails_description',
        'Receive email notifications when posts are published successfully'
      ),
    },
    {
      key: 'sendFailureEmails',
      title: t('failure_emails', 'Failure Emails'),
      description: t(
        'failure_emails_description',
        'Receive email notifications when posts fail to publish'
      ),
    },
    {
      key: 'sendStreakEmails',
      title: t('streak_emails', 'Streak Reminder Emails'),
      description: t(
        'streak_emails_description',
        'Receive email reminders when your posting streak is about to end'
      ),
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t('email_notifications', 'Email Notifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-[16px]">
          <Skeleton className="h-[36px] w-full" />
          <Skeleton className="h-[36px] w-full" />
          <Skeleton className="h-[36px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('email_notifications', 'Email Notifications')}</CardTitle>
        <CardDescription>
          {t(
            'email_notifications_description',
            'Choose which emails you want to receive'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-[16px]">
        {rows.map((row, index) => (
          <React.Fragment key={row.key}>
            {index > 0 && <Separator />}
            <div className="flex items-center justify-between gap-[24px]">
              <div className="flex flex-col">
                <div className="text-sm font-medium">{row.title}</div>
                <div className="text-xs text-muted-foreground">
                  {row.description}
                </div>
              </div>
              <Switch
                checked={localSettings[row.key]}
                onCheckedChange={(checked) => updateSetting(row.key, checked)}
              />
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
};

export default EmailNotificationsComponent;
