'use client';

import { useCalendar, ListStateFilter } from '@gitroom/frontend/components/launches/calendar.context';
import { cn } from '@gitroom/react/helpers/cn';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { SelectCustomer } from '@gitroom/frontend/components/launches/select.customer';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import i18next from 'i18next';
import { newDayjs } from '@gitroom/frontend/components/layout/set.timezone';
import { ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';

// Helper function to get start and end dates based on display type
function getDateRange(
  display: 'day' | 'week' | 'month' | 'list',
  referenceDate?: string
) {
  const date = referenceDate ? newDayjs(referenceDate) : newDayjs();

  switch (display) {
    case 'day':
      return {
        startDate: date.format('YYYY-MM-DD'),
        endDate: date.format('YYYY-MM-DD'),
      };
    case 'week':
      return {
        startDate: date.startOf('isoWeek').format('YYYY-MM-DD'),
        endDate: date.endOf('isoWeek').format('YYYY-MM-DD'),
      };
    case 'month':
      return {
        startDate: date.startOf('month').format('YYYY-MM-DD'),
        endDate: date.endOf('month').format('YYYY-MM-DD'),
      };
    case 'list':
      return {
        startDate: date.format('YYYY-MM-DD'),
        endDate: date.format('YYYY-MM-DD'),
      };
  }
}

export const Filters = () => {
  const calendar = useCalendar();
  const t = useT();

  // Set dayjs locale based on current language
  const currentLanguage = i18next.resolvedLanguage || 'en';
  dayjs.locale();

  // Calculate display date range text
  const getDisplayText = () => {
    const startDate = newDayjs(calendar.startDate);
    const endDate = newDayjs(calendar.endDate);

    switch (calendar.display) {
      case 'day':
        return startDate.format('dddd (L)');
      case 'week':
        return `${startDate.format('L')} - ${endDate.format('L')}`;
      case 'month':
        return startDate.format('MMMM YYYY');
      default:
        return '';
    }
  };

  const setToday = useCallback(() => {
    const today = newDayjs();
    const currentRange = getDateRange(
      calendar.display as 'day' | 'week' | 'month'
    );

    // Check if we're already showing today's range
    if (
      calendar.startDate === currentRange.startDate &&
      calendar.endDate === currentRange.endDate
    ) {
      return; // No need to set the same range
    }

    calendar.setFilters({
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
      display: calendar.display as 'day' | 'week' | 'month',
      customer: calendar.customer,
    });
  }, [calendar]);

  const setDay = useCallback(() => {
    // If already in day view and showing today, don't change
    if (calendar.display === 'day') {
      const todayRange = getDateRange('day');
      if (calendar.startDate === todayRange.startDate) {
        return;
      }
    }

    const range = getDateRange('day');
    calendar.setFilters({
      startDate: range.startDate,
      endDate: range.endDate,
      display: 'day',
      customer: calendar.customer,
    });
  }, [calendar]);

  const setWeek = useCallback(() => {
    // If already in week view and showing current week, don't change
    if (calendar.display === 'week') {
      const currentWeekRange = getDateRange('week');
      if (calendar.startDate === currentWeekRange.startDate) {
        return;
      }
    }

    const range = getDateRange('week');
    calendar.setFilters({
      startDate: range.startDate,
      endDate: range.endDate,
      display: 'week',
      customer: calendar.customer,
    });
  }, [calendar]);

  const setMonth = useCallback(() => {
    // If already in month view and showing current month, don't change
    if (calendar.display === 'month') {
      const currentMonthRange = getDateRange('month');
      if (calendar.startDate === currentMonthRange.startDate) {
        return;
      }
    }

    const range = getDateRange('month');
    calendar.setFilters({
      startDate: range.startDate,
      endDate: range.endDate,
      display: 'month',
      customer: calendar.customer,
    });
  }, [calendar]);

  const setList = useCallback(() => {
    if (calendar.display === 'list') {
      return;
    }

    const range = getDateRange('list');
    calendar.setFilters({
      startDate: range.startDate,
      endDate: range.endDate,
      display: 'list',
      customer: calendar.customer,
    });
  }, [calendar]);

  const setCalendarView = useCallback(() => {
    if (calendar.display !== 'list') {
      return;
    }

    const range = getDateRange('week');
    calendar.setFilters({
      startDate: range.startDate,
      endDate: range.endDate,
      display: 'week',
      customer: calendar.customer,
    });
  }, [calendar]);

  const setCustomer = useCallback(
    (customer: string) => {
      if (calendar.customer === customer) {
        return; // No need to set the same customer
      }
      calendar.setFilters({
        startDate: calendar.startDate,
        endDate: calendar.endDate,
        display: calendar.display as 'day' | 'week' | 'month',
        customer: customer,
      });
    },
    [calendar]
  );

  const next = useCallback(() => {
    const currentStart = newDayjs(calendar.startDate);
    let nextStart: dayjs.Dayjs;

    switch (calendar.display) {
      case 'day':
        nextStart = currentStart.add(1, 'day');
        break;
      case 'week':
        nextStart = currentStart.add(1, 'week');
        break;
      case 'month':
        nextStart = currentStart.add(1, 'month');
        break;
      default:
        nextStart = currentStart.add(1, 'week');
    }

    const range = getDateRange(
      calendar.display as 'day' | 'week' | 'month',
      nextStart.format('YYYY-MM-DD')
    );
    calendar.setFilters({
      startDate: range.startDate,
      endDate: range.endDate,
      display: calendar.display as 'day' | 'week' | 'month',
      customer: calendar.customer,
    });
  }, [calendar]);

  const previous = useCallback(() => {
    const currentStart = newDayjs(calendar.startDate);
    let prevStart: dayjs.Dayjs;

    switch (calendar.display) {
      case 'day':
        prevStart = currentStart.subtract(1, 'day');
        break;
      case 'week':
        prevStart = currentStart.subtract(1, 'week');
        break;
      case 'month':
        prevStart = currentStart.subtract(1, 'month');
        break;
      default:
        prevStart = currentStart.subtract(1, 'week');
    }

    const range = getDateRange(
      calendar.display as 'day' | 'week' | 'month',
      prevStart.format('YYYY-MM-DD')
    );
    calendar.setFilters({
      startDate: range.startDate,
      endDate: range.endDate,
      display: calendar.display as 'day' | 'week' | 'month',
      customer: calendar.customer,
    });
  }, [calendar]);

  const setCurrent = useCallback(
    (type: 'day' | 'week' | 'month') => () => {
      if (type === 'day') {
        setDay();
      } else if (type === 'week') {
        setWeek();
      } else if (type === 'month') {
        setMonth();
      }
    },
    [setDay, setWeek, setMonth]
  );

  const isListView = calendar.display === 'list';

  const setListStateFilter = useCallback(
    (next: ListStateFilter) => () => {
      if (calendar.listState === next) return;
      calendar.setListState(next);
    },
    [calendar]
  );

  const listStateOptions: { value: ListStateFilter; label: string }[] = [
    { value: 'all', label: t('all', 'All') },
    { value: 'scheduled', label: t('scheduled', 'Scheduled') },
    { value: 'draft', label: t('draft', 'Draft') },
    { value: 'published', label: t('published', 'Published') },
  ];

  const previousPage = useCallback(() => {
    if (calendar.listPage > 0) {
      calendar.setListPage(calendar.listPage - 1);
    }
  }, [calendar]);

  const nextPage = useCallback(() => {
    if (calendar.listPage < calendar.listTotalPages - 1) {
      calendar.setListPage(calendar.listPage + 1);
    }
  }, [calendar]);

  return (
    <div className="text-foreground flex flex-col md:flex-row gap-[8px] items-center select-none">
      {!isListView && (
        <div className="flex flex-grow flex-row items-center gap-[10px]">
          <div className="border h-[42px] border-border bg-border gap-[1px] flex items-center rounded-[8px] overflow-hidden">
            <div
              onClick={previous}
              className="cursor-pointer text-foreground rtl:rotate-180 px-[9px] bg-card h-full flex items-center justify-center hover:text-foreground hover:bg-accent"
            >
              <ChevronLeft width={8} height={12} />
            </div>
            <div className="min-w-[200px] text-center bg-card h-full flex items-center justify-center">
              <div className="py-[3px] px-[9px] rounded-[5px] transition-all text-[14px]">
                {getDisplayText()}
              </div>
            </div>
            <div
              onClick={next}
              className="cursor-pointer text-foreground rtl:rotate-180 px-[9px] bg-card h-full flex items-center justify-center hover:text-foreground hover:bg-accent"
            >
              <ChevronRight width={8} height={12} />
            </div>
          </div>
          <div className="flex-1 text-[14px] font-[500]">
            <div className="text-center flex h-[42px]">
              <div
                onClick={setToday}
                className="hover:text-foreground hover:bg-accent py-[3px] px-[9px] flex justify-center items-center rounded-[8px] transition-all cursor-pointer text-[14px] bg-card border border-border"
              >
                {t('today', 'Today')}
              </div>
            </div>
          </div>
        </div>
      )}
      {isListView && (
        <div className="flex flex-grow flex-row items-center gap-[10px]">
          <div className="border h-[42px] border-border bg-border gap-[1px] flex items-center rounded-[8px] overflow-hidden">
            <div
              onClick={previousPage}
              className={cn(
                'text-foreground rtl:rotate-180 px-[9px] bg-card h-full flex items-center justify-center',
                calendar.listPage > 0
                  ? 'cursor-pointer hover:text-foreground hover:bg-accent'
                  : 'opacity-50 cursor-not-allowed'
              )}
            >
              <ChevronLeft width={8} height={12} />
            </div>
            <div className="min-w-[200px] text-center bg-card h-full flex items-center justify-center">
              <div className="py-[3px] px-[9px] rounded-[5px] transition-all text-[14px]">
                {t('page', 'Page')} {calendar.listPage + 1} {t('of', 'of')} {Math.max(1, calendar.listTotalPages)}
              </div>
            </div>
            <div
              onClick={nextPage}
              className={cn(
                'text-foreground rtl:rotate-180 px-[9px] bg-card h-full flex items-center justify-center',
                calendar.listPage < calendar.listTotalPages - 1
                  ? 'cursor-pointer hover:text-foreground hover:bg-accent'
                  : 'opacity-50 cursor-not-allowed'
              )}
            >
              <ChevronRight width={8} height={12} />
            </div>
          </div>
          <div className="flex flex-row p-[4px] border border-border rounded-[8px] text-[14px] font-[500]">
            {listStateOptions.map((option) => (
              <div
                key={option.value}
                onClick={setListStateFilter(option.value)}
                className={cn(
                  'pt-[6px] pb-[5px] cursor-pointer min-w-[80px] px-[12px] text-center rounded-[6px]',
                  calendar.listState === option.value &&
                    'text-foreground bg-accent'
                )}
              >
                {option.label}
              </div>
            ))}
          </div>
          <div className="flex-1" />
        </div>
      )}
      <SelectCustomer
        customer={calendar.customer as string}
        onChange={(customer: string) => setCustomer(customer)}
        integrations={calendar.integrations}
      />
      {!isListView && (
        <div className="flex flex-row p-[4px] border border-border rounded-[8px] text-[14px] font-[500]">
          <div
            className={cn(
              'pt-[6px] pb-[5px] cursor-pointer w-[74px] text-center rounded-[6px]',
              calendar.display === 'day' && 'text-foreground bg-accent'
            )}
            onClick={setDay}
          >
            {t('day', 'Day')}
          </div>
          <div
            className={cn(
              'pt-[6px] pb-[5px] cursor-pointer w-[74px] text-center rounded-[6px]',
              calendar.display === 'week' && 'text-foreground bg-accent'
            )}
            onClick={setWeek}
          >
            {t('week', 'Week')}
          </div>
          <div
            className={cn(
              'pt-[6px] pb-[5px] cursor-pointer w-[74px] text-center rounded-[6px]',
              calendar.display === 'month' && 'text-foreground bg-accent'
            )}
            onClick={setMonth}
          >
            {t('month', 'Month')}
          </div>
        </div>
      )}
      <div className="flex flex-row p-[4px] border border-border rounded-[8px] text-[14px] font-[500]">
        <div
          onClick={setCalendarView}
          className={cn(
            'pt-[6px] pb-[5px] cursor-pointer flex justify-center items-center w-[34px] text-center rounded-[6px]',
            !isListView && 'text-foreground bg-accent'
          )}
        >
          {/*calendar*/}
          <Calendar width={17} height={19} />
        </div>
        <div
          onClick={setList}
          className={cn(
            'pt-[6px] pb-[5px] flex justify-center items-center cursor-pointer w-[34px] text-center rounded-[6px]',
            isListView && 'text-foreground bg-accent'
          )}
        >
          {/*list*/}
          <List width={20} height={20} />
        </div>
      </div>
    </div>
  );
};
