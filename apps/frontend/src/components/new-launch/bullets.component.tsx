'use client';

import { FC, useCallback } from 'react';
import { List } from 'lucide-react';

export const Bullets: FC<{
  editor: any;
  currentValue: string;
}> = ({ editor }) => {
  const bullet = () => {
    editor?.commands?.toggleBulletList();
  };
  return (
    <div
      data-tooltip-id="tooltip"
      data-tooltip-content="Bullets"
      onClick={bullet}
      className="select-none cursor-pointer rounded-[6px] w-[30px] h-[30px] bg-muted flex justify-center items-center"
    >
      <List className="size-4" />
    </div>
  );
};
