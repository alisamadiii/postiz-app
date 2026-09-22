'use client';

import { FC } from 'react';
import { State } from '@prisma/client';
import { Badge } from '@gitroom/react/ui/badge';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

const map: Record<
  State,
  { variant: 'info' | 'success' | 'neutral' | 'error'; label: string }
> = {
  QUEUE: { variant: 'info', label: 'Scheduled' },
  PUBLISHED: { variant: 'success', label: 'Published' },
  DRAFT: { variant: 'neutral', label: 'Draft' },
  ERROR: { variant: 'error', label: 'Error' },
};

export const PostStatusBadge: FC<{ state: State }> = ({ state }) => {
  const t = useT();
  const { variant, label } = map[state] || map.DRAFT;
  return (
    <Badge
      variant={variant}
      className="min-w-[96px] justify-center capitalize"
    >
      {t(`post_state_${state.toLowerCase()}`, label)}
    </Badge>
  );
};
