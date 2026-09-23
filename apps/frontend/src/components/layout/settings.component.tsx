'use client';

import React, {
  FC,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { Settings } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';

import { UserDetailDto } from '@gitroom/nestjs-libraries/dtos/users/user.details.dto';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { cn } from '@gitroom/react/helpers/cn';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { Button } from '@gitroom/react/ui/button';
import { ApprovedAppsComponent } from '@gitroom/frontend/components/approved-apps/approved-apps.component';
import { Autopost } from '@gitroom/frontend/components/autopost/autopost';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { showMediaBox } from '@gitroom/frontend/components/media/media.component';
import { PublicComponent } from '@gitroom/frontend/components/public-api/public.component';
import { Sets } from '@gitroom/frontend/components/sets/sets';
import { GlobalSettings } from '@gitroom/frontend/components/settings/global.settings';
import { SignaturesComponent } from '@gitroom/frontend/components/settings/signatures.component';
import { TeamsComponent } from '@gitroom/frontend/components/settings/teams.component';
import { Webhooks } from '@gitroom/frontend/components/webhooks/webhooks';

export const SettingsPopup: FC<{
  getRef?: Ref<any>;
}> = (props) => {
  const { isGeneral } = useVariables();
  const { getRef } = props;
  const fetch = useFetch();
  const toast = useToaster();
  const swr = useSWRConfig();
  const user = useUser();
  const resolver = useMemo(() => {
    return classValidatorResolver(UserDetailDto);
  }, []);
  const form = useForm({
    resolver,
  });
  const picture = form.watch('picture');
  const modal = useModals();
  const close = useCallback(() => {
    return modal.closeAll();
  }, []);
  const url = useSearchParams();
  const showLogout = !url.get('onboarding') || user?.tier?.current === 'FREE';
  const loadProfile = useCallback(async () => {
    const personal = await (await fetch('/user/personal')).json();
    form.setValue('fullname', personal.name || '');
    form.setValue('bio', personal.bio || '');
    form.setValue('picture', personal.picture);
  }, []);
  const openMedia = useCallback(() => {
    showMediaBox((values) => {
      form.setValue('picture', values);
    });
  }, []);
  const remove = useCallback(() => {
    form.setValue('picture', null);
  }, []);

  const submit = useCallback(async (val: any) => {
    await fetch('/user/personal', {
      method: 'POST',
      body: JSON.stringify(val),
    });
    if (getRef) {
      return;
    }
    toast.show(t('profile_updated', 'Profile updated'));
    close();
  }, []);

  const [tab, setTab] = useState('global_settings');

  const t = useT();
  const list = useMemo(() => {
    const arr = [];
    arr.push({
      tab: 'global_settings',
      label: t('global_settings', 'Global Settings'),
    });
    // Populate tabs based on user permissions
    if (user?.tier?.team_members && isGeneral) {
      arr.push({ tab: 'teams', label: t('teams', 'Teams') });
    }
    if (user?.tier?.webhooks) {
      arr.push({ tab: 'webhooks', label: t('webhooks_1', 'Webhooks') });
    }
    if (user?.tier?.autoPost) {
      arr.push({ tab: 'autopost', label: t('auto_post', 'Auto Post') });
    }
    if (user?.tier.current !== 'FREE') {
      arr.push({ tab: 'sets', label: t('sets', 'Sets') });
    }
    if (user?.tier.current !== 'FREE') {
      arr.push({ tab: 'signatures', label: t('signatures', 'Signatures') });
    }
    if (user?.tier?.public_api && isGeneral && showLogout) {
      arr.push({ tab: 'api', label: t('developers', 'Developers') });
    }
    arr.push({
      tab: 'approved_apps',
      label: t('approved_apps', 'Approved Apps'),
    });

    return arr;
  }, [user, isGeneral, showLogout, t]);

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <>
      <div className="flex w-[260px] flex-col p-[20px] transition-all">
        <div className="flex flex-1 flex-col gap-[4px]">
          {list.map(({ tab: tabKey, label }) => (
            <Button
              key={tabKey}
              type="button"
              variant={tabKey === tab ? 'secondary' : 'ghost'}
              className={cn(
                'justify-start',
                tabKey !== tab && 'text-muted-foreground',
              )}
              onClick={() => setTab(tabKey)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-[12px] p-[20px]">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(submit)}>
            {!!getRef && (
              <button type="submit" className="hidden" ref={getRef}></button>
            )}
            <div
              className={cn(
                'relative mx-auto flex w-full flex-col gap-[24px]',
                !getRef && 'rounded-[4px]',
              )}
            >
              {tab === 'global_settings' && (
                <div>
                  <GlobalSettings />
                </div>
              )}
              {tab === 'teams' && !!user?.tier?.team_members && isGeneral && (
                <div>
                  <TeamsComponent />
                </div>
              )}

              {tab === 'webhooks' && !!user?.tier?.webhooks && (
                <div>
                  <Webhooks />
                </div>
              )}

              {tab === 'autopost' && !!user?.tier?.autoPost && (
                <div>
                  <Autopost />
                </div>
              )}

              {tab === 'sets' && user?.tier.current !== 'FREE' && (
                <div>
                  <Sets />
                </div>
              )}

              {tab === 'signatures' && user?.tier.current !== 'FREE' && (
                <div>
                  <SignaturesComponent />
                </div>
              )}

              {tab === 'api' &&
                !!user?.tier?.public_api &&
                isGeneral &&
                showLogout && (
                  <div>
                    <PublicComponent />
                  </div>
                )}

              {tab === 'approved_apps' && (
                <div>
                  <ApprovedAppsComponent />
                </div>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </>
  );
};
export const SettingsComponent = () => {
  const settings = useModals();
  const user = useUser();
  const openModal = useCallback(() => {
    if (user?.tier.current !== 'FREE') {
      return;
    }
    settings.openModal({
      children: (
        <div className="border-border bg-muted relative mx-auto flex w-[500px] flex-1 flex-col gap-[20px] rounded-[4px] border p-[16px]">
          <SettingsPopup />
        </div>
      ),
      classNames: {
        modal: 'bg-transparent text-foreground',
      },
      withCloseButton: false,
      size: '100%',
    });
  }, [user]);
  return (
    <Link href="/settings" onClick={openModal}>
      <Settings
        width={40}
        height={40}
        className="relative z-[200] cursor-pointer"
      />
    </Link>
  );
};
