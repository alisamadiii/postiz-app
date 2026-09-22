'use client';

import React, { FC, useCallback, useMemo, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gitroom/react/ui/dropdown-menu';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { TimeTable } from '@gitroom/frontend/components/launches/time.table';
import {
  Integrations,
  useCalendar,
} from '@gitroom/frontend/components/launches/calendar.context';
import { BotPicture } from '@gitroom/frontend/components/launches/bot.picture';
import { CustomerModal } from '@gitroom/frontend/components/launches/customer.modal';
import { Integration } from '@prisma/client';
import { SettingsModal } from '@gitroom/frontend/components/launches/settings.modal';
import { CustomVariables } from '@gitroom/frontend/components/launches/add.provider.component';
import { useRouter } from 'next/navigation';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { AddEditModal } from '@gitroom/frontend/components/new-launch/add.edit.modal';
import dayjs from 'dayjs';
import { ModalWrapperComponent } from '@gitroom/frontend/components/new-launch/modal.wrapper.component';
import copy from 'copy-to-clipboard';
import {
  MoreVertical,
  StickyNote,
  Repeat,
  Settings,
  Image as ImageIcon,
  UserPlus,
  Timer,
  BadgeCheck,
  Ban,
  Trash2,
} from 'lucide-react';

export const Menu: FC<{
  canEnable: boolean;
  canDisable: boolean;
  canChangeProfilePicture: boolean;
  canChangeNickName: boolean;
  refreshChannel: (
    integration: Integration & {
      identifier: string;
    }
  ) => () => void;
  id: string;
  mutate: () => void;
  onChange: (shouldReload: boolean) => void;
}> = (props) => {
  const {
    canEnable,
    canDisable,
    id,
    onChange,
    mutate,
    canChangeProfilePicture,
    canChangeNickName,
    refreshChannel,
  } = props;
  const t = useT();

  const fetch = useFetch();
  const router = useRouter();
  const { extensionId } = useVariables();
  const { integrations, reloadCalendarView } = useCalendar();
  const toast = useToaster();
  const modal = useModals();
  const [show, setShow] = useState(false);
  const findIntegration: any = useMemo(() => {
    return integrations.find((integration) => integration.id === id);
  }, [integrations, id]);
  const disableChannel = useCallback(async () => {
    if (
      !(await deleteDialog(
        t('are_you_sure_disable_channel', 'Are you sure you want to disable this channel?'),
        t('disable_channel_title', 'Disable Channel')
      ))
    ) {
      return;
    }
    await fetch('/integrations/disable', {
      method: 'POST',
      body: JSON.stringify({
        id,
      }),
    });
    toast.show(t('channel_disabled', 'Channel Disabled'), 'success');
    setShow(false);
    onChange(false);
  }, [t]);
  const deleteChannel = useCallback(async () => {
    if (
      !(await deleteDialog(
        t('are_you_sure_delete_channel', 'Are you sure you want to delete this channel?'),
        t('delete_channel_title', 'Delete Channel')
      ))
    ) {
      return;
    }
    const deleteIntegration = await fetch('/integrations', {
      method: 'DELETE',
      body: JSON.stringify({
        id,
      }),
    });
    if (deleteIntegration.status === 406) {
      toast.show(
        t('delete_posts_before_channel', 'You have to delete all the posts associated with this channel before deleting it'),
        'warning'
      );
      return;
    }
    // Clean up extension refresh token if applicable
    if (
      extensionId &&
      typeof chrome !== 'undefined' &&
      chrome?.runtime?.sendMessage
    ) {
      try {
        chrome.runtime.sendMessage(
          extensionId,
          { type: 'REMOVE_REFRESH_TOKEN', integrationId: id },
          () => {}
        );
      } catch {
        // Silently ignore
      }
    }
    toast.show(t('channel_deleted', 'Channel Deleted'), 'success');
    setShow(false);
    onChange(true);
  }, [t, extensionId, id]);

  const enableChannel = useCallback(async () => {
    await fetch('/integrations/enable', {
      method: 'POST',
      body: JSON.stringify({
        id,
      }),
    });
    toast.show(t('channel_enabled', 'Channel Enabled'), 'success');
    setShow(false);
    onChange(false);
  }, [t]);

  const editTimeTable = useCallback(() => {
    const findIntegration = integrations.find(
      (integration) => integration.id === id
    );
    modal.openModal({
      withCloseButton: true,
      closeOnEscape: false,
      closeOnClickOutside: false,
      askClose: true,
      title: t('time_table_slots', 'Time Table Slots'),
      children: <TimeTable integration={findIntegration!} mutate={mutate} />,
    });
    setShow(false);
  }, [integrations, t]);

  const copyChannelId = useCallback(
    (integration: Integrations) => async () => {
      setShow(false);
      const channelId = integration.id;
      copy(channelId);
      toast.show(t('channel_id_copied', 'Channel ID copied to clipboard'), 'success');
    },
    [t]
  );

  const createPost = useCallback(
    (integration: Integrations) => async () => {
      setShow(false);

      const { date } = await (
        await fetch(`/posts/find-slot/${integration.id}`)
      ).json();

      modal.openModal({
        id: 'add-edit-modal',
        closeOnClickOutside: false,
        removeLayout: true,
        closeOnEscape: false,
        withCloseButton: false,
        askClose: true,
        fullScreen: true,
        classNames: {
          modal: 'w-[100%] max-w-[1400px] text-foreground',
        },
        children: (
          <AddEditModal
            allIntegrations={integrations.map((p) => ({
              ...p,
            }))}
            reopenModal={createPost(integration)}
            mutate={reloadCalendarView}
            integrations={integrations}
            selectedChannels={[integration.id]}
            // focusedChannel={integration.id}
            date={dayjs.utc(date).local()}
          />
        ),
        size: '80%',
        title: ``,
      });
    },
    [integrations]
  );

  const changeBotPicture = useCallback(() => {
    const findIntegration = integrations.find(
      (integration) => integration.id === id
    );
    modal.openModal({
      classNames: {
        modal: 'w-[100%] max-w-[600px] bg-transparent text-foreground',
      },
      size: '100%',
      withCloseButton: false,
      closeOnEscape: true,
      closeOnClickOutside: true,
      children: (
        <BotPicture
          canChangeProfilePicture={canChangeProfilePicture}
          canChangeNickName={canChangeNickName}
          integration={findIntegration!}
          mutate={mutate}
        />
      ),
    });
    setShow(false);
  }, [integrations]);
  const additionalSettings = useCallback(() => {
    const findIntegration = integrations.find(
      (integration) => integration.id === id
    );
    modal.openModal({
      title: t('additional_settings', 'Additional Settings'),
      children: (
        <SettingsModal
          // @ts-ignore
          integration={findIntegration}
          onClose={() => {
            mutate();
            toast.show(t('settings_updated', 'Settings Updated'), 'success');
          }}
        />
      ),
    });
    setShow(false);
  }, [integrations, t]);
  const addToCustomer = useCallback(() => {
    const findIntegration = integrations.find(
      (integration) => integration.id === id
    );
    modal.openModal({
      classNames: {
        modal: 'md',
      },
      title: t('move_add_to_group', 'Move / Add to group'),
      withCloseButton: false,
      closeOnEscape: true,
      closeOnClickOutside: true,
      children: (
        <CustomerModal
          // @ts-ignore
          integration={findIntegration}
          onClose={() => {
            mutate();
            toast.show(t('customer_updated', 'Customer Updated'), 'success');
          }}
        />
      ),
    });
    setShow(false);
  }, [integrations, t]);
  const updateCredentials = useCallback(() => {
    modal.openModal({
      title: t('custom_url', 'Custom URL'),
      withCloseButton: false,
      classNames: {
        modal: 'md',
      },
      children: (
        <CustomVariables
          identifier={findIntegration.identifier}
          gotoUrl={(url: string) => router.push(url)}
          variables={findIntegration.customFields}
        />
      ),
    });
  }, [t]);

  return (
    <DropdownMenu open={show} onOpenChange={setShow}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex cursor-pointer select-none outline-none text-muted-foreground group-hover/profile:text-foreground"
        >
          <MoreVertical width={24} height={24} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(e) => e.stopPropagation()}
        className="min-w-[220px]"
      >
          {canDisable && !findIntegration?.refreshNeeded && (
            <div
              className="flex gap-[12px] items-center py-[8px] px-[10px] rounded-md outline-none hover:bg-accent focus:bg-accent cursor-pointer"
              onClick={createPost(findIntegration!)}
            >
              <div>
                <StickyNote
                  width={18}
                  height={18}
                  className="text-[green]"
                />
              </div>
              <div className="text-[14px]">
                {t('create_new_post', 'Create a new post')}
              </div>
            </div>
          )}
          <div
            className="flex gap-[12px] items-center py-[8px] px-[10px] rounded-md outline-none hover:bg-accent focus:bg-accent cursor-pointer"
            onClick={copyChannelId(findIntegration)}
          >
            <div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 26 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 0.749756C13.2093 0.749756 13.4155 0.802887 13.5986 0.904053L13.5996 0.905029L24.5996 6.92749C24.7962 7.03506 24.9608 7.19374 25.0752 7.38647C25.1609 7.53099 25.2159 7.69083 25.2383 7.8562L25.25 8.02319V19.9773C25.25 20.2016 25.1896 20.4221 25.0752 20.615C24.9608 20.8078 24.7963 20.9664 24.5996 21.074L13.5996 27.0955H13.5986C13.4153 27.1965 13.2093 27.2498 13 27.2498L12.8438 27.24C12.689 27.2203 12.5388 27.1712 12.4014 27.0955H12.4004L1.40039 21.074C1.20372 20.9664 1.03916 20.8078 0.924805 20.615C0.810442 20.4221 0.750028 20.2016 0.75 19.9773V8.02222L0.761719 7.85522C0.784096 7.68984 0.839135 7.53004 0.924805 7.3855C1.03917 7.19259 1.20366 7.03416 1.40039 6.92651L12.4004 0.905029L12.4014 0.904053C12.5845 0.802887 12.7907 0.749756 13 0.749756ZM24.0098 8.25659L13.5098 14.0066L13.25 14.1492V26.7195L13.9902 26.3132L18.4902 23.8484L18.75 23.7058V16.9998L18.7588 16.9333C18.7647 16.9119 18.7737 16.8911 18.7852 16.8718C18.808 16.8333 18.8406 16.8015 18.8799 16.78L24.4902 13.7087L24.75 13.5662V7.85132L24.0098 8.25659ZM24.0098 14.5427L19.5098 17.0056L19.25 17.1472V23.4333L19.9902 23.0291L24.3652 20.6365L24.625 20.4939V20.3914C24.6326 20.3798 24.6415 20.3691 24.6484 20.3572C24.6978 20.2723 24.7299 20.1784 24.7432 20.0818L24.75 19.9841V14.1375L24.0098 14.5427ZM18.3721 4.34741L13.1221 7.22241C13.0855 7.2424 13.0446 7.25359 13.0029 7.25366C12.961 7.25366 12.9196 7.2425 12.8828 7.22241L7.63281 4.34741L7.39258 4.21655L7.15234 4.34741L2.32129 6.99097L1.51953 7.43042L2.32129 7.8689L12.7598 13.5837L13 13.7146L13.2402 13.5837L23.6836 7.8689L24.4854 7.43042L23.6836 6.99097L18.8525 4.34741L18.6123 4.21655L18.3721 4.34741ZM12.9951 1.25073C12.8693 1.25073 12.7451 1.28213 12.6348 1.34253L8.71289 3.49292L7.91309 3.9314L8.71387 4.36987L12.7598 6.58374L13 6.71558L13.2402 6.58374L17.2803 4.36987L18.0811 3.9314L17.2803 3.49292L13.3555 1.34253L13.2695 1.30249C13.2115 1.27967 13.1507 1.2644 13.0889 1.25659L12.9951 1.25073ZM6.75 17.1433L6.49023 17.0017L1.99023 14.5388L1.25 14.1335V19.9734C1.24887 20.1061 1.2828 20.2371 1.34863 20.3523C1.39806 20.4387 1.46456 20.5137 1.54297 20.574L1.625 20.6296L1.63574 20.6355L6.01074 23.0242L6.75 23.4275V17.1433ZM12.75 14.1501L12.4902 14.0076L1.99023 8.25757L1.25 7.85229V13.5671L1.50977 13.7097L7.12012 16.781C7.15938 16.8025 7.19198 16.8343 7.21484 16.8728C7.22629 16.8921 7.23533 16.9129 7.24121 16.9343L7.25 17.0007V23.7058L7.50977 23.8484L12.0098 26.3132L12.75 26.7195V14.1501Z"
                  fill="#343330"
                />
                <path
                  d="M13 0.749756C13.2093 0.749756 13.4155 0.802887 13.5986 0.904053L13.5996 0.905029L24.5996 6.92749C24.7962 7.03506 24.9608 7.19374 25.0752 7.38647C25.1609 7.53099 25.2159 7.69083 25.2383 7.8562L25.25 8.02319V19.9773C25.25 20.2016 25.1896 20.4221 25.0752 20.615C24.9608 20.8078 24.7963 20.9664 24.5996 21.074L13.5996 27.0955H13.5986C13.4153 27.1965 13.2093 27.2498 13 27.2498L12.8438 27.24C12.689 27.2203 12.5388 27.1712 12.4014 27.0955H12.4004L1.40039 21.074C1.20372 20.9664 1.03916 20.8078 0.924805 20.615C0.810442 20.4221 0.750028 20.2016 0.75 19.9773V8.02222L0.761719 7.85522C0.784096 7.68984 0.839135 7.53004 0.924805 7.3855C1.03917 7.19259 1.20366 7.03416 1.40039 6.92651L12.4004 0.905029L12.4014 0.904053C12.5845 0.802887 12.7907 0.749756 13 0.749756ZM24.0098 8.25659L13.5098 14.0066L13.25 14.1492V26.7195L13.9902 26.3132L18.4902 23.8484L18.75 23.7058V16.9998L18.7588 16.9333C18.7647 16.9119 18.7737 16.8911 18.7852 16.8718C18.808 16.8333 18.8406 16.8015 18.8799 16.78L24.4902 13.7087L24.75 13.5662V7.85132L24.0098 8.25659ZM24.0098 14.5427L19.5098 17.0056L19.25 17.1472V23.4333L19.9902 23.0291L24.3652 20.6365L24.625 20.4939V20.3914C24.6326 20.3798 24.6415 20.3691 24.6484 20.3572C24.6978 20.2723 24.7299 20.1784 24.7432 20.0818L24.75 19.9841V14.1375L24.0098 14.5427ZM18.3721 4.34741L13.1221 7.22241C13.0855 7.2424 13.0446 7.25359 13.0029 7.25366C12.961 7.25366 12.9196 7.2425 12.8828 7.22241L7.63281 4.34741L7.39258 4.21655L7.15234 4.34741L2.32129 6.99097L1.51953 7.43042L2.32129 7.8689L12.7598 13.5837L13 13.7146L13.2402 13.5837L23.6836 7.8689L24.4854 7.43042L23.6836 6.99097L18.8525 4.34741L18.6123 4.21655L18.3721 4.34741ZM12.9951 1.25073C12.8693 1.25073 12.7451 1.28213 12.6348 1.34253L8.71289 3.49292L7.91309 3.9314L8.71387 4.36987L12.7598 6.58374L13 6.71558L13.2402 6.58374L17.2803 4.36987L18.0811 3.9314L17.2803 3.49292L13.3555 1.34253L13.2695 1.30249C13.2115 1.27967 13.1507 1.2644 13.0889 1.25659L12.9951 1.25073ZM6.75 17.1433L6.49023 17.0017L1.99023 14.5388L1.25 14.1335V19.9734C1.24887 20.1061 1.2828 20.2371 1.34863 20.3523C1.39806 20.4387 1.46456 20.5137 1.54297 20.574L1.625 20.6296L1.63574 20.6355L6.01074 23.0242L6.75 23.4275V17.1433ZM12.75 14.1501L12.4902 14.0076L1.99023 8.25757L1.25 7.85229V13.5671L1.50977 13.7097L7.12012 16.781C7.15938 16.8025 7.19198 16.8343 7.21484 16.8728C7.22629 16.8921 7.23533 16.9129 7.24121 16.9343L7.25 17.0007V23.7058L7.50977 23.8484L12.0098 26.3132L12.75 26.7195V14.1501Z"
                  stroke="currentColor"
                />
                <path
                  d="M13 0.749756C13.2093 0.749756 13.4155 0.802887 13.5986 0.904053L13.5996 0.905029L24.5996 6.92749C24.7962 7.03506 24.9608 7.19374 25.0752 7.38647C25.1609 7.53099 25.2159 7.69083 25.2383 7.8562L25.25 8.02319V19.9773C25.25 20.2016 25.1896 20.4221 25.0752 20.615C24.9608 20.8078 24.7963 20.9664 24.5996 21.074L13.5996 27.0955H13.5986C13.4153 27.1965 13.2093 27.2498 13 27.2498L12.8438 27.24C12.689 27.2203 12.5388 27.1712 12.4014 27.0955H12.4004L1.40039 21.074C1.20372 20.9664 1.03916 20.8078 0.924805 20.615C0.810442 20.4221 0.750028 20.2016 0.75 19.9773V8.02222L0.761719 7.85522C0.784096 7.68984 0.839135 7.53004 0.924805 7.3855C1.03917 7.19259 1.20366 7.03416 1.40039 6.92651L12.4004 0.905029L12.4014 0.904053C12.5845 0.802887 12.7907 0.749756 13 0.749756ZM24.0098 8.25659L13.5098 14.0066L13.25 14.1492V26.7195L13.9902 26.3132L18.4902 23.8484L18.75 23.7058V16.9998L18.7588 16.9333C18.7647 16.9119 18.7737 16.8911 18.7852 16.8718C18.808 16.8333 18.8406 16.8015 18.8799 16.78L24.4902 13.7087L24.75 13.5662V7.85132L24.0098 8.25659ZM24.0098 14.5427L19.5098 17.0056L19.25 17.1472V23.4333L19.9902 23.0291L24.3652 20.6365L24.625 20.4939V20.3914C24.6326 20.3798 24.6415 20.3691 24.6484 20.3572C24.6978 20.2723 24.7299 20.1784 24.7432 20.0818L24.75 19.9841V14.1375L24.0098 14.5427ZM18.3721 4.34741L13.1221 7.22241C13.0855 7.2424 13.0446 7.25359 13.0029 7.25366C12.961 7.25366 12.9196 7.2425 12.8828 7.22241L7.63281 4.34741L7.39258 4.21655L7.15234 4.34741L2.32129 6.99097L1.51953 7.43042L2.32129 7.8689L12.7598 13.5837L13 13.7146L13.2402 13.5837L23.6836 7.8689L24.4854 7.43042L23.6836 6.99097L18.8525 4.34741L18.6123 4.21655L18.3721 4.34741ZM12.9951 1.25073C12.8693 1.25073 12.7451 1.28213 12.6348 1.34253L8.71289 3.49292L7.91309 3.9314L8.71387 4.36987L12.7598 6.58374L13 6.71558L13.2402 6.58374L17.2803 4.36987L18.0811 3.9314L17.2803 3.49292L13.3555 1.34253L13.2695 1.30249C13.2115 1.27967 13.1507 1.2644 13.0889 1.25659L12.9951 1.25073ZM6.75 17.1433L6.49023 17.0017L1.99023 14.5388L1.25 14.1335V19.9734C1.24887 20.1061 1.2828 20.2371 1.34863 20.3523C1.39806 20.4387 1.46456 20.5137 1.54297 20.574L1.625 20.6296L1.63574 20.6355L6.01074 23.0242L6.75 23.4275V17.1433ZM12.75 14.1501L12.4902 14.0076L1.99023 8.25757L1.25 7.85229V13.5671L1.50977 13.7097L7.12012 16.781C7.15938 16.8025 7.19198 16.8343 7.21484 16.8728C7.22629 16.8921 7.23533 16.9129 7.24121 16.9343L7.25 17.0007V23.7058L7.50977 23.8484L12.0098 26.3132L12.75 26.7195V14.1501Z"
                  stroke="currentColor"
                />
              </svg>
            </div>
            <div className="text-[14px]">{t('copy_id', 'Copy Channel ID')}</div>
          </div>
          {canDisable &&
            findIntegration?.refreshNeeded &&
            !findIntegration.customFields && (
              <div
                className="flex gap-[12px] items-center py-[8px] px-[10px] rounded-md outline-none hover:bg-accent focus:bg-accent cursor-pointer"
                onClick={refreshChannel(findIntegration!)}
              >
                <div>
                  <Repeat
                    width={18}
                    height={18}
                    className="text-[yellow]"
                  />
                </div>
                <div className="text-[14px]">
                  {t('reconnect_channel', 'Reconnect channel')}
                </div>
              </div>
            )}
          {!!findIntegration?.isCustomFields && (
            <div
              className="flex gap-[12px] items-center py-[8px] px-[10px] rounded-md outline-none hover:bg-accent focus:bg-accent cursor-pointer"
              onClick={updateCredentials}
            >
              <div>
                <Repeat width={18} height={18} />
              </div>
              <div className="text-[14px]">
                {t('update_credentials', 'Update Credentials')}
              </div>
            </div>
          )}
          {findIntegration?.additionalSettings !== '[]' && (
            <div
              className="flex gap-[12px] items-center py-[8px] px-[10px] rounded-md outline-none hover:bg-accent focus:bg-accent cursor-pointer"
              onClick={additionalSettings}
            >
              <div>
                <Settings width={18} height={18} />
              </div>
              <div className="text-[14px]">
                {t('additional_settings', 'Additional Settings')}
              </div>
            </div>
          )}
          {(canChangeProfilePicture || canChangeNickName) && (
            <div
              className="flex gap-[12px] items-center py-[8px] px-[10px] rounded-md outline-none hover:bg-accent focus:bg-accent cursor-pointer"
              onClick={changeBotPicture}
            >
              <div>
                <ImageIcon width={18} height={18} />
              </div>
              <div className="text-[14px]">
                {t('change_bot', 'Change Bot')}{' '}
                {[
                  canChangeProfilePicture && t('picture', 'Picture'),
                  canChangeNickName && t('label_nickname', 'Nickname'),
                ]
                  .filter((f) => f)
                  .join(' / ')}
              </div>
            </div>
          )}
          <div
            className="flex gap-[12px] items-center py-[8px] px-[10px] rounded-md outline-none hover:bg-accent focus:bg-accent cursor-pointer"
            onClick={addToCustomer}
          >
            <div>
              <UserPlus width={18} height={18} />
            </div>
            <div className="text-[14px]">
              {t('move_add_to_group', 'Move / add to group')}
            </div>
          </div>
          <div
            className="flex gap-[12px] items-center py-[8px] px-[10px] rounded-md outline-none hover:bg-accent focus:bg-accent cursor-pointer"
            onClick={editTimeTable}
          >
            <div>
              <Timer width={18} height={18} />
            </div>
            <div className="text-[14px]">
              {t('edit_time_slots', 'Edit Time Slots')}
            </div>
          </div>
          {canEnable && (
            <div
              className="flex gap-[12px] items-center py-[8px] px-[10px] rounded-md outline-none hover:bg-accent focus:bg-accent cursor-pointer"
              onClick={enableChannel}
            >
              <div>
                <BadgeCheck width={16} height={16} />
              </div>
              <div className="text-[14px]">
                {t('enable_channel', 'Enable Channel')}
              </div>
            </div>
          )}

          {canDisable && (
            <div
              className="flex gap-[12px] items-center py-[8px] px-[10px] rounded-md outline-none hover:bg-accent focus:bg-accent cursor-pointer"
              onClick={disableChannel}
            >
              <div>
                <Ban width={16} height={16} />
              </div>
              <div className="text-[14px]">
                {t('disable_channel', 'Disable Channel')}
              </div>
            </div>
          )}

          <div
            className="flex gap-[12px] items-center py-[8px] px-[10px] rounded-md outline-none hover:bg-accent focus:bg-accent cursor-pointer"
            onClick={deleteChannel}
          >
            <div>
              <Trash2 width={16} height={16} className="text-[#F97066]" />
            </div>
            <div className="text-[14px]">{t('delete', 'Delete')}</div>
          </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
