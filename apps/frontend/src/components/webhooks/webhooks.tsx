'use client';

import React, { FC, useCallback, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { Input } from '@gitroom/react/form/input';
import { FormProvider, useForm } from 'react-hook-form';
import { array, object, string } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Select } from '@gitroom/react/form/select';
import { PickPlatforms } from '@gitroom/frontend/components/launches/helpers/pick.platform.component';
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
import { Skeleton } from '@gitroom/react/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@gitroom/react/ui/table';

export const Webhooks: FC = () => {
  const fetch = useFetch();
  const user = useUser();
  const modal = useModals();
  const toaster = useToaster();
  const t = useT();
  const list = useCallback(async () => {
    return (await fetch('/webhooks')).json();
  }, []);
  const { data, mutate, isLoading } = useSWR('webhooks', list);
  const addWebhook = useCallback(
    (data?: any) => () => {
      modal.openModal({
        title: data ? t('update_webhook', 'Update webhook') : t('add_webhook', 'Add webhook'),
        withCloseButton: true,
        children: <AddOrEditWebhook data={data} reload={mutate} />,
      });
    },
    [t]
  );
  const deleteHook = useCallback(
    (data: any) => async () => {
      if (
        await deleteDialog(
          t(
            'are_you_sure_you_want_to_delete',
            `Are you sure you want to delete ${data.name}?`,
            { name: data.name }
          )
        )
      ) {
        await fetch(`/webhooks/${data.id}`, {
          method: 'DELETE',
        });
        mutate();
        toaster.show(t('webhook_deleted_successfully', 'Webhook deleted successfully'), 'success');
      }
    },
    []
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('webhooks', 'Webhooks')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-[16px]">
          <Skeleton className="h-[36px] w-full" />
          <Skeleton className="h-[36px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('webhooks', 'Webhooks')} ({data?.length || 0}/
          {user?.tier?.webhooks})
        </CardTitle>
        <CardDescription>
          {t(
            'webhooks_are_a_way_to_get_notified_when_something_happens_in_postiz_via_an_http_request',
            'Webhooks are a way to get notified when something happens in Postiz via\n        an HTTP request.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-[16px]">
        {!!data?.length && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name', 'Name')}</TableHead>
                <TableHead>{t('url', 'URL')}</TableHead>
                <TableHead>{t('edit', 'Edit')}</TableHead>
                <TableHead>{t('delete', 'Delete')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.url}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addWebhook(p)}
                    >
                      {t('edit', 'Edit')}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={deleteHook(p)}
                    >
                      {t('delete', 'Delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div>
          <Button type="button" onClick={addWebhook()}>
            {t('add_a_webhook', 'Add a webhook')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
const details = object().shape({
  name: string().required(),
  url: string().url().required(),
  integrations: array(),
});
const getWebhookOptions = (t: (key: string, fallback: string) => string) => [
  {
    label: t('all_integrations', 'All integrations'),
    value: 'all',
  },
  {
    label: t('specific_integrations', 'Specific integrations'),
    value: 'specific',
  },
];
export const AddOrEditWebhook: FC<{
  data?: any;
  reload: () => void;
}> = (props) => {
  const { data, reload } = props;
  const fetch = useFetch();
  const t = useT();
  const options = getWebhookOptions(t);
  const [allIntegrations, setAllIntegrations] = useState(
    (data?.integrations?.length || 0) > 0 ? options[1] : options[0]
  );
  const modal = useModals();
  const toast = useToaster();
  const form = useForm({
    resolver: yupResolver(details),
    values: {
      name: data?.name || '',
      url: data?.url || '',
      integrations: data?.integrations?.map((p: any) => p.integration) || [],
    },
  });
  const integrations = form.watch('integrations');
  const integration = useCallback(async () => {
    return (await fetch('/integrations/list')).json();
  }, []);
  const changeIntegration = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const findValue = options.find(
        (option) => option.value === e.target.value
      )!;
      setAllIntegrations(findValue);
      if (findValue.value === 'all') {
        form.setValue('integrations', []);
      }
    },
    []
  );
  const { data: dataList, isLoading } = useSWR('integrations', integration, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  });
  const callBack = useCallback(
    async (values: any) => {
      await fetch('/webhooks', {
        method: data?.id ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...(data?.id
            ? {
                id: data.id,
              }
            : {}),
          ...values,
        }),
      });
      toast.show(
        data?.id
          ? t('webhook_updated_successfully', 'Webhook updated successfully')
          : t('webhook_added_successfully', 'Webhook added successfully'),
        'success'
      );
      modal.closeAll();
      reload();
    },
    [data, integrations]
  );
  const sendTest = useCallback(async () => {
    const url = form.getValues('url');
    toast.show(t('webhook_sent', 'Webhook send'), 'success');
    try {
      await fetch(`/webhooks/send?url=${encodeURIComponent(url)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            id: 'cm6tcts4f0005qcwit25cis26',
            content: 'This is the first post to instagram',
            publishDate: '2025-02-06T13:09:00.000Z',
            releaseURL: 'https://facebook.com/release/release',
            state: 'PUBLISHED',
            integration: {
              id: 'cm6s4uyou0001i2r47pxix6z1',
              name: 'test',
              providerIdentifier: 'instagram',
              picture: 'https://uploads.gitroom.com/F6LSCD8wrrQ.jpeg',
              type: 'social',
            },
          },
          {
            id: 'cm6tcts4f0005qcwit25cis26',
            content: 'This is the second post to facebook',
            publishDate: '2025-02-06T13:09:00.000Z',
            releaseURL: 'https://facebook.com/release2/release2',
            state: 'PUBLISHED',
            integration: {
              id: 'cm6s4uyou0001i2r47pxix6z1',
              name: 'test2',
              providerIdentifier: 'facebook',
              picture: 'https://uploads.gitroom.com/F6LSCD8wrrQ.jpeg',
              type: 'social',
            },
          },
        ]),
      });
    } catch (e: any) {
      /** empty **/
    }
  }, []);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(callBack)}>
        <div className="relative flex gap-[20px] flex-col flex-1 rounded-[4px] pt-0">
          <div>
            <Input
              label="Name"
              translationKey="label_name"
              {...form.register('name')}
            />
            <Input
              label="URL"
              translationKey="label_url"
              {...form.register('url')}
            />
            <Select
              value={allIntegrations.value}
              name="integrations"
              label="Integrations"
              translationKey="label_integrations"
              disableForm={true}
              onChange={changeIntegration}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {allIntegrations.value === 'specific' && dataList && !isLoading && (
              <PickPlatforms
                integrations={dataList.integrations}
                selectedIntegrations={integrations as any[]}
                onChange={(e) => form.setValue('integrations', e)}
                singleSelect={false}
                toolTip={true}
                isMain={true}
              />
            )}
            <div className="flex gap-[10px]">
              <Button
                type="submit"
                className="mt-[24px]"
                disabled={
                  !form.formState.isValid ||
                  (allIntegrations.value === 'specific' &&
                    !integrations?.length)
                }
              >
                {t('save', 'Save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="mt-[24px]"
                onClick={sendTest}
                disabled={
                  !form.formState.isValid ||
                  (allIntegrations.value === 'specific' &&
                    !integrations?.length)
                }
              >
                {t('send_test', 'Send Test')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
