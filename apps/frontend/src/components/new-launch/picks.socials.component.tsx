'use client';

import { FC } from 'react';
import { cn } from '@gitroom/react/helpers/cn';
import SafeImage from '@gitroom/react/helpers/safe.image';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@gitroom/react/ui/tooltip';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import { useShallow } from 'zustand/react/shallow';
import { useExistingData } from '@gitroom/frontend/components/launches/helpers/use.existing.data';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import ImageWithFallback from '@gitroom/react/helpers/image.with.fallback';

export const PicksSocialsComponent: FC<{ toolTip?: boolean }> = ({
  toolTip,
}) => {
  const exising = useExistingData();

  const {
    locked,
    addOrRemoveSelectedIntegration,
    integrations,
    selectedIntegrations,
  } = useLaunchStore(
    useShallow((state) => ({
      integrations: state.integrations,
      selectedIntegrations: state.selectedIntegrations,
      addOrRemoveSelectedIntegration: state.addOrRemoveSelectedIntegration,
      locked: state.locked,
    }))
  );

  return (
    <div className={cn('flex', locked && 'opacity-50 pointer-events-none')}>
      <div className="flex flex-1">
        <div className="innerComponent flex-1 flex">
          <div className="flex flex-wrap gap-[12px] flex-1">
            {integrations
              .filter((f) => {
                if (exising.integration) {
                  return f.id === exising.integration;
                }
                return !f.inBetweenSteps && !f.disabled;
              })
              .map((integration) => (
                <Tooltip key={integration.id}>
                  <TooltipTrigger asChild>
                <div
                  className="flex gap-[8px] items-center"
                >
                  <div
                    onClick={() => {
                      if (exising.integration) {
                        return;
                      }
                      addOrRemoveSelectedIntegration(integration, {});
                    }}
                    className={cn(
                      'cursor-pointer border-[2px] relative rounded-full flex justify-center items-center bg-border filter transition-all duration-500',
                      selectedIntegrations.findIndex(
                        (p) => p.integration.id === integration.id
                      ) === -1
                        ? 'grayscale border-transparent'
                        : 'border-primary'
                    )}
                  >
                    <ImageWithFallback
                      fallbackSrc="/no-picture.jpg"
                      src={integration.picture || '/no-picture.jpg'}
                      className={cn(
                        'rounded-full transition-all min-w-[42px] border-[1.5px] min-h-[42px]',
                        selectedIntegrations.findIndex(
                          (p) => p.integration.id === integration.id
                        ) === -1
                          ? 'border-transparent'
                          : 'border-background'
                      )}
                      alt={integration.identifier}
                      width={42}
                      height={42}
                    />
                    {integration.identifier === 'youtube' ? (
                      <img
                        src="/icons/platforms/youtube.svg"
                        className="absolute z-10 bottom-0 -end-[5px] min-w-[16px]"
                        width={16}
                      />
                    ) : (
                      <SafeImage
                        src={`/icons/platforms/${integration.identifier}.png`}
                        className="rounded-[4px] absolute z-10 bottom-0 -end-[5px] min-w-[16px] min-h-[16px]"
                        alt={integration.identifier}
                        width={16}
                        height={16}
                      />
                    )}
                  </div>
                </div>
                  </TooltipTrigger>
                  {toolTip && (
                    <TooltipContent>{integration.name}</TooltipContent>
                  )}
                </Tooltip>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
