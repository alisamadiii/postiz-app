'use client';

import { FC, useMemo, useState } from 'react';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { RepeatIcon } from '@gitroom/frontend/components/ui/icons';
import { ChevronDown } from 'lucide-react';
import { cn } from '@gitroom/react/helpers/cn';
import { Button } from '@gitroom/react/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gitroom/react/ui/dropdown-menu';

const getList = (t: (key: string, fallback: string) => string) => [
  {
    value: 1,
    label: t('day', 'Day'),
  },
  {
    value: 2,
    label: t('two_days', 'Two Days'),
  },
  {
    value: 3,
    label: t('three_days', 'Three Days'),
  },
  {
    value: 4,
    label: t('four_days', 'Four Days'),
  },
  {
    value: 5,
    label: t('five_days', 'Five Days'),
  },
  {
    value: 6,
    label: t('six_days', 'Six Days'),
  },
  {
    value: 7,
    label: t('week', 'Week'),
  },
  {
    value: 14,
    label: t('two_weeks', 'Two Weeks'),
  },
  {
    value: 30,
    label: t('month', 'Month'),
  },
  {
    value: null,
    label: t('cancel', 'Cancel'),
  },
];
export const RepeatComponent: FC<{
  repeat: number | null;
  onChange: (newVal: number) => void;
}> = (props) => {
  const { repeat } = props;
  const t = useT();
  const list = getList(t);
  const [isOpen, setIsOpen] = useState(false);

  const everyLabel = useMemo(() => {
    if (!repeat) {
      return '';
    }
    return list.find((p) => p.value === repeat)?.label;
  }, [repeat, list]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="font-[600]">
          <RepeatIcon />
          <span>
            {repeat
              ? `${t('repeat_post_every_label', 'Repeat Post Every')} ${everyLabel}`
              : t('repeat_post_every', 'Repeat Post Every...')}
          </span>
          <ChevronDown
            className={cn('size-4 transition-transform', isOpen && 'rotate-180')}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="z-[700] w-[240px]"
      >
        {list.map((p) => (
          <DropdownMenuItem
            key={p.label}
            className="h-[40px] px-[16px] text-[15px] font-[600]"
            onSelect={() => props.onChange(Number(p.value))}
          >
            {p.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
