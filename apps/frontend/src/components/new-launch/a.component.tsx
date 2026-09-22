'use client';

import { FC, useCallback } from 'react';
import { Link } from 'lucide-react';

export const AComponent: FC<{
  editor: any;
  currentValue: string;
}> = ({ editor }) => {
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
    <div
      data-tooltip-id="tooltip"
      data-tooltip-content="Link"
      onClick={mark}
      className="select-none cursor-pointer rounded-[6px] w-[30px] h-[30px] bg-muted flex justify-center items-center"
    >
      <Link className="size-4" />
    </div>
  );
};
