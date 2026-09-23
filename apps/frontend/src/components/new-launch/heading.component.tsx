'use client';

import { FC } from 'react';
import { Heading, Heading1, Heading2, Heading3 } from 'lucide-react';
import { Button } from '@gitroom/react/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gitroom/react/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@gitroom/react/ui/tooltip';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

export const HeadingComponent: FC<{
  editor: any;
  currentValue: string;
}> = ({ editor }) => {
  const t = useT();
  const setHeading = (level: number) => () => {
    editor?.commands?.unsetUnderline();
    editor?.commands?.unsetBold();
    editor?.commands?.toggleHeading({ level });
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-[30px] rounded-[6px] bg-muted hover:bg-muted/70"
            >
              <Heading className="size-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('title', 'Title')}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent side="top" align="center" className="z-[700] min-w-0">
        <DropdownMenuItem onSelect={setHeading(1)}>
          <Heading1 className="size-4" />
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={setHeading(2)}>
          <Heading2 className="size-4" />
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={setHeading(3)}>
          <Heading3 className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
