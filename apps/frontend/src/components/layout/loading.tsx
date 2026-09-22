'use client';

import { FC } from 'react';
import { Spinner as UISpinner } from '@gitroom/react/ui/spinner';

const Spinner: FC<{
  type?: string;
  color?: string;
  width?: number;
  height?: number;
}> = ({ width = 40, height = 40 }) => {
  return (
    <UISpinner style={{ width, height }} className="text-primary" />
  );
};

export { Spinner as default };

export const LoadingComponent: FC<{
  width?: number;
  height?: number;
}> = (props) => {
  return (
    <div className="flex-1 flex justify-center pt-[100px]">
      <Spinner width={props.width || 40} height={props.height || 40} />
    </div>
  );
};
