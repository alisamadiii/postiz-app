'use client';

import { AddProviderButton } from '@gitroom/frontend/components/launches/add.provider.component';
import { useCallback, useEffect, useMemo } from 'react';
import { orderBy } from 'lodash';
import { CalendarWeekProvider } from '@gitroom/frontend/components/launches/calendar.context';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { useSearchParams } from 'next/navigation';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useFireEvents } from '@gitroom/helpers/utils/use.fire.events';
import { GeneratorComponent } from '@gitroom/frontend/components/launches/generator/generator';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { NewPost } from '@gitroom/frontend/components/launches/new.post';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useIntegrationList } from '@gitroom/frontend/components/launches/helpers/use.integration.list';
import { PostsTable } from '@gitroom/frontend/components/launches/posts.table';

export const LaunchesComponent = () => {
  const user = useUser();
  const { billingEnabled, isGeneral } = useVariables();
  const search = useSearchParams();
  const toast = useToaster();
  const fireEvents = useFireEvents();
  const t = useT();
  const { isLoading, data: integrations, mutate } = useIntegrationList();

  const sortedIntegrations = useMemo(() => {
    return orderBy(
      integrations,
      ['type', 'disabled', 'identifier'],
      ['desc', 'asc', 'asc']
    );
  }, [integrations]);

  const update = useCallback(async () => {
    await mutate();
  }, [mutate]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (search.get('msg')) {
      toast.show(search.get('msg')!, 'success');
      window?.opener?.postMessage(
        { msg: search.get('msg')!, success: false },
        '*'
      );
    }
    if (search.get('added')) {
      fireEvents('channel_added');
      window?.opener?.postMessage(
        { msg: t('channel_added', 'Channel added'), success: true },
        '*'
      );
    }
    if (window.opener) {
      window.close();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="p-5 flex flex-1 flex-col items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  const hasChannels = sortedIntegrations.length > 0;

  return (
    <CalendarWeekProvider integrations={sortedIntegrations}>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 p-5">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold">
            {t(isGeneral ? 'calendar' : 'launches', isGeneral ? 'Calendar' : 'Launches')}
          </h1>
          <div className="flex items-center gap-2">
            <AddProviderButton update={update} />
            {hasChannels && <NewPost />}
            {hasChannels && user?.tier?.ai && billingEnabled && (
              <GeneratorComponent />
            )}
          </div>
        </div>
        <PostsTable />
      </div>
    </CalendarWeekProvider>
  );
};
