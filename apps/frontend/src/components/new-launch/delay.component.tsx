'use client';

import React, { FC, useCallback, useEffect, useState } from 'react';
import { DelayIcon } from '@gitroom/frontend/components/ui/icons';
import { cn } from '@gitroom/react/helpers/cn';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import { useShallow } from 'zustand/react/shallow';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@gitroom/react/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@gitroom/react/ui/tooltip';
import { Button } from '@gitroom/react/ui/button';
import { Input } from '@gitroom/react/ui/input';

const delayOptions = [
  { value: 1, label: '1m' },
  { value: 2, label: '2m' },
  { value: 5, label: '5m' },
  { value: 10, label: '10m' },
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 120, label: '2h' },
];

export const DelayComponent: FC<{
  currentIndex: number;
  currentDelay: number;
}> = ({ currentIndex, currentDelay }) => {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const isCustomDelay =
    currentDelay > 0 && !delayOptions.some((opt) => opt.value === currentDelay);

  useEffect(() => {
    if (isOpen && isCustomDelay) {
      setCustomValue(String(currentDelay));
    } else if (isOpen && !isCustomDelay) {
      setCustomValue('');
    }
  }, [isOpen, isCustomDelay, currentDelay]);

  const { current, setInternalDelay, setGlobalDelay } = useLaunchStore(
    useShallow((state) => ({
      current: state.current,
      setGlobalDelay: state.setGlobalDelay,
      setInternalDelay: state.setInternalDelay,
    }))
  );

  const setDelay = useCallback(
    (index: number) => (minutes: number) => {
      if (current !== 'global') {
        return setInternalDelay(current, index, minutes);
      }

      return setGlobalDelay(index, minutes);
    },
    [currentIndex, current]
  );

  const handleSelectDelay = useCallback(
    (minutes: number) => {
      setDelay(currentIndex)(minutes);
      setIsOpen(false);
    },
    [currentIndex, setDelay]
  );

  const getCurrentDelayLabel = () => {
    if (!currentDelay) return null;
    const option = delayOptions.find((opt) => opt.value === currentDelay);
    return option?.label || `${currentDelay} min`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'cursor-pointer flex items-center justify-center w-[28px] h-[28px] rounded-full',
                currentDelay > 0 && 'bg-primary text-primary-foreground'
              )}
            >
              <DelayIcon />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {!currentDelay
            ? t('delay_comment', 'Delay comment')
            : `${t('delay_comment_by', 'Comment delayed by')} ${getCurrentDelayLabel()}`}
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        side="bottom"
        align="end"
        className="z-[700] w-[220px]"
      >
        <div className="grid grid-cols-4 gap-[4px]">
          {delayOptions.map((option) => (
            <button
              type="button"
              onClick={() => handleSelectDelay(option.value)}
              key={option.value}
              className={cn(
                'h-[32px] flex items-center justify-center rounded-[4px] cursor-pointer hover:bg-muted text-[13px]',
                currentDelay === option.value &&
                  'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="border-t border-border mt-[8px] pt-[8px]">
          <div className="flex gap-[4px]">
            <Input
              type="number"
              min="1"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder={t('custom_min', 'Custom min')}
              className={cn('flex-1', isCustomDelay && 'border-primary')}
            />
            <Button
              onClick={() => {
                const value = parseInt(customValue, 10);
                if (value > 0) {
                  handleSelectDelay(value);
                  setCustomValue('');
                }
              }}
            >
              {t('set', 'Set')}
            </Button>
          </div>
        </div>
        {currentDelay > 0 && (
          <Button
            variant="ghost"
            onClick={() => handleSelectDelay(0)}
            className="mt-[8px] w-full text-destructive hover:text-destructive"
          >
            {t('remove_delay', 'Remove delay')}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};
