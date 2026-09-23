'use client';

import {
  AddProviderButton,
  CustomVariables,
} from '@gitroom/frontend/components/launches/add.provider.component';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import SafeImage from '@gitroom/react/helpers/safe.image';
import { capitalize, groupBy, orderBy } from 'lodash';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { cn } from '@gitroom/react/helpers/cn';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { Menu } from '@gitroom/frontend/components/launches/menu/menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { Integration } from '@prisma/client';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useFireEvents } from '@gitroom/helpers/utils/use.fire.events';
import { useDrag, useDrop } from 'react-dnd';
import { DNDProvider } from '@gitroom/frontend/components/launches/helpers/dnd.provider';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useIntegrationList } from '@gitroom/frontend/components/launches/helpers/use.integration.list';
import { useTheme } from 'next-themes';
import { Onboarding } from '@gitroom/frontend/components/onboarding/onboarding';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@gitroom/react/ui/avatar';
import { Card } from '@gitroom/react/ui/card';
import { ChevronUp } from 'lucide-react';

interface MenuComponentInterface {
  refreshChannel: (
    integration: Integration & {
      identifier: string;
    }
  ) => () => void;
  continueIntegration: (integration: Integration) => () => void;
  totalNonDisabledChannels: number;
  mutate: (shouldReload?: boolean) => void;
  update: (shouldReload: boolean) => void;
}

export const OpenClose: FC<{ isOpen: boolean }> = (props) => {
  const { isOpen } = props;
  return (
    <ChevronUp
      width={11}
      height={6}
      className={cn(
        'rotate-180 transition-all',
        isOpen ? 'rotate-180' : 'rotate-90'
      )}
    />
  );
};

export const MenuGroupComponent: FC<
  MenuComponentInterface & {
    changeItemGroup: (id: string, group: string) => void;
    group: {
      id: string;
      name: string;
      values: Array<
        Integration & {
          identifier: string;
          changeProfilePicture: boolean;
          changeNickName: boolean;
        }
      >;
    };
  }
> = (props) => {
  const {
    group,
    mutate,
    update,
    continueIntegration,
    totalNonDisabledChannels,
    refreshChannel,
    changeItemGroup,
  } = props;
  const [isOpen, setIsOpen] = useState(
    !!+(localStorage.getItem(group.name + '_isOpen') || '1')
  );
  const changeOpenClose = useCallback(
    (e: any) => {
      setIsOpen(!isOpen);
      localStorage.setItem(group.name + '_isOpen', isOpen ? '0' : '1');
      e.stopPropagation();
    },
    [isOpen]
  );
  const [collectedProps, drop] = useDrop(() => ({
    accept: 'menu',
    drop: (item: { id: string }) => {
      changeItemGroup(item.id, group.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  return (
    <div
      className="gap-[16px] flex flex-col relative"
      // @ts-ignore
      ref={drop}
    >
      {collectedProps.isOver && (
        <div className="absolute start-0 top-0 w-full h-full pointer-events-none">
          <div className="w-full h-full start-0 top-0 relative">
            <div className="bg-white/30 w-full h-full p-[8px] box-content rounded-md" />
          </div>
        </div>
      )}
      {!!group.name && (
        <div
          className="flex items-center gap-[5px] cursor-pointer"
          onClick={changeOpenClose}
        >
          <div>
            <OpenClose isOpen={isOpen} />
          </div>
          <div className="line-clamp-1">{group.name}</div>
        </div>
      )}
      <div
        className={cn(
          'relative grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
          !isOpen && 'hidden'
        )}
      >
        {group.values.map((integration) => (
          <MenuComponent
            key={integration.id}
            integration={integration}
            mutate={mutate}
            continueIntegration={continueIntegration}
            update={update}
            refreshChannel={refreshChannel}
            totalNonDisabledChannels={totalNonDisabledChannels}
          />
        ))}
      </div>
    </div>
  );
};

export const MenuComponent: FC<
  MenuComponentInterface & {
    integration: Integration & {
      identifier: string;
      changeProfilePicture: boolean;
      changeNickName: boolean;
      refreshNeeded?: boolean;
    };
  }
> = (props) => {
  const {
    totalNonDisabledChannels,
    continueIntegration,
    refreshChannel,
    mutate,
    update,
    integration,
  } = props;
  const user = useUser();
  const t = useT();
  const [collected, drag, dragPreview] = useDrag(() => ({
    type: 'menu',
    item: {
      id: integration.id,
    },
  }));
  return (
    <Card
      // @ts-ignore
      ref={dragPreview}
      className={cn(
        'group/profile relative flex flex-col items-center gap-3 p-4 transition-all hover:bg-accent'
      )}
    >
      <div className="absolute end-2 top-2">
        <Menu
          canChangeProfilePicture={integration.changeProfilePicture}
          canChangeNickName={integration.changeNickName}
          refreshChannel={refreshChannel}
          mutate={mutate}
          onChange={update}
          id={integration.id}
          canEnable={
            user?.totalChannels! > totalNonDisabledChannels &&
            integration.disabled
          }
          canDisable={!integration.disabled}
        />
      </div>
      <div
        // @ts-ignore
        ref={drag}
        {...(integration.refreshNeeded && {
          onClick: refreshChannel(integration),
          'data-tooltip-id': 'tooltip',
          'data-tooltip-content': t(
            'channel_disconnected_click_to_reconnect',
            'Channel disconnected, click to reconnect.'
          ),
        })}
        className={cn(
          'relative flex items-center justify-center cursor-move',
          integration.disabled && 'opacity-50',
          integration.refreshNeeded && 'cursor-pointer'
        )}
      >
        {(integration.inBetweenSteps || integration.refreshNeeded) && (
          <div
            className="absolute start-0 top-0 z-[200] h-[64px] w-[64px] cursor-pointer"
            onClick={
              integration.refreshNeeded
                ? refreshChannel(integration)
                : continueIntegration(integration)
            }
          >
            <div className="absolute start-[6px] top-[6px] z-[201] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-red-500 text-[10px]">
              !
            </div>
            <div className="absolute start-0 top-0 h-[64px] w-[64px] rounded-full bg-primary/60" />
          </div>
        )}
        <Avatar className="size-16">
          <AvatarImage
            src={integration.picture || '/no-picture.jpg'}
            alt={integration.identifier}
          />
          <AvatarFallback>{integration.name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        {integration.identifier === 'youtube' ? (
          <img
            src="/icons/platforms/youtube.svg"
            className="absolute z-10 bottom-[-2px] -end-[2px]"
            width={26}
          />
        ) : (
          <SafeImage
            src={`/icons/platforms/${integration.identifier}.png`}
            className="rounded-[8px] absolute z-10 bottom-[-2px] -end-[2px] border border-border"
            alt={integration.identifier}
            width={24}
            height={24}
          />
        )}
      </div>
      <div
        {...(integration.disabled &&
        totalNonDisabledChannels === user?.totalChannels
          ? {
              'data-tooltip-id': 'tooltip',
              'data-tooltip-content': t(
                'channel_disabled_upgrade_plan',
                'This channel is disabled, please upgrade your plan to enable it.'
              ),
            }
          : {})}
        className={cn(
          'w-full truncate text-center text-sm font-medium',
          integration.disabled && 'opacity-50'
        )}
      >
        {integration.name}
      </div>
    </Card>
  );
};

export const PlatformsComponent = () => {
  const fetch = useFetch();
  const user = useUser();
  const { billingEnabled } = useVariables();
  const router = useRouter();
  const search = useSearchParams();
  const toast = useToaster();
  const fireEvents = useFireEvents();
  const t = useT();
  const modal = useModals();
  const [reload, setReload] = useState(false);
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === 'light' ? 'light' : 'dark';
  const { isLoading, data: integrations, mutate } = useIntegrationList();

  const totalNonDisabledChannels = useMemo(() => {
    return (
      integrations?.filter((integration: any) => !integration.disabled)
        ?.length || 0
    );
  }, [integrations]);
  const changeItemGroup = useCallback(
    async (id: string, group: string) => {
      mutate(
        integrations.map((integration: any) => {
          if (integration.id === id) {
            return { ...integration, customer: { id: group } };
          }
          return integration;
        }),
        false
      );
      await fetch(`/integrations/${id}/group`, {
        method: 'PUT',
        body: JSON.stringify({ group }),
      });
      mutate();
    },
    [integrations]
  );
  const sortedIntegrations = useMemo(() => {
    return orderBy(
      integrations,
      ['type', 'disabled', 'identifier'],
      ['desc', 'asc', 'asc']
    );
  }, [integrations]);
  const menuIntegrations = useMemo(() => {
    return orderBy(
      Object.values(groupBy(sortedIntegrations, (o) => o?.customer?.id || '')).map(
        (p) => ({
          name: (p[0].customer?.name || '') as string,
          id: (p[0].customer?.id || '') as string,
          isEmpty: p.length === 0,
          values: orderBy(
            p,
            ['type', 'disabled', 'identifier'],
            ['desc', 'asc', 'asc']
          ),
        })
      ),
      ['isEmpty', 'name'],
      ['desc', 'asc']
    );
  }, [sortedIntegrations]);
  const update = useCallback(async (shouldReload: boolean) => {
    if (shouldReload) {
      setReload(true);
    }
    await mutate();
    if (shouldReload) {
      setReload(false);
    }
  }, []);
  const continueIntegration = useCallback(
    (integration: any) => async () => {
      router.push(
        `/platforms?added=${integration.identifier}&continue=${integration.id}`
      );
    },
    []
  );
  const refreshChannel = useCallback(
    (
        integration: Integration & {
          identifier: string;
          isCustomFields?: boolean;
          customFields?: any[];
        }
      ) =>
      async () => {
        // Custom-fields providers (Bluesky, etc.) have no OAuth URL to redirect
        // to: reconnect by re-entering the credentials, like the menu does.
        if (integration.isCustomFields) {
          modal.openModal({
            title: t('custom_url', 'Custom URL'),
            withCloseButton: false,
            classNames: { modal: 'md' },
            children: (
              <CustomVariables
                identifier={integration.identifier}
                gotoUrl={(url: string) => router.push(url)}
                variables={integration.customFields || []}
              />
            ),
          });
          return;
        }

        const { url } = await (
          await fetch(
            `/integrations/social/${integration.identifier}?refresh=${
              (integration as any).internalId
            }`,
            { method: 'GET' }
          )
        ).json();
        window.location.href = url;
      },
    []
  );
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

  if (isLoading || reload) {
    return (
      <div className="p-5 flex flex-1 flex-col items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <DNDProvider>
      <Onboarding />
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 p-5">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold">
            {t('platforms', 'Platforms')}
          </h1>
          <AddProviderButton update={() => update(true)} />
        </div>

        {sortedIntegrations.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-[60px]">
            <div className="flex flex-col gap-[12px] text-center">
              <img
                src={
                  mode === 'dark'
                    ? '/no-channels.svg'
                    : '/no-channels-colors.svg'
                }
                alt="No channels"
                className="mx-auto max-w-[220px]"
              />
              <div className="font-[600] text-[20px]">
                {t('no_channels', 'No channels yet')}
              </div>
              <div className="text-[14px]">{t('connect_your_accounts')}</div>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-8 select-none">
            {menuIntegrations.map((menu) => (
              <MenuGroupComponent
                changeItemGroup={changeItemGroup}
                key={menu.name}
                group={menu}
                mutate={mutate}
                continueIntegration={continueIntegration}
                update={update}
                refreshChannel={refreshChannel}
                totalNonDisabledChannels={totalNonDisabledChannels}
              />
            ))}
          </div>
        )}

        {billingEnabled && user?.isLifetime && (
          <div className="text-[13px] text-muted-foreground">
            {capitalize(user?.tier?.current || '')} tier
          </div>
        )}
      </div>
    </DNDProvider>
  );
};
