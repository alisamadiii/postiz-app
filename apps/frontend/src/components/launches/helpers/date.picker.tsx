import { FC, useCallback, useState } from 'react';
import dayjs from 'dayjs';
import { isUSCitizen } from './isuscitizen.utils';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { newDayjs } from '@gitroom/frontend/components/layout/set.timezone';
import { CalendarIcon } from '@gitroom/frontend/components/ui/icons';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@gitroom/react/ui/popover';
import { Calendar } from '@gitroom/react/ui/calendar';
import { Button } from '@gitroom/react/ui/button';
import { Input } from '@gitroom/react/ui/input';
import { Label } from '@gitroom/react/ui/label';

export const DatePicker: FC<{
  date: dayjs.Dayjs;
  onChange: (day: dayjs.Dayjs) => void;
}> = (props) => {
  const { date, onChange } = props;
  const [open, setOpen] = useState(false);
  const t = useT();

  const changeDate = useCallback(
    (day: Date) => {
      onChange(
        newDayjs(
          newDayjs(day).format('YYYY-MM-DD') + ' ' + date.format('HH:mm:ss')
        )
      );
    },
    [date, onChange]
  );

  const changeTime = useCallback(
    (time: string) => {
      if (!time) {
        return;
      }
      onChange(newDayjs(date.format('YYYY-MM-DD') + ' ' + time + ':00'));
    },
    [date, onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="lg" className="font-[600]">
          <CalendarIcon />
          {date.format(
            isUSCitizen() ? 'MM/DD/YYYY hh:mm A' : 'DD/MM/YYYY HH:mm'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="z-[700] w-auto">
        <Calendar
          value={date.toDate()}
          onSelect={changeDate}
          disabled={(day) =>
            dayjs(day).isBefore(newDayjs().startOf('day'), 'day')
          }
        />
        <div className="flex flex-col gap-[8px] px-3 pb-3">
          <Label htmlFor="date-picker-time">{t('pick_time', 'Pick time')}</Label>
          <Input
            id="date-picker-time"
            type="time"
            value={date.format('HH:mm')}
            onChange={(e) => changeTime(e.target.value)}
          />
          <Button className="mt-[4px]" onClick={() => setOpen(false)}>
            {t('close', 'Close')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
