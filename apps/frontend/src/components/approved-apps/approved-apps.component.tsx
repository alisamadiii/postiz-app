'use client';

import React, { FC, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@gitroom/react/ui/card';
import { Button } from '@gitroom/react/ui/button';
import { Separator } from '@gitroom/react/ui/separator';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@gitroom/react/ui/avatar';

const useApprovedApps = () => {
  const fetch = useFetch();
  const load = useCallback(async () => {
    return (await fetch('/user/approved-apps')).json();
  }, []);
  return useSWR('approved-apps', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });
};

export const ApprovedAppsComponent: FC = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const t = useT();
  const { data: apps, mutate } = useApprovedApps();

  const revokeApp = useCallback(
    (app: any) => async () => {
      if (
        await deleteDialog(
          t(
            'are_you_sure_revoke_access',
            `Are you sure you want to revoke access for ${app.oauthApp?.name}?`,
            { name: app.oauthApp?.name }
          )
        )
      ) {
        try {
          await fetch(`/user/approved-apps/${app.id}`, {
            method: 'DELETE',
          });
          toaster.show(
            t('access_revoked', 'Access revoked successfully'),
            'success'
          );
          mutate();
        } catch {
          toaster.show(t('failed_to_revoke', 'Failed to revoke access'), 'warning');
        }
      }
    },
    []
  );

  if (apps === undefined) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('approved_apps', 'Approved Apps')}</CardTitle>
        <CardDescription>
          {t(
            'apps_you_have_authorized',
            'Applications you have authorized to access your Postiz account.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-[16px]">
        {!apps?.length ? (
          <div className="text-sm text-muted-foreground">
            {t('no_approved_apps', 'No approved apps yet.')}
          </div>
        ) : (
          apps.map((app: any, index: number) => (
            <React.Fragment key={app.id}>
              {index > 0 && <Separator />}
              <div className="flex items-center justify-between gap-[24px]">
                <div className="flex items-center gap-[12px]">
                  <Avatar>
                    {app.oauthApp?.picture?.path && (
                      <AvatarImage
                        src={app.oauthApp.picture.path}
                        alt={app.oauthApp.name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback>
                      {app.oauthApp?.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="text-sm font-medium">
                      {app.oauthApp?.name}
                    </div>
                    {app.oauthApp?.description && (
                      <div className="text-xs text-muted-foreground">
                        {app.oauthApp.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {t('authorized_on', 'Authorized on')}{' '}
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={revokeApp(app)}
                >
                  {t('revoke', 'Revoke')}
                </Button>
              </div>
            </React.Fragment>
          ))
        )}
      </CardContent>
    </Card>
  );
};
