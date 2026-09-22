'use client';

import { cn } from '@gitroom/react/helpers/cn';
import ImageWithFallback from '@gitroom/react/helpers/image.with.fallback';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { ThirdPartyListComponent } from '@gitroom/frontend/components/third-parties/third-party.list.component';
import React, { FC, useCallback, useState } from 'react';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { SVGLine } from '@gitroom/frontend/components/launches/svg.line';
import { MoreVertical, Trash2 } from 'lucide-react';

export const ThirdPartyMenuComponent: FC<{
  reload: () => void;
  tParty: { id: string };
}> = (props) => {
  const { tParty, reload } = props;
  const fetch = useFetch();
  const [show, setShow] = useState(false);
  const t = useT();
  const toaster = useToaster();

  const changeShow = () => {
    setShow((prev) => !prev);
  };

  const deleteChannel = (id: string) => async () => {
    setShow(false);
    if (
      !(await deleteDialog('Are you sure you want to delete this integration?'))
    ) {
      return;
    }

    const res = await fetch(`/third-party/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      toaster.show('Integration deleted successfully', 'success');
      reload();
    } else {
      const error = await res.json();
      console.error('Error deleting integration:', error);
    }
  };

  return (
    <div className="cursor-pointer relative select-none" onClick={changeShow}>
      <MoreVertical width={24} height={24} className="text-[#506490]" />
      {show && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-[100%] start-0 p-[8px] px-[20px] bg-border flex flex-col gap-[16px] z-[100] rounded-[8px] border border-border text-nowrap`}
        >
          <div
            className="flex gap-[12px] items-center"
            onClick={deleteChannel(tParty.id)}
          >
            <div>
              <Trash2 width={16} height={16} className="text-[#F97066]" />
            </div>
            <div className="text-[12px]">
              {t('delete_integration', 'Delete Integration')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ThirdPartyComponent = () => {
  const t = useT();
  const fetch = useFetch();

  const integrations = useCallback(async () => {
    return (await fetch('/third-party')).json();
  }, []);

  const { data, isLoading, mutate } = useSWR('third-party', integrations, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  });

  return (
    <>
      <div
        className={cn(
          'bg-card p-[20px] flex flex-col gap-[15px] transition-all',
          'w-[260px]'
        )}
      >
        <div className="flex gap-[12px] flex-col">
          <div className="flex items-center">
            <h2 className="flex-1 text-[20px] font-[500]">
              {t('integrations')}
            </h2>
          </div>
          <div className="flex flex-col gap-[10px]">
            <div className="flex-1 flex flex-col gap-[14px]">
              <div
                className={cn(
                  'gap-[16px] flex flex-col relative justify-center rounded-e-[8px]'
                )}
              >
                {!isLoading && !data?.length ? (
                  <div>No Integrations Yet</div>
                ) : (
                  data?.map((p: any) => (
                    <div
                      key={p.id}
                      className={cn('flex gap-[8px] items-center group/profile hover:bg-accent')}
                    >
                      <div className="h-full w-[4px] rounded-s-[3px] opacity-0 group-hover/profile:opacity-100 transition-opacity">
                        <SVGLine />
                      </div>
                      <div
                        className={cn(
                          'relative rounded-full flex justify-center items-center'
                        )}
                        data-tooltip-id="tooltip"
                        data-tooltip-content={p.title}
                      >
                        <ImageWithFallback
                          fallbackSrc={`/icons/third-party/${p.identifier}.png`}
                          src={`/icons/third-party/${p.identifier}.png`}
                          className="rounded-full"
                          alt={p.title}
                          width={32}
                          height={32}
                        />
                      </div>
                      <div
                        // @ts-ignore
                        role="Handle"
                        className={cn(
                          'flex-1 whitespace-nowrap text-ellipsis overflow-hidden'
                        )}
                        data-tooltip-id="tooltip"
                        data-tooltip-content={p.title}
                      >
                        {p.name}
                      </div>
                      <ThirdPartyMenuComponent reload={mutate} tParty={p} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-card flex-1 flex-col flex p-[20px] gap-[12px]">
        <ThirdPartyListComponent reload={mutate} />
      </div>
    </>
  );
};
