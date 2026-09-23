'use client';

import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { FC, useCallback, useState } from 'react';
import { cn } from '@gitroom/react/helpers/cn';
import dayjs from 'dayjs';
import { Bell } from 'lucide-react';
import ReactLoading from '@gitroom/frontend/components/layout/loading';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@gitroom/react/ui/popover';
function replaceLinks(text: string) {
  const urlRegex =
    /(\bhttps?:\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
  return text.replace(
    urlRegex,
    '<a class="cursor-pointer underline font-bold" target="_blank" href="$1">$1</a>'
  );
}
export const ShowNotification: FC<{
  notification: {
    createdAt: string;
    content: string;
  };
  lastReadNotification: string;
}> = (props) => {
  const { notification } = props;
  const [newNotification] = useState(
    new Date(notification.createdAt) > new Date(props.lastReadNotification)
  );
  const createdAt = dayjs(notification.createdAt);
  const isWithin24h = dayjs().diff(createdAt, 'hour') < 24;
  const fullDate = createdAt.format('MMM D, YYYY h:mm A');
  return (
    <div
      className={cn(
        `text-foreground px-[16px] py-[12px] border-b border-border last:border-b-0 transition-colors`,
        newNotification && 'font-bold bg-muted'
      )}
    >
      <div
        className="break-words"
        dangerouslySetInnerHTML={{
          __html: replaceLinks(notification.content),
        }}
      />
      <div
        className="text-[11px] mt-[4px] opacity-60 font-normal"
        title={isWithin24h ? fullDate : undefined}
      >
        {isWithin24h ? createdAt.fromNow() : fullDate}
      </div>
    </div>
  );
};
export const NotificationOpenComponent = () => {
  const fetch = useFetch();
  const loadNotifications = useCallback(async () => {
    return await (await fetch('/notifications/list')).json();
  }, []);
  const t = useT();

  const { data, isLoading } = useSWR('notifications', loadNotifications);
  return (
    <div className="flex flex-col min-h-[200px]">
      <div className="p-[16px] border-b border-border font-bold text-[16px]">
        {t('notifications', 'Notifications')}
      </div>

      <div className="flex flex-col max-h-[400px] overflow-y-auto scrollbar scrollbar-thumb-border scrollbar-track-background">
        {isLoading && (
          <div className="flex-1 flex justify-center pt-12">
            <ReactLoading type="spin" color="#fff" width={36} height={36} />
          </div>
        )}
        {!isLoading && !data.notifications.length && (
          <div className="text-center p-[16px] text-foreground flex-1 flex justify-center items-center mt-[20px]">
            {t('no_notifications', 'No notifications')}
          </div>
        )}
        {!isLoading &&
          data.notifications.map(
            (
              notification: {
                createdAt: string;
                content: string;
              },
              index: number
            ) => (
              <ShowNotification
                notification={notification}
                lastReadNotification={data.lastReadNotifications}
                key={`notifications_${index}`}
              />
            )
          )}
      </div>
    </div>
  );
};
const NotificationComponent = () => {
  const fetch = useFetch();
  const [show, setShow] = useState(false);
  const loadNotifications = useCallback(async () => {
    return await (await fetch('/notifications')).json();
  }, []);
  const { data, mutate } = useSWR('notifications-list', loadNotifications);
  const onOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        mutate({ ...data, total: 0 }, { revalidate: false });
      }
      setShow(open);
    },
    [data, mutate]
  );
  return (
    <Popover open={show} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative cursor-pointer select-none text-muted-foreground hover:text-foreground"
        >
          <Bell width={24} height={24} />
          {data && data.total > 0 && (
            <span className="absolute -top-[2px] -end-[2px] h-[8px] w-[8px] rounded-full bg-destructive ring-2 ring-sidebar" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[420px] p-0 overflow-hidden"
      >
        <NotificationOpenComponent />
      </PopoverContent>
    </Popover>
  );
};
export default NotificationComponent;
