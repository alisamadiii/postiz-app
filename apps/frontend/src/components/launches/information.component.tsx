'use client';

import React, { FC, Fragment, useCallback, useMemo } from 'react';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@gitroom/react/helpers/cn';
import SafeImage from '@gitroom/react/helpers/safe.image';
import { capitalize } from 'lodash';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { hasLinks } from '@gitroom/helpers/utils/strip.links';
import { countLength } from '@gitroom/helpers/utils/count.length';
import { SquareCheckBig, TriangleAlert, ChevronDown } from 'lucide-react';

const Valid: FC = () => {
  return (
    <SquareCheckBig width={16} height={16} className="text-[#00EB75]" />
  );
};

const Invalid: FC = () => {
  return (
    <TriangleAlert width={16} height={16} className="text-white" />
  );
};
export const InformationComponent: FC<{
  chars: Record<string, number>;
  totalChars: number;
  totalAllowedChars: number;
  isPicture: boolean;
  text?: string;
}> = ({ totalChars, totalAllowedChars, chars, isPicture, text }) => {
  const t = useT();
  const { isGlobal, selectedIntegrations, internal, currentIntegration } =
    useLaunchStore(
      useShallow((state) => ({
        isGlobal: state.current === 'global',
        selectedIntegrations: state.selectedIntegrations,
        internal: state.internal,
        currentIntegration: state.integrations.find(
          (p) => p.id === state.current
        ),
      }))
    );

  const stripLinkNames = useMemo(() => {
    if (!hasLinks(text)) {
      return [] as string[];
    }

    if (!isGlobal) {
      return currentIntegration?.stripLinks ? [currentIntegration.name] : [];
    }

    return selectedIntegrations
      .filter((p) => p.integration.stripLinks)
      .map((p) => p.integration.name);
  }, [text, isGlobal, currentIntegration, selectedIntegrations]);

  const showStripLinkWarning = stripLinkNames.length > 0;

  const countFor = useCallback(
    (identifier?: string) => countLength(identifier || '', text || ''),
    [text]
  );

  const currentChars = countFor(currentIntegration?.identifier);

  const isInternal = useMemo(() => {
    if (!isGlobal) {
      return [];
    }
    return selectedIntegrations.map((p) => {
      const findIt = internal.find(
        (a) => a.integration.id === p.integration.id
      );

      return !!findIt;
    });
  }, [isGlobal, internal, selectedIntegrations]);

  const isValid = useMemo(() => {
    if (showStripLinkWarning) {
      return false;
    }

    if (!isPicture && !totalChars) {
      return false;
    }

    if (currentChars > totalAllowedChars && !isGlobal) {
      return false;
    }

    if (currentChars <= totalAllowedChars && !isGlobal) {
      return true;
    }

    if (
      selectedIntegrations.some((p, index) => {
        if (isInternal[index]) {
          return false;
        }

        return (
          countFor(p.integration.identifier) >
          (chars?.[p.integration.id] || 0)
        );
      })
    ) {
      return false;
    }

    return true;
  }, [
    totalAllowedChars,
    totalChars,
    currentChars,
    countFor,
    isInternal,
    isPicture,
    chars,
    showStripLinkWarning,
  ]);

  const globalDisplayLimit = useMemo(() => {
    if (!isGlobal || !selectedIntegrations.length) {
      return null;
    }

    // Get all limits from non-internal integrations, sorted ascending
    const limits = selectedIntegrations
      .map((p, index) => ({
        limit: chars?.[p.integration.id] || 0,
        count: countFor(p.integration.identifier),
        isInternal: isInternal[index],
      }))
      .filter((item) => !item.isInternal && item.limit > 0)
      .sort((a, b) => a.limit - b.limit);

    if (!limits.length) {
      return null;
    }

    // Find the smallest limit that hasn't been exceeded yet
    // If all are exceeded, show the smallest one
    const validLimit = limits.find((item) => item.count <= item.limit);
    return validLimit ?? limits[0];
  }, [isGlobal, selectedIntegrations, chars, isInternal, countFor]);

  return (
    <div
      className={cn(
        'group rounded-[6px] gap-[4px] h-[30px] px-[6px] flex justify-center items-center relative',
        isValid ? 'border border-muted' : 'bg-[#FF3F3F]'
      )}
    >
      {isValid ? <Valid /> : <Invalid />}

      {!isGlobal && (
        <div className={cn("text-[10px] font-[600] flex justify-center items-center", !isValid && 'text-white')}>
          {currentChars}/{totalAllowedChars}
        </div>
      )}
      {isGlobal && globalDisplayLimit !== null && (
        <div className={cn("text-[10px] font-[600] flex justify-center items-center", !isValid && 'text-white')}>
          {globalDisplayLimit.count}/{globalDisplayLimit.limit}
        </div>
      )}
      {((isGlobal && selectedIntegrations.length) || !isValid) && (
        <ChevronDown
          width={16}
          height={16}
          className={cn('group-hover:rotate-180', !isValid && 'text-white')}
        />
      )}
      {((isGlobal && selectedIntegrations.length) || !isValid) && (
        <div
          className={cn(
            'z-[300] hidden rounded-[12px] bg-card group-hover:flex absolute end-0 bottom-[100%] mb-[5px] p-[12px] flex-col',
            isValid ? 'border border-muted' : 'border border-[#FF3F3F]'
          )}
        >
          {!isPicture && !totalChars && (
            <div
              className={cn(
                'text-sm text-[#FF3F3F] whitespace-nowrap',
                isGlobal && selectedIntegrations.length && 'mb-[12px]'
              )}
            >
              {t('your_post_should_have_at_least_one_character_or_one_image', 'Your post should have at least one character or one image.')}
            </div>
          )}
          {isGlobal && (
            <div className="grid grid-cols-[auto_auto_auto] text-[14px] font-[500] gap-[8px] items-center">
              {selectedIntegrations.map((p, index) => (
                <Fragment key={p.integration.id}>
                  <div>
                    <SafeImage
                      src={`/icons/platforms/${p.integration.identifier}.png`}
                      alt={p.integration.name}
                      className="rounded-[4px] w-[16px] h-[16px] min-w-[16px] min-h-[16px]"
                      width={16}
                      height={16}
                    />
                  </div>
                  <div
                    className={cn(
                      'whitespace-nowrap',
                      isInternal?.[index]
                        ? ''
                        : countFor(p.integration.identifier) >
                          (chars?.[p.integration.id] || 0)
                        ? 'text-[#FF3F3F]'
                        : ''
                    )}
                  >
                    {p.integration.name} (
                    {capitalize(p.integration.identifier.split('-')[0])}):
                  </div>
                  <div
                    className={cn(
                      'whitespace-nowrap',
                      isInternal?.[index]
                        ? ''
                        : countFor(p.integration.identifier) >
                          (chars?.[p.integration.id] || 0)
                        ? 'text-[#FF3F3F]'
                        : ''
                    )}
                  >
                    {isInternal?.[index]
                      ? t('internal_edit', 'Internal Edit')
                      : `${countFor(p.integration.identifier)}/${
                          chars?.[p.integration.id] || 0
                        }`}
                  </div>
                </Fragment>
              ))}
            </div>
          )}
          {showStripLinkWarning && (
            <div
              className={cn(
                'text-sm text-[#FF3F3F] whitespace-nowrap',
                ((isGlobal && selectedIntegrations.length) ||
                  (!isPicture && !totalChars)) &&
                  'mt-[12px]'
              )}
            >
              {t('links_will_be_removed_from', 'Links will be removed from')}:{' '}
              {stripLinkNames.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
