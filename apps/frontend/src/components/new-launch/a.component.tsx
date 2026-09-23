'use client';

import { FC } from 'react';
import { Link } from 'lucide-react';

import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { Button } from '@gitroom/react/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@gitroom/react/ui/tooltip';

export const AComponent: FC<{
  editor: any;
  currentValue: string;
}> = ({ editor }) => {
  const t = useT();
  const mark = () => {
    const previousUrl = editor?.getAttributes('link')?.href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor?.chain()?.focus()?.extendMarkRange('link')?.unsetLink()?.run();

      return;
    }

    // update link
    try {
      editor
        ?.chain()
        ?.focus()
        ?.extendMarkRange('link')
        ?.setLink({ href: url })
        ?.run();
    } catch (e) {}
    editor?.commands?.focus();
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" onClick={mark}>
          <Link className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('link', 'Link')}</TooltipContent>
    </Tooltip>
  );
};
