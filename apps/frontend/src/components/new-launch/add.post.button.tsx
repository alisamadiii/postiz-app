'use client';

import { Button } from '@gitroom/react/form/button';
import React, { FC } from 'react';
import { Plus } from 'lucide-react';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { PostComment } from '@gitroom/frontend/components/new-launch/providers/high.order.provider';
export const AddPostButton: FC<{
  onClick: () => void;
  num: number;
  postComment: PostComment;
}> = (props) => {
  const { onClick, num } = props;
  const t = useT();

  return (
    <div className="flex">
      <div
        onClick={onClick}
        className="select-none cursor-pointer h-[34px] rounded-[6px] flex bg-[#D82D7E] gap-[8px] justify-center items-center pl-[16px] pr-[20px] text-[13px] font-[600] mt-[12px]"
      >
        <div>
          <Plus className="size-4 text-white" />
        </div>
        <div className="!text-white">
          {t(
            ...(props.postComment === PostComment.ALL
              ? ['add_comment_or_post', 'Add comment or post']
              : props.postComment === PostComment.POST
              ? ['add_post', 'Add post']
              : ['add_comment', 'Add comment'])
          )}
        </div>
      </div>
    </div>
  );
};
