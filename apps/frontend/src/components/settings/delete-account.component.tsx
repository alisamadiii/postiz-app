'use client';

import React, { FC, useCallback, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { setCookie } from '@gitroom/frontend/components/layout/layout.context';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { TrashIcon } from '@gitroom/frontend/components/ui/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@gitroom/react/ui/card';
import { Button } from '@gitroom/react/ui/button';

const DeleteAccountComponent: FC<{ isLink?: boolean }> = ({ isLink }) => {
  const t = useT();
  const fetch = useFetch();
  const toaster = useToaster();
  const { isSecured } = useVariables();
  const [loading, setLoading] = useState(false);

  const deleteAccount = useCallback(async () => {
    if (
      !(await deleteDialog(
        t(
          'delete_account_confirm',
          'Your account, organizations, channels and posts will be deleted. This action cannot be undone, are you sure?'
        ),
        t('yes_delete_my_account', 'Yes, delete my account')
      ))
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/user/delete-account', {
        method: 'POST',
      });

      if (response.status !== 200 && response.status !== 201) {
        const { message } = await response.json().catch(() => ({
          message: '',
        }));
        toaster.show(
          message ||
            t('could_not_delete_account', 'Could not delete your account'),
          'warning'
        );
        return;
      }

      if (!isSecured) {
        setCookie('auth', '', -10);
      }
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  }, [isSecured]);

  const loadingOverlay = loading && (
    <div className="text-foreground fixed start-0 top-0 bg-primary/80 z-[500] w-full h-full animate-fade flex flex-col items-center justify-center gap-[24px]">
      <div className="w-[48px] h-[48px] border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      <div className="text-[20px] font-semibold">
        {t('deleting_your_account', 'Deleting your account...')}
      </div>
      <div className="text-[14px] text-muted-foreground">
        {t(
          'deleting_your_account_description',
          'We are removing your channels and posts, this can take a while. Please don’t close this window.'
        )}
      </div>
    </div>
  );

  if (isLink) {
    return (
      <>
        {loadingOverlay}
        <div
          className="cursor-pointer flex items-center gap-[8px] text-red-400 hover:text-red-500 text-[14px]"
          onClick={deleteAccount}
        >
          <TrashIcon size={16} />
          <div>{t('delete_account', 'Delete Account')}</div>
        </div>
      </>
    );
  }

  return (
    <Card className="border border-destructive/30">
      {loadingOverlay}
      <CardHeader>
        <CardTitle className="text-destructive">
          {t('delete_account', 'Delete Account')}
        </CardTitle>
        <CardDescription>
          {t(
            'delete_account_description',
            'Your account, organizations and channels will be deleted permanently'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-[24px]">
          <div className="flex flex-col">
            <div className="text-sm font-medium">
              {t('delete_your_account', 'Delete your account')}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('delete_account_irreversible', 'This action cannot be undone')}
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            isLoading={loading}
            showSpinner={true}
            onClick={deleteAccount}
          >
            <TrashIcon size={16} />
            {t('delete_account', 'Delete Account')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeleteAccountComponent;
