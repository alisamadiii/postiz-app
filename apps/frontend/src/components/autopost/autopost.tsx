'use client';

import React, { FC, useCallback, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { Input } from '@gitroom/react/form/input';
import { FormProvider, useForm } from 'react-hook-form';
import { array, boolean, object, string } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Select } from '@gitroom/react/form/select';
import { PickPlatforms } from '@gitroom/frontend/components/launches/helpers/pick.platform.component';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { cn } from '@gitroom/react/helpers/cn';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { CopilotTextarea } from '@copilotkit/react-textarea';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@gitroom/react/ui/card';
import { Button } from '@gitroom/react/ui/button';
import { Switch } from '@gitroom/react/ui/switch';
import { Skeleton } from '@gitroom/react/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@gitroom/react/ui/table';
export const Autopost: FC = () => {
  const fetch = useFetch();
  const t = useT();
  const modal = useModals();
  const toaster = useToaster();
  const list = useCallback(async () => {
    return (await fetch('/autopost')).json();
  }, []);
  const { data, mutate, isLoading } = useSWR('autopost', list);
  const addWebhook = useCallback(
    (data?: any) => () => {
      modal.openModal({
        title: data ? t('edit_autopost', 'Edit Autopost') : t('add_autopost_title', 'Add Autopost'),
        withCloseButton: true,
        children: <AddOrEditWebhook data={data} reload={mutate} />,
      });
    },
    []
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
        await fetch(`/autopost/${data.id}`, {
          method: 'DELETE',
        });
        mutate();
        toaster.show(t('webhook_deleted_successfully', 'Webhook deleted successfully'), 'success');
      }
    },
    []
  );
  const changeActive = useCallback(
    (data: any) => async (ac: 'on' | 'off') => {
      await fetch(`/autopost/${data.id}/active`, {
        body: JSON.stringify({
          active: ac === 'on',
        }),
        method: 'POST',
      });
      mutate();
    },
    [mutate]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('autopost', 'Autopost')}</CardTitle>
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
        <CardTitle>{t('autopost', 'Autopost')}</CardTitle>
        <CardDescription>
          {t(
            'autopost_can_automatically_posts_your_rss_new_items_to_social_media',
            'Autopost can automatically posts your RSS new items to social media'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-[16px]">
        {!!data?.length && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('title', 'Title')}</TableHead>
                <TableHead>{t('url', 'URL')}</TableHead>
                <TableHead>{t('edit', 'Edit')}</TableHead>
                <TableHead>{t('delete', 'Delete')}</TableHead>
                <TableHead>{t('active', 'Active')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.title}</TableCell>
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
                  <TableCell>
                    <Switch
                      checked={p.active}
                      onCheckedChange={(checked) =>
                        changeActive(p)(checked ? 'on' : 'off')
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div>
          <Button type="button" onClick={addWebhook()}>
            {t('add_an_autopost', 'Add an autopost')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
const details = object().shape({
  title: string().required(),
  content: string(),
  onSlot: boolean().required(),
  syncLast: boolean().required(),
  url: string().url().required(),
  active: boolean().required(),
  addPicture: boolean().required(),
  generateContent: boolean().required(),
  integrations: array().of(
    object().shape({
      id: string().required(),
    })
  ),
});
const getOptions = (t: (key: string, fallback: string) => string) => [
  {
    label: t('all_integrations', 'All integrations'),
    value: 'all',
  },
  {
    label: t('specific_integrations', 'Specific integrations'),
    value: 'specific',
  },
];
const getOptionsChoose = (t: (key: string, fallback: string) => string) => [
  {
    label: t('yes', 'Yes'),
    value: true,
  },
  {
    label: t('no', 'No'),
    value: false,
  },
];
const getPostImmediately = (t: (key: string, fallback: string) => string) => [
  {
    label: t('post_on_next_available_slot', 'Post on the next available slot'),
    value: true,
  },
  {
    label: t('post_immediately', 'Post Immediately'),
    value: false,
  },
];
export const AddOrEditWebhook: FC<{
  data?: any;
  reload: () => void;
}> = (props) => {
  const { data, reload } = props;
  const fetch = useFetch();
  const t = useT();
  const options = getOptions(t);
  const optionsChoose = getOptionsChoose(t);
  const postImmediately = getPostImmediately(t);
  const [allIntegrations, setAllIntegrations] = useState(
    (JSON.parse(data?.integrations || '[]')?.length || 0) > 0
      ? options[1]
      : options[0]
  );
  const modal = useModals();
  const toast = useToaster();
  const [valid, setValid] = useState(data?.url || '');
  const [lastUrl, setLastUrl] = useState(data?.lastUrl || '');
  const form = useForm({
    resolver: yupResolver(details),
    values: {
      title: data?.title || '',
      content: data?.content || '',
      onSlot: data?.onSlot || false,
      syncLast: data?.syncLast || false,
      url: data?.url || '',
      // eslint-disable-next-line no-prototype-builtins
      active: data?.hasOwnProperty?.('active') ? data?.active : true,
      addPicture: data?.addPicture || false,
      // eslint-disable-next-line no-prototype-builtins
      generateContent: data?.hasOwnProperty?.('generateContent')
        ? data?.generateContent
        : true,
      integrations: JSON.parse(data?.integrations || '[]') || [],
    },
  });
  const generateContent = form.watch('generateContent');
  const content = form.watch('content');
  const url = form.watch('url');
  const syncLast = form.watch('syncLast');
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
      await fetch(data?.id ? `/autopost/${data?.id}` : '/autopost', {
        method: data?.id ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...(data?.id
            ? {
                id: data.id,
              }
            : {}),
          ...values,
          ...(!syncLast
            ? {
                lastUrl,
              }
            : {
                lastUrl: '',
              }),
        }),
      });
      toast.show(
        data?.id
          ? t('autopost_updated_successfully', 'Autopost updated successfully')
          : t('autopost_added_successfully', 'Autopost added successfully'),
        'success'
      );
      modal.closeAll();
      reload();
    },
    [data, integrations, lastUrl, syncLast]
  );
  const sendTest = useCallback(async () => {
    const url = form.getValues('url');
    try {
      const { success, url: newUrl } = await (
        await fetch(`/autopost/send?url=${encodeURIComponent(url)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ).json();
      if (!success) {
        setValid('');
        toast.show(t('could_not_use_rss_feed', 'Could not use this RSS feed'), 'warning');
        return;
      }
      toast.show(t('rss_valid', 'RSS valid!'), 'success');
      setValid(url);
      setLastUrl(newUrl);
    } catch (e: any) {
      /** empty **/
    }
  }, []);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(callBack)}>
        <div className="relative flex gap-[20px] flex-col flex-1 rounded-[4px] border border-border pt-0">
          <div>
            <Input
              label="Title"
              translationKey="label_title"
              {...form.register('title')}
            />
            <Input
              label="URL"
              translationKey="label_url"
              {...form.register('url')}
            />
            <Select
              label="Should we sync the current last post?"
              translationKey="label_should_sync_last_post"
              {...form.register('syncLast', {
                setValueAs: (value) => {
                  return value === 'true' || value === true;
                },
              })}
            >
              {optionsChoose.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              label="When should we post it?"
              translationKey="label_when_post"
              {...form.register('onSlot', {
                setValueAs: (value) => value === 'true' || value === true,
              })}
            >
              {postImmediately.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              label="Autogenerate content"
              translationKey="label_autogenerate_content"
              {...form.register('generateContent', {
                setValueAs: (value) => value === 'true' || value === true,
              })}
            >
              {optionsChoose.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </Select>
            {!generateContent && (
              <>
                <div className={`text-[14px] mb-[6px]`}>
                  {t('post_content', 'Post content')}
                </div>
                <CopilotTextarea
                  disableBranding={true}
                  className={cn(
                    '!min-h-40 !max-h-80 p-2 overflow-x-hidden scrollbar scrollbar-thumb-[#612AD5] bg-muted outline-none mb-[16px] border-border border rounded-[4px]'
                  )}
                  value={content}
                  onChange={(e) => {
                    form.setValue('content', e.target.value);
                  }}
                  placeholder={t('write_your_post_placeholder', 'Write your post...')}
                  autosuggestionsConfig={{
                    textareaPurpose: `Assist me in writing social media post`,
                    chatApiConfigs: {},
                  }}
                />
              </>
            )}
            <Select
              label="Generate Picture?"
              translationKey="label_generate_picture"
              {...form.register('addPicture', {
                setValueAs: (value) => value === 'true' || value === true,
              })}
            >
              {optionsChoose.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </Select>
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
              {valid === url && (syncLast || !!lastUrl) && (
                <Button
                  type="submit"
                  className="mt-[24px]"
                  disabled={
                    valid !== url ||
                    !form.formState.isValid ||
                    (allIntegrations.value === 'specific' &&
                      !integrations?.length)
                  }
                >
                  {t('save', 'Save')}
                </Button>
              )}
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
