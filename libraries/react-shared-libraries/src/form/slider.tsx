'use client';

import { FC, useCallback } from 'react';
import { cn } from '@gitroom/react/helpers/cn';
export const Slider: FC<{
  value: 'on' | 'off';
  fill?: boolean;
  onChange: (value: 'on' | 'off') => void;
}> = (props) => {
  const { value, onChange, fill } = props;
  const change = useCallback(() => {
    onChange(value === 'on' ? 'off' : 'on');
  }, [value]);
  return (
    <div
      className={cn(
        'w-[57px] h-[34px] p-[4px] border-border border rounded-[100px] transition-colors',
        value === 'on' && fill && 'bg-primary border-primary'
      )}
      onClick={change}
    >
      <div className="w-full h-full relative rounded-[100px]">
        <div
          className={cn(
            'absolute left-0 top-0 w-[24px] h-[24px] bg-foreground rounded-full transition-all cursor-pointer',
            value === 'on' ? 'left-[100%] -translate-x-[100%]' : 'left-0'
          )}
        />
      </div>
    </div>
  );
};
