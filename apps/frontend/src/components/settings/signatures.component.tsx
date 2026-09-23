import React, { FC, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { Button } from '@gitroom/react/ui/button';
import { cn } from '@gitroom/react/helpers/cn';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { array, boolean, object, string } from 'yup';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CopilotTextarea } from '@copilotkit/react-textarea';
import { Select } from '@gitroom/react/form/select';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@gitroom/react/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@gitroom/react/ui/table';
export const SignaturesComponent: FC<{
  appendSignature?: (value: string) => void;
}> = (props) => {
  const { appendSignature } = props;
  const fetch = useFetch();
  const modal = useModals();
  const toaster = useToaster();
  const load = useCallback(async () => {
    return (await fetch('/signatures')).json();
  }, []);
  const { data, mutate } = useSWR('signatures', load);
  const addSignature = useCallback(
    (data?: any) => () => {
      modal.openModal({
        title: data ? 'Edit Signature' : 'Add Signature',
        withCloseButton: true,
        children: <AddOrRemoveSignature data={data} reload={mutate} />,
      });
    },
    [mutate]
  );

  const deleteSignature = useCallback(
    (data: any) => async () => {
      if (
        await deleteDialog(
          t(
            'are_you_sure_you_want_to_delete',
            `Are you sure you want to delete?`,
            { name: data.content.slice(0, 15) + '...' }
          )
        )
      ) {
        await fetch(`/signatures/${data.id}`, {
          method: 'DELETE',
        });
        mutate();
        toaster.show('Signature deleted successfully', 'success');
      }
    },
    []
  );

  const t = useT();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('signatures', 'Signatures')}</CardTitle>
        <CardDescription>
          {t(
            'you_can_add_signatures_to_your_account_to_be_used_in_your_posts',
            'You can add signatures to your account to be used in your posts.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-[16px]">
        {!!data?.length && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('content', 'Content')}</TableHead>
                <TableHead className="text-center">
                  {t('auto_add', 'Auto Add?')}
                </TableHead>
                {!!appendSignature && (
                  <TableHead className="text-center">
                    {t('actions', 'Actions')}
                  </TableHead>
                )}
                <TableHead className="text-center">
                  {t('edit', 'Edit')}
                </TableHead>
                <TableHead className="text-center">
                  {t('delete', 'Delete')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.content.slice(0, 15) + '...'}</TableCell>
                  <TableCell className="text-center">
                    {p.autoAdd ? 'Yes' : 'No'}
                  </TableCell>
                  {!!appendSignature && (
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendSignature(p.content)}
                      >
                        {t('use_signature', 'Use Signature')}
                      </Button>
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSignature(p)}
                    >
                      {t('edit', 'Edit')}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={deleteSignature(p)}
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
          <Button type="button" onClick={addSignature()}>
            {t('add_a_signature', 'Add a signature')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
const details = object().shape({
  content: string().required(),
  autoAdd: boolean().required(),
});
const AddOrRemoveSignature: FC<{
  data?: any;
  reload: () => void;
}> = (props) => {
  const { data, reload } = props;
  const toast = useToaster();
  const fetch = useFetch();
  const form = useForm({
    resolver: yupResolver(details),
    values: {
      content: data?.content || '',
      autoAdd: data?.autoAdd || false,
    },
  });
  const text = form.watch('content');
  const autoAdd = form.watch('autoAdd');
  const modal = useModals();
  const callBack = useCallback(
    async (values: any) => {
      await fetch(data?.id ? `/signatures/${data.id}` : '/signatures', {
        method: data?.id ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      });
      toast.show(
        data?.id
          ? 'Signature updated successfully'
          : 'Signature added successfully',
        'success'
      );
      modal.closeCurrent();
      reload();
    },
    [data, modal]
  );

  const t = useT();

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(callBack)}>
        <div className="relative flex gap-[20px] flex-col flex-1 rounded-[4px] pt-0">
          <button
            className="outline-none absolute end-[20px] top-[15px] mantine-UnstyledButton-root mantine-ActionIcon-root hover:bg-border cursor-pointer mantine-Modal-close mantine-1dcetaa"
            type="button"
            onClick={() => modal.closeCurrent()}
          >
            <X width={16} height={16} />
          </button>

          <div className="relative bg-muted">
            <CopilotTextarea
              disableBranding={true}
              className={cn(
                '!min-h-40 !max-h-80 p-2 overflow-x-hidden scrollbar scrollbar-thumb-muted bg-muted outline-none'
              )}
              value={text}
              onChange={(e) => {
                form.setValue('content', e.target.value);
              }}
              placeholder="Write your signature..."
              autosuggestionsConfig={{
                textareaPurpose: `Assist me in writing social media signature`,
                chatApiConfigs: {},
              }}
            />
          </div>

          <Select
            label="Auto add signature?"
            translationKey="label_auto_add_signature"
            {...form.register('autoAdd', {
              setValueAs: (value) => value === 'true',
            })}
          >
            <option value="false">
              {t('no', 'No')}
            </option>
            <option value="true">
              {t('yes', 'Yes')}
            </option>
          </Select>

          <Button type="submit">{t('save', 'Save')}</Button>
        </div>
      </form>
    </FormProvider>
  );
};
