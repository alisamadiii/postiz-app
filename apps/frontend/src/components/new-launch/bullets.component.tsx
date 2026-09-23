'use client';

import { FC } from 'react';
import { List } from 'lucide-react';
import { Button } from '@gitroom/react/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@gitroom/react/ui/tooltip';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

export const Bullets: FC<{
  editor: any;
  currentValue: string;
}> = ({ editor }) => {
  const t = useT();
  const bullet = () => {
    editor?.commands?.toggleBulletList();
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={bullet}
          className="size-[30px] rounded-[6px] bg-muted hover:bg-muted/70"
        >
          <List className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('bullets', 'Bullets')}</TooltipContent>
    </Tooltip>
  );
};
