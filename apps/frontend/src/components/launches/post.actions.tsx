'use client';

import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import copy from 'copy-to-clipboard';
import { useCalendar } from '@gitroom/frontend/components/launches/calendar.context';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { ExistingDataContextProvider } from '@gitroom/frontend/components/launches/helpers/use.existing.data';
import { AddEditModal } from '@gitroom/frontend/components/new-launch/add.edit.modal';
import { StatisticsModal } from '@gitroom/frontend/components/launches/statistics';
import { MissingReleaseModal } from '@gitroom/frontend/components/launches/missing-release.modal';
import { Button } from '@gitroom/react/ui/button';

const DebugJsonModal: FC<{ post: any }> = ({ post }) => {
  const t = useT();
  const fetch = useFetch();
  const toaster = useToaster();
  const { closeCurrent } = useModals();

  const copyPostId = useCallback(() => {
    copy(post.id);
    toaster.show(t('post_id_copied', 'Post ID copied to clipboard'), 'success');
    closeCurrent();
  }, [post, toaster, t, closeCurrent]);

  const copyJson = useCallback(async () => {
    try {
      const data = await (
        await fetch(`/posts/group/${post.group}/debug-export`)
      ).json();
      copy(JSON.stringify(data, null, 2));
      toaster.show(
        t('debug_json_copied', 'Debug JSON copied to clipboard'),
        'success'
      );
      closeCurrent();
    } catch {
      toaster.show(
        t('debug_json_copy_failed', 'Failed to copy debug data'),
        'warning'
      );
    }
  }, [fetch, post, toaster, t, closeCurrent]);

  return (
    <div className="flex flex-col gap-[16px] p-[16px]">
      <div className="text-foreground text-[14px]">
        {t('debug_choose_copy', 'Choose what you want to copy')}
      </div>
      <div className="flex gap-[10px]">
        <Button type="button" size="lg" onClick={copyPostId}>
          {t('copy_post_id', 'Copy post id')}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          onClick={copyJson}
        >
          {t('copy_debug_json', 'Copy Debug JSON')}
        </Button>
      </div>
    </div>
  );
};

// Fetches the full backend debug export for a post group and shows it as
// formatted, scrollable, copyable JSON (schema + all post data + errors).
const ShowJsonModal: FC<{ post: any }> = ({ post }) => {
  const t = useT();
  const fetch = useFetch();
  const toaster = useToaster();
  const [data, setData] = useState<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await (
          await fetch(`/posts/group/${post.group}/debug-export`)
        ).json();
        setData(res);
      } catch {
        setFailed(true);
      }
    })();
  }, [fetch, post.group]);

  const json = data ? JSON.stringify(data, null, 2) : '';

  return (
    <div className="flex flex-col gap-[12px] p-[16px]">
      <div className="flex items-center justify-between gap-[10px]">
        <div className="text-foreground text-[14px]">
          {t('post_full_data', 'Full post data (from backend)')}
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!data}
          onClick={() => {
            copy(json);
            toaster.show(t('copied', 'Copied'), 'success');
          }}
        >
          {t('copy', 'Copy')}
        </Button>
      </div>
      {failed ? (
        <div className="text-destructive text-[13px]">
          {t('failed_to_load_data', 'Failed to load data')}
        </div>
      ) : !data ? (
        <div className="text-muted-foreground text-[13px]">
          {t('loading', 'Loading…')}
        </div>
      ) : (
        <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted/40 p-[12px] text-[12px]">
          {json}
        </pre>
      )}
    </div>
  );
};

// Shared hook for post actions (edit, delete, statistics)
export const usePostActions = (onMutate?: () => void) => {
  const t = useT();
  const fetch = useFetch();
  const modal = useModals();
  const toaster = useToaster();
  const { integrations, reloadCalendarView } = useCalendar();

  const mutate = useCallback(() => {
    reloadCalendarView();
    onMutate?.();
  }, [reloadCalendarView, onMutate]);

  const editPost = useCallback(
    (loadPost: any, isDuplicate?: boolean) => async () => {
      const post = {
        ...loadPost,
        publishDate: loadPost.actualDate || loadPost.publishDate,
      };

      const data = await (await fetch(`/posts/group/${post.group}`)).json();
      const date = !isDuplicate
        ? null
        : (await (await fetch('/posts/find-slot')).json()).date;
      const publishDate = dayjs.utc(date || data.posts[0].publishDate).local();
      const ExistingData = !isDuplicate ? ExistingDataContextProvider : Fragment;
      modal.openModal({
        id: 'add-edit-modal',
        closeOnClickOutside: false,
        removeLayout: true,
        closeOnEscape: false,
        withCloseButton: false,
        askClose: true,
        fullScreen: true,
        classNames: {
          modal: 'w-[100%] max-w-[1400px] text-foreground',
        },
        children: (
          <ExistingData value={data}>
            <AddEditModal
              {...(isDuplicate
                ? {
                    onlyValues: data.posts.map(
                      ({ image, settings, content }: any) => ({
                        image,
                        settings,
                        content,
                      })
                    ),
                  }
                : {})}
              allIntegrations={integrations.map((p) => ({ ...p }))}
              reopenModal={editPost(post)}
              mutate={mutate}
              integrations={
                isDuplicate
                  ? integrations
                  : integrations
                      .slice(0)
                      .filter((f) => f.id === data.integration)
                      .map((p) => ({
                        ...p,
                        picture: data.integrationPicture,
                      }))
              }
              date={publishDate}
            />
          </ExistingData>
        ),
        size: '80%',
        title: ``,
      });
    },
    [integrations, fetch, modal, mutate]
  );

  const copyDebugJson = useCallback(
    (post: any) => () => {
      modal.openModal({
        title: t('copy_debug_json', 'Copy Debug JSON'),
        closeOnClickOutside: true,
        closeOnEscape: true,
        withCloseButton: true,
        classNames: {
          modal: 'w-[100%] max-w-[500px]',
        },
        children: <DebugJsonModal post={post} />,
      });
    },
    [modal, t]
  );

  const showJson = useCallback(
    (post: any) => () => {
      modal.openModal({
        title: t('show_json', 'Show JSON'),
        closeOnClickOutside: true,
        closeOnEscape: true,
        withCloseButton: true,
        classNames: {
          modal: 'w-[100%] max-w-[900px]',
        },
        children: <ShowJsonModal post={post} />,
        size: '70%',
      });
    },
    [modal, t]
  );

  const deletePost = useCallback(
    (post: any) => async () => {
      if (
        !(await deleteDialog(
          t(
            'are_you_sure_you_want_to_delete_post',
            'Are you sure you want to delete post?'
          )
        ))
      ) {
        return;
      }

      await fetch(`/posts/${post.group}`, {
        method: 'DELETE',
      });

      toaster.show(
        t('post_deleted_successfully', 'Post deleted successfully'),
        'success'
      );

      mutate();
    },
    [toaster, t, fetch, mutate]
  );

  const openStatistics = useCallback(
    (id: string) => () => {
      modal.openModal({
        title: t('statistics', 'Statistics'),
        closeOnClickOutside: true,
        closeOnEscape: true,
        withCloseButton: true,
        classNames: {
          modal: 'w-[100%] max-w-[1400px]',
        },
        children: <StatisticsModal postId={id} />,
        size: '80%',
      });
    },
    [modal, t]
  );

  const openMissingRelease = useCallback(
    (id: string) => () => {
      modal.openModal({
        title: t('connect_post', 'Connect Post'),
        closeOnClickOutside: true,
        closeOnEscape: true,
        withCloseButton: true,
        classNames: {
          modal: 'w-[100%] max-w-[800px]',
        },
        children: <MissingReleaseModal postId={id} onSuccess={mutate} />,
        size: '60%',
      });
    },
    [modal, t, mutate]
  );

  return {
    editPost,
    deletePost,
    copyDebugJson,
    showJson,
    openStatistics,
    openMissingRelease,
  };
};
