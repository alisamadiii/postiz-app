'use client';

import { FC, useMemo } from 'react';
import { orderBy, groupBy } from 'lodash';
import { State } from '@prisma/client';
import {
  MoreVertical,
  Pencil,
  Copy,
  Eye,
  BarChart3,
  Trash2,
} from 'lucide-react';
import { useCalendar } from '@gitroom/frontend/components/launches/calendar.context';
import { usePostActions } from '@gitroom/frontend/components/launches/post.actions';
import { PostStatusBadge } from '@gitroom/frontend/components/launches/post.status.badge';
import { newDayjs } from '@gitroom/frontend/components/layout/set.timezone';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';
import SafeImage from '@gitroom/react/helpers/safe.image';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@gitroom/react/ui/avatar';
import { Button } from '@gitroom/react/ui/button';
import { ButtonGroup } from '@gitroom/react/ui/button-group';
import { Spinner } from '@gitroom/react/ui/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@gitroom/react/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@gitroom/react/ui/table';

type Post = any;

// ERROR > DRAFT > QUEUE > PUBLISHED
const STATE_PRIORITY: State[] = ['ERROR', 'DRAFT', 'QUEUE', 'PUBLISHED'];
const aggregateState = (posts: Post[]): State => {
  for (const s of STATE_PRIORITY) {
    if (posts.some((p) => p.state === s)) {
      return s;
    }
  }
  return 'DRAFT';
};

const stateFilters: { value: 'all' | 'scheduled' | 'draft' | 'published'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

const PlatformAvatar: FC<{ integration: any }> = ({ integration }) => (
  <div className="relative">
    <Avatar className="size-7">
      <AvatarImage
        src={integration?.picture || '/no-picture.jpg'}
        alt={integration?.name || ''}
      />
      <AvatarFallback>{integration?.name?.charAt(0) || '?'}</AvatarFallback>
    </Avatar>
    {integration?.providerIdentifier && (
      <SafeImage
        src={`/icons/platforms/${integration.providerIdentifier}.png`}
        className="rounded-[6px] absolute z-10 bottom-[-3px] -end-[3px] border border-border"
        alt={integration.providerIdentifier}
        width={14}
        height={14}
      />
    )}
  </div>
);

export const PostsTable: FC = () => {
  const t = useT();
  const {
    listPosts,
    loading,
    listState,
    setListState,
    listPage,
    setListPage,
    listTotalPages,
  } = useCalendar();
  const {
    editPost,
    deletePost,
    copyDebugJson,
    openStatistics,
    openMissingRelease,
  } = usePostActions();

  const groups = useMemo(() => {
    const byGroup = groupBy(listPosts, (p: Post) => p.group);
    const rows = Object.values(byGroup).map((posts: Post[]) => {
      const first = posts[0];
      const text = stripHtmlValidation('none', first?.content || '').trim();
      const [title, ...rest] = text.split('\n').filter(Boolean);
      const state = aggregateState(posts);
      const date = orderBy(posts, ['publishDate'], ['asc'])[0]?.publishDate;
      let media: Array<{ id: string; path: string }> = [];
      try {
        const raw = (first as any)?.image;
        media = Array.isArray(raw) ? raw : JSON.parse(raw || '[]');
      } catch {
        media = [];
      }
      const thumbnail = media[0]?.path;
      // unique integrations across the group
      const seen = new Set<string>();
      const integrations = posts
        .map((p) => p.integration)
        .filter((i) => i && !seen.has(i.id) && seen.add(i.id));
      return {
        group: first?.group,
        post: first,
        title: title || t('no_content', 'No content'),
        description: rest.join(' '),
        state,
        date,
        integrations,
        thumbnail,
        missing: first?.releaseId === 'missing',
      };
    });
    return orderBy(rows, ['date'], ['desc']);
  }, [listPosts, t]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <ButtonGroup>
          {stateFilters.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={listState === f.value ? 'secondary' : 'ghost'}
              onClick={() => setListState(f.value)}
            >
              {t(`state_${f.value}`, f.label)}
            </Button>
          ))}
        </ButtonGroup>
        <ButtonGroup>
          <Button
            variant="ghost"
            size="sm"
            disabled={listPage <= 0}
            onClick={() => setListPage(Math.max(0, listPage - 1))}
          >
            {t('prev', 'Prev')}
          </Button>
          <div className="flex min-w-[80px] items-center justify-center px-2 text-[13px] text-muted-foreground">
            {listPage + 1} / {Math.max(1, listTotalPages)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={listPage >= listTotalPages - 1}
            onClick={() => setListPage(listPage + 1)}
          >
            {t('next', 'Next')}
          </Button>
        </ButtonGroup>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('platforms', 'Platforms')}</TableHead>
            <TableHead>{t('media', 'Media')}</TableHead>
            <TableHead>{t('title', 'Title')}</TableHead>
            <TableHead>{t('description', 'Description')}</TableHead>
            <TableHead>{t('status', 'Status')}</TableHead>
            <TableHead className="text-right">{t('actions', 'Actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="h-32">
              <TableCell colSpan={6} className="text-center">
                <div className="flex justify-center">
                  <Spinner className="size-6 text-primary" />
                </div>
              </TableCell>
            </TableRow>
          ) : groups.length === 0 ? (
            <TableRow className="h-32">
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                {t('no_posts_yet', 'No posts yet')}
              </TableCell>
            </TableRow>
          ) : (
            groups.map((row) => (
              <TableRow
                key={row.group}
                className="cursor-pointer"
                onClick={editPost(row.post)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {row.integrations.map((integration: any) => (
                      <PlatformAvatar
                        key={integration.id}
                        integration={integration}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {row.thumbnail ? (
                    <img
                      src={row.thumbnail}
                      alt=""
                      className="size-10 rounded-md border border-border object-cover"
                    />
                  ) : (
                    <div className="size-10 rounded-md border border-border bg-muted" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="max-w-[260px] truncate">{row.title}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="max-w-[320px] truncate">
                    {row.description || '—'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <PostStatusBadge state={row.state} />
                    {row.state === 'QUEUE' && row.date && (
                      <span className="text-[12px] text-muted-foreground">
                        {newDayjs(row.date).local().format('MMM D, h:mm A')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[180px]">
                      <DropdownMenuItem onClick={editPost(row.post)}>
                        <Pencil className="size-4" />
                        {t('edit', 'Edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={editPost(row.post, true)}>
                        <Copy className="size-4" />
                        {t('duplicate', 'Duplicate')}
                      </DropdownMenuItem>
                      {row.missing ? (
                        <DropdownMenuItem
                          onClick={openMissingRelease(row.post.id)}
                        >
                          <Eye className="size-4" />
                          {t('connect_post', 'Connect Post')}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={openStatistics(row.post.id)}
                        >
                          <BarChart3 className="size-4" />
                          {t('statistics', 'Statistics')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={copyDebugJson(row.post)}>
                        <Copy className="size-4" />
                        {t('copy_debug_json', 'Copy Debug JSON')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={deletePost(row.post)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        {t('delete', 'Delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
