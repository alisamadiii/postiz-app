'use client';

import { FC, useCallback } from 'react';
import { Heading, Heading1, Heading2, Heading3 } from 'lucide-react';

export const HeadingComponent: FC<{
  editor: any;
  currentValue: string;
}> = ({ editor }) => {
  const setHeading = (level: number) => () => {
    editor?.commands?.unsetUnderline();
    editor?.commands?.unsetBold();
    editor?.commands?.toggleHeading({ level });
  };

  return (
    <div className="select-none cursor-pointer rounded-[6px] w-[30px] h-[30px] bg-muted flex justify-center items-center group relative">
      <Heading className="size-4" />
      <div
        data-tooltip-id="tooltip"
        data-tooltip-content="Title"
        className="flex p-[10px] gap-[5px] -left-[50%] rounded-[6px] bottom-[100%] opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 bg-muted border border-muted z-[100] absolute transition-all"
      >
        <div onClick={setHeading(1)}>
          <Heading1 className="w-[20px] h-[16px]" />
        </div>
        <div onClick={setHeading(2)}>
          <Heading2 className="w-[20px] h-[16px]" />
        </div>
        <div onClick={setHeading(3)}>
          <Heading3 className="w-[20px] h-[16px]" />
        </div>
      </div>
    </div>
  );
};
