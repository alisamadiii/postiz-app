'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '../lib/utils';
import { buttonVariants } from './button';

export interface CalendarProps {
  value?: Date;
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function Calendar({ value, onSelect, disabled, className }: CalendarProps) {
  const [viewMonth, setViewMonth] = React.useState(() =>
    dayjs(value || undefined).startOf('month')
  );

  React.useEffect(() => {
    if (value) {
      setViewMonth(dayjs(value).startOf('month'));
    }
  }, [value?.getTime()]);

  const days = React.useMemo(() => {
    // Monday-first grid, 6 rows x 7 cols
    const startOffset = (viewMonth.day() + 6) % 7;
    const gridStart = viewMonth.subtract(startOffset, 'day');
    return Array.from({ length: 42 }, (_, i) => gridStart.add(i, 'day'));
  }, [viewMonth]);

  const selected = value ? dayjs(value) : null;
  const today = dayjs();

  return (
    <div data-slot="calendar" className={cn('w-fit p-3', className)}>
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          aria-label="Previous month"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'size-7'
          )}
          onClick={() => setViewMonth((m) => m.subtract(1, 'month'))}
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-sm font-medium">
          {viewMonth.format('MMMM YYYY')}
        </div>
        <button
          type="button"
          aria-label="Next month"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'size-7'
          )}
          onClick={() => setViewMonth((m) => m.add(1, 'month'))}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="text-muted-foreground flex size-9 items-center justify-center text-[0.8rem] font-normal"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const isSelected = !!selected && day.isSame(selected, 'day');
          const isToday = day.isSame(today, 'day');
          const isOutside = !day.isSame(viewMonth, 'month');
          const isDisabled = !!disabled?.(day.toDate());

          return (
            <button
              key={day.format('YYYY-MM-DD')}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect?.(day.toDate())}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'size-9 p-0 font-normal',
                isToday && !isSelected && 'bg-accent text-accent-foreground',
                isSelected &&
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                isOutside && !isSelected && 'text-muted-foreground opacity-50',
                isDisabled && 'pointer-events-none opacity-30'
              )}
            >
              {day.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
