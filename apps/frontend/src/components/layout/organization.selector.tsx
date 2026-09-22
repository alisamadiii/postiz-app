'use client';

import React, { FC, useCallback, useMemo } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { cn } from '@gitroom/react/helpers/cn';
import { CircleUserRound } from 'lucide-react';
export const OrganizationSelector: FC<{ asOpenSelect?: boolean }> = ({
  asOpenSelect,
}) => {
  const fetch = useFetch();
  const user = useUser();
  const load = useCallback(async () => {
    return await (await fetch('/user/organizations')).json();
  }, []);
  const { isLoading, data } = useSWR('organizations', load, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    revalidateOnReconnect: false,
  });
  const current = useMemo(() => {
    return data?.find((d: any) => d.id === user?.orgId);
  }, [data]);
  const withoutCurrent = useMemo(() => {
    return data?.filter((d: any) => d.id !== user?.orgId);
  }, [current, data]);
  const changeOrg = useCallback(
    (org: { name: string; id: string }) => async () => {
      await fetch('/user/change-org', {
        method: 'POST',
        body: JSON.stringify({
          id: org.id,
        }),
      });
      window.location.reload();
    },
    []
  );
  if (isLoading || (!isLoading && data?.length === 1)) {
    return null;
  }
  return (
    <>
      <div className="hover:text-foreground">
        <div className="group text-[12px] relative">
          {asOpenSelect && (
            <div className="bg-primary !flex !relative max-w-[500px] mx-auto py-[12px] px-[12px]">Select Organization</div>
          )}
          {!asOpenSelect && (
            <div className="flex items-center gap-[6px]">
              <CircleUserRound
                className={user?.tier.current === 'FREE' ? 'animate-bounce drop-shadow-glow': ''}
                width={24}
                height={24}
              />
              {!!current?.name && (
                <div className="max-w-[240px] truncate">{current?.name}</div>
              )}
            </div>
          )}
          {data?.length > 1 && (
            <div
              className={cn(
                'hidden py-[12px] px-[12px] group-hover:flex absolute top-[100%] end-0 w-max max-w-[400px] bg-secondary border-border border gap-[12px] cursor-pointer flex-col',
                asOpenSelect ? '!flex !relative max-w-[500px] mx-auto mb-[10px]' : '',
              )}
            >
              {withoutCurrent?.map(
                (org: {
                  name: string;
                  id: string;
                  users: { role: 'SUPERADMIN' | 'ADMIN' | 'USER' }[];
                }) => (
                  <div
                    key={org?.id}
                    onClick={changeOrg(org)}
                    className="whitespace-nowrap truncate"
                  >
                    {org?.name}
                    {!!org?.users?.[0]?.role && (
                      <span className="text-muted-foreground">
                        {' '}
                        (
                        {org?.users?.[0]?.role === 'SUPERADMIN'
                          ? 'Super-Admin'
                          : org?.users?.[0]?.role === 'ADMIN'
                          ? 'Admin'
                          : 'User'}
                        )
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
      {!asOpenSelect && <div className="w-[1px] h-[20px] bg-border" />}
    </>
  );
};
