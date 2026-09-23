'use client';

import { Button } from '@gitroom/react/ui/button';
import React, { FC } from 'react';
import { Plus } from 'lucide-react';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { PostComment } from '@gitroom/frontend/components/new-launch/providers/high.order.provider';
export const AddPostButton: FC<{
  onClick: () => void;
  num: number;
  postComment: PostComment;
}> = (props) => {
  const { onClick } = props;
  const t = useT();

  return (
    <div className="flex">
      <Button type="button" onClick={onClick} className="mt-[12px]">
        <Plus className="size-4" />
        {t(
          ...(props.postComment === PostComment.ALL
            ? ['add_comment_or_post', 'Add comment or post']
            : props.postComment === PostComment.POST
            ? ['add_post', 'Add post']
            : ['add_comment', 'Add comment'])
        )}
      </Button>
    </div>
  );
};
