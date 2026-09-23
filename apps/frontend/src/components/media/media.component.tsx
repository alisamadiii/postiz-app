'use client';

import EventEmitter from 'events';
import React, {
  ChangeEvent,
  ClipboardEvent,
  FC,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Media } from '@prisma/client';
import copy from 'copy-to-clipboard';
import { Copy, Maximize, MoreVertical, Trash2, X } from 'lucide-react';
import { ReactSortable } from 'react-sortablejs';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';

import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { hasExtension } from '@gitroom/helpers/utils/has.extension';
import { cn } from '@gitroom/react/helpers/cn';
import { useMediaDirectory } from '@gitroom/react/helpers/use.media.directory';
import { VideoFrame } from '@gitroom/react/helpers/video.frame';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { Button } from '@gitroom/react/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gitroom/react/ui/dropdown-menu';
import { Input } from '@gitroom/react/ui/input';
import { AiImage } from '@gitroom/frontend/components/launches/ai.image';
import { AiVideo } from '@gitroom/frontend/components/launches/ai.video';
import { MediaComponentInner } from '@gitroom/frontend/components/launches/helpers/media.settings.component';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import { DropFiles } from '@gitroom/frontend/components/layout/drop.files';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import {
  areYouSure,
  useModals,
} from '@gitroom/frontend/components/layout/new-modal';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { useUppyUploader } from '@gitroom/frontend/components/media/new.uploader';
import { ThirdPartyMedia } from '@gitroom/frontend/components/third-parties/third-party.media';
import { ThirdPartyMediaLibrary } from '@gitroom/frontend/components/third-parties/third-party.media-library';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseCircleIcon,
  DragHandleIcon,
  InsertMediaIcon,
  MediaSettingsIcon,
  NoMediaIcon,
  PlusIcon,
  VerticalDividerIcon,
} from '@gitroom/frontend/components/ui/icons';

const showModalEmitter = new EventEmitter();
export const Pagination: FC<{
  current: number;
  totalPages: number;
  setPage: (num: number) => void;
}> = (props) => {
  const t = useT();

  const { current, totalPages, setPage } = props;

  const paginationItems = useMemo(() => {
    // Convert to 1-based for algorithm (current is 0-based)
    const c = current + 1;
    const m = totalPages;

    // If total pages <= 10, show all pages
    if (m <= 10) {
      return Array.from({ length: m }, (_, i) => i + 1);
    }

    const delta = 3;
    const left = c - delta;
    const right = c + delta + 1;
    const range: number[] = [];
    const rangeWithDots: (number | '...')[] = [];
    let l: number | undefined;

    // Build the range of pages to show
    for (let i = 1; i <= m; i++) {
      if (i === 1 || i === m || (i >= left && i < right)) {
        range.push(i);
      }
    }

    // Add dots where there are gaps
    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    // Limit to maximum 10 items by trimming pages near edges if needed
    while (rangeWithDots.length > 10) {
      const currentIndex = rangeWithDots.findIndex((item) => item === c);
      if (currentIndex !== -1 && currentIndex > rangeWithDots.length / 2) {
        // Current is in second half, remove one item from start side
        rangeWithDots.splice(2, 1);
      } else {
        // Current is in first half, remove one item from end side
        rangeWithDots.splice(-3, 1);
      }
    }

    return rangeWithDots;
  }, [current, totalPages]);

  return (
    <ul className="mt-[15px] flex flex-row items-center justify-center gap-1">
      <li className={cn(current === 0 && 'pointer-events-none opacity-20')}>
        <div
          className="ring-offset-background focus-visible:ring-ring hover:bg-primary inline-flex h-10 cursor-pointer items-center justify-center gap-1 rounded-md border-[#1F1F1F] px-4 py-2 ps-2.5 text-sm font-medium whitespace-nowrap text-gray-400 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
          aria-label="Go to previous page"
          onClick={() => setPage(current - 1)}
        >
          <ChevronLeftIcon className="lucide lucide-chevron-left h-4 w-4" />
          <span>{t('previous', 'Previous')}</span>
        </div>
      </li>
      {paginationItems.map((item, index) => (
        <li key={index}>
          {item === '...' ? (
            <span className="text-foreground inline-flex h-10 w-10 items-center justify-center select-none">
              ...
            </span>
          ) : (
            <div
              aria-current="page"
              onClick={() => setPage(item - 1)}
              className={cn(
                'ring-offset-background focus-visible:ring-ring hover:bg-primary border-border inline-flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-md border text-sm font-medium whitespace-nowrap transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
                current === item - 1
                  ? 'bg-primary !text-white'
                  : 'text-foreground hover:text-white',
              )}
            >
              {item}
            </div>
          )}
        </li>
      ))}
      <li
        className={cn(
          current + 1 === totalPages && 'pointer-events-none opacity-20',
        )}
      >
        <a
          className="text-foreground group ring-offset-background focus-visible:ring-ring hover:bg-primary inline-flex h-10 cursor-pointer items-center justify-center gap-1 rounded-md border-[#1F1F1F] px-4 py-2 pe-2.5 text-sm font-medium whitespace-nowrap text-gray-400 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
          aria-label="Go to next page"
          onClick={() => setPage(current + 1)}
        >
          <span>{t('next', 'Next')}</span>
          <ChevronRightIcon className="lucide lucide-chevron-right h-4 w-4" />
        </a>
      </li>
    </ul>
  );
};
export const ShowMediaBoxModal: FC = () => {
  const modals = useModals();
  const t = useT();
  useEffect(() => {
    showModalEmitter.on('show-modal', (cCallback) => {
      modals.openModal({
        title: t('media_library', 'Media Library'),
        askClose: false,
        closeOnEscape: true,
        fullScreen: true,
        size: 'calc(100% - 80px)',
        height: 'calc(100% - 80px)',
        children: (close) => (
          <MediaBox
            setMedia={(media) => cCallback(media[0])}
            closeModal={close}
          />
        ),
      });
    });
    return () => {
      showModalEmitter.removeAllListeners('show-modal');
    };
  }, []);
  return null;
};
export const showMediaBox = (
  callback: (params: { id: string; path: string }) => void,
) => {
  showModalEmitter.emit('show-modal', callback);
};
const CHUNK_SIZE = 1024 * 1024;
const MAX_UPLOAD_SIZE = 1024 * 1024 * 1024; // 1 GB
export const MediaBox: FC<{
  setMedia: (params: { id: string; path: string }[]) => void;
  standalone?: boolean;
  type?: 'image' | 'video';
  closeModal: () => void;
}> = ({ type, standalone, setMedia }) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const fetch = useFetch();
  const modals = useModals();
  const toaster = useToaster();
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);
  const loadMedia = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page + 1) });
    if (debouncedSearch.trim()) {
      params.set('search', debouncedSearch.trim());
    }
    return (await fetch(`/media?${params.toString()}`)).json();
  }, [page, debouncedSearch]);
  const { data, mutate, isLoading } = useSWR(
    `get-media-${page}-${debouncedSearch}`,
    loadMedia,
  );
  const [selected, setSelected] = useState([]);
  const t = useT();
  const uploaderRef = useRef<any>(null);
  const mediaDirectory = useMediaDirectory();
  const [loading, setLoading] = useState(false);

  const uppy = useUppyUploader({
    allowedFileTypes:
      type == 'image'
        ? 'image/*'
        : type == 'video'
          ? 'video/mp4'
          : 'image/*,video/mp4',
    onUploadSuccess: async (arr) => {
      await mutate();
      if (standalone) {
        return;
      }
      setSelected((prevSelected) => {
        return [...prevSelected, ...arr];
      });
    },
    onStart: () => setLoading(true),
    onEnd: () => setLoading(false),
  });

  const addRemoveSelected = useCallback(
    (media: any) => () => {
      if (standalone) {
        return;
      }
      const exists = selected.find((p: any) => p.id === media.id);
      if (exists) {
        setSelected(selected.filter((f: any) => f.id !== media.id));
        return;
      }
      setSelected([...selected, media]);
    },
    [selected],
  );

  const addMedia = useCallback(async () => {
    if (standalone) {
      return;
    }
    // @ts-ignore
    setMedia(selected);
    modals.closeCurrent();
  }, [selected]);

  const addToUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);

      if (totalSize > MAX_UPLOAD_SIZE) {
        toaster.show(
          t(
            'upload_size_limit_exceeded',
            'Upload size limit exceeded. Maximum 1 GB per upload session.',
          ),
          'warning',
        );
        return;
      }

      setLoading(true);

      // @ts-ignore
      uppy.addFiles(files);
    },
    [toaster, t],
  );

  const dragAndDrop = useCallback(
    async (event: ClipboardEvent<HTMLDivElement> | File[]) => {
      // @ts-ignore
      const clipboardItems = event.map((p) => ({
        kind: 'file',
        getAsFile: () => p,
      }));
      if (!clipboardItems) {
        return;
      }

      const files: File[] = [];
      // @ts-ignore
      for (const item of clipboardItems) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      const totalSize = files.reduce((acc, file) => acc + file.size, 0);

      if (totalSize > MAX_UPLOAD_SIZE) {
        toaster.show(
          t(
            'upload_size_limit_exceeded',
            'Upload size limit exceeded. Maximum 1 GB per upload session.',
          ),
          'warning',
        );
        return;
      }

      setLoading(true);

      for (const file of files) {
        uppy.addFile(file);
      }
    },
    [toaster, t],
  );

  const maximize = useCallback(
    (media: Media) => async (e?: any) => {
      e?.stopPropagation?.();
      modals.openModal({
        title: '',
        removeLayout: true,
        fullScreen: true,
        closeOnEscape: true,
        closeOnClickOutside: true,
        children: (close: () => void) => (
          <div className="relative flex h-full w-full items-center justify-center bg-black">
            <button
              type="button"
              onClick={close}
              className="absolute end-[16px] top-[16px] z-[10] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
            >
              <X width={20} height={20} />
            </button>
            {hasExtension(media.path, 'mp4') ? (
              <VideoFrame
                autoplay={true}
                url={mediaDirectory.set(media.path)}
              />
            ) : (
              <img
                className="h-full w-full object-contain"
                src={mediaDirectory.set(media.path)}
                alt="media"
              />
            )}
          </div>
        ),
      });
    },
    [mediaDirectory],
  );

  const copyUrl = useCallback(
    (media: Media) => () => {
      copy(mediaDirectory.set(media.path));
      toaster.show(t('copied_to_clipboard', 'Copied to clipboard'), 'success');
    },
    [mediaDirectory, toaster, t],
  );

  const deleteImage = useCallback(
    (media: Media) => async () => {
      if (
        !(await areYouSure({
          title: t('delete_file', 'Delete file?'),
          description: t(
            'delete_file_cannot_be_undone',
            'This cannot be undone.',
          ),
          approveLabel: t('delete', 'Delete'),
          cancelLabel: t('cancel', 'Cancel'),
        }))
      ) {
        return;
      }
      await fetch(`/media/${media.id}`, {
        method: 'DELETE',
      });
      mutate();
    },
    [mutate, t],
  );

  const btn = useMemo(() => {
    return (
      <Button
        variant="outline"
        disabled={loading}
        onClick={() => uploaderRef?.current?.click()}
        size="lg"
      >
        {loading ? (
          <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]">
            <div className="h-[20px] w-[20px] animate-spin rounded-full border-4 border-white border-t-transparent" />
          </div>
        ) : (
          <PlusIcon size={14} />
        )}
        <div className={loading ? 'invisible' : undefined}>
          {t('upload', 'Upload')}
        </div>
      </Button>
    );
  }, [t, loading]);

  return (
    <DropFiles
      disabled={loading}
      className="flex flex-1 flex-col outline-none"
      onDrop={dragAndDrop}
    >
      <div className="flex flex-1 flex-col">
        <div
          className={cn(
            'mb-8 flex items-center gap-[12px]',
            !isLoading &&
              !data?.results?.length &&
              !debouncedSearch &&
              'hidden',
          )}
        >
          <div className="flex-1">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_media_by_name', 'Search by file name')}
            />
          </div>
          <input
            type="file"
            ref={uploaderRef}
            onChange={addToUpload}
            className="hidden"
            multiple={true}
          />
          <div className="flex gap-[8px]">
            {btn}
            <ThirdPartyMediaLibrary onImported={() => mutate()} />
          </div>
        </div>
        {/* <div className="pointer-events-none relative mt-[5px] mb-[5px] w-full">
          <div className="bg-card uppyChange absolute left-0 h-[46px] w-full">
            <Dashboard
              height={46}
              uppy={uppy}
              id={`uploader`}
              showProgressDetails={true}
              hideUploadButton={true}
              hideRetryButton={true}
              hidePauseResumeButton={true}
              hideCancelButton={true}
              hideProgressAfterFinish={true}
              proudlyDisplayPoweredByUppy={false}
              locale={{
                strings: {
                  dropPasteFiles: '',
                  dropPasteImportFiles: '',
                  dropHint: '',
                  browseFiles: '',
                },
              }}
            />
          </div>
          <div className="uppyChange h-[46px] w-full" />
        </div> */}
        {!isLoading && !data?.results?.length ? (
          <div className="bg-foreground/[0.02] flex flex-1 flex-col items-center justify-center gap-[20px] rounded-[12px] py-[60px]">
            <NoMediaIcon />
            <div className="text-[20px] font-[600]">
              {debouncedSearch
                ? t('no_media_match_search', 'No media matches your search')
                : t(
                    'you_dont_have_any_media_yet',
                    "You don't have any media yet",
                  )}
            </div>
            <div className="text-foreground/[0.6] text-center whitespace-pre-line">
              {t(
                'select_or_upload_pictures_max_1gb',
                'Select or upload pictures (maximum 1 GB per upload).',
              )}{' '}
              {'\n'}
              {t(
                'you_can_drag_drop_pictures',
                'You can also drag & drop pictures.',
              )}
            </div>
            <div className="forceChange flex gap-[8px]">
              {btn}
              <ThirdPartyMediaLibrary onImported={() => mutate()} />
            </div>
          </div>
        ) : (
          <>
            <div
              className={cn(
                'grid grid-cols-3 gap-[12px] sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8',
                !standalone &&
                  'scrollbar scrollbar-thumb-muted scrollbar-track-card max-h-[60vh] overflow-y-auto',
              )}
            >
              {isLoading &&
                [...new Array(16)].map((_, i) => (
                  <div className="aspect-square rounded-[16px]" key={i}>
                    <div className="bg-border h-full w-full animate-pulse rounded-[16px]" />
                  </div>
                ))}
              {data?.results
                ?.filter((f: any) => {
                  if (type === 'video') {
                    return hasExtension(f.path, 'mp4');
                  } else if (type === 'image') {
                    return !hasExtension(f.path, 'mp4');
                  }
                  return true;
                })
                .map((media: any) => {
                  const isSelected = !!selected.find(
                    (p: any) => p.id === media.id,
                  );
                  return (
                    <div
                      className={cn(
                        'group bg-red relative aspect-square overflow-hidden rounded-3xl',
                        isSelected ? 'border-primary' : 'border-transparent',
                      )}
                      key={media.id}
                      onClick={
                        standalone ? maximize(media) : addRemoveSelected(media)
                      }
                    >
                      {hasExtension(media.path, 'mp4') ? (
                        <VideoFrame url={mediaDirectory.set(media.path)} />
                      ) : (
                        <img
                          width="100%"
                          height="100%"
                          className="h-full w-full object-cover"
                          src={mediaDirectory.set(media.path)}
                          alt="media"
                        />
                      )}
                      <div className="absolute right-0 bottom-0 left-0 truncate rounded-b-[13px] bg-gradient-to-t from-black/70 to-transparent px-[8px] py-[6px] text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {media.originalName}
                      </div>
                      {isSelected && (
                        <div className="bg-primary pointer-events-none absolute -end-[8px] -bottom-[8px] z-[20] flex h-[24px] w-[24px] items-center justify-center rounded-full text-[14px] font-[500] text-white">
                          {selected.findIndex((z: any) => z.id === media.id) +
                            1}
                        </div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute end-[6px] top-[6px] z-[20] flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-black/50 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-black/70"
                          >
                            <MoreVertical width={16} height={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[180px]"
                        >
                          <DropdownMenuItem onClick={maximize(media)}>
                            <Maximize width={16} height={16} />
                            {t('preview', 'Preview')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={copyUrl(media)}>
                            <Copy width={16} height={16} />
                            {t('copy_cdn_url', 'Copy CDN URL')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={deleteImage(media)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 width={16} height={16} />
                            {t('delete', 'Delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
            </div>
          </>
        )}
        {(data?.pages || 0) > 1 && (
          <Pagination
            current={page}
            totalPages={data?.pages}
            setPage={setPage}
          />
        )}
        {!standalone && (
          <div className="mt-[32px] flex justify-end gap-[8px]">
            <button
              onClick={() => modals.closeCurrent()}
              className="border-foreground/10 flex h-[52px] cursor-pointer items-center justify-center rounded-[10px] border px-[20px]"
            >
              {t('cancel', 'Cancel')}
            </button>
            {!isLoading && !!data?.results?.length && (
              <button
                onClick={standalone ? () => {} : addMedia}
                disabled={selected.length === 0}
                className="bg-primary flex h-[52px] cursor-pointer items-center justify-center rounded-[10px] px-[20px] text-white disabled:cursor-not-allowed disabled:opacity-80"
              >
                {t('add_selected_media', 'Add selected media')}
              </button>
            )}
          </div>
        )}
      </div>
    </DropFiles>
  );
};
export const MultiMediaComponent: FC<{
  label: string;
  description: string;
  mediaNotAvailable?: boolean;
  dummy: boolean;
  allData: {
    content: string;
    id?: string;
    image?: Array<{
      id: string;
      path: string;
    }>;
  }[];
  value?: Array<{
    path: string;
    id: string;
  }>;
  text: string;
  name: string;
  error?: any;
  onOpen?: () => void;
  onClose?: () => void;
  toolBar?: React.ReactNode;
  information?: React.ReactNode;
  onChange: (event: {
    target: {
      name: string;
      value?: Array<{
        id: string;
        path: string;
        alt?: string;
        thumbnail?: string;
        thumbnailTimestamp?: number;
      }>;
    };
  }) => void;
}> = (props) => {
  const {
    name,
    error,
    text,
    onChange,
    value,
    allData,
    dummy,
    toolBar,
    information,
    mediaNotAvailable,
  } = props;
  const user = useUser();
  const modals = useModals();
  const t = useT();
  useEffect(() => {
    if (value) {
      setCurrentMedia(value);
    }
  }, [value]);

  const [currentMedia, setCurrentMedia] = useState(value);
  const mediaDirectory = useMediaDirectory();
  const changeMedia = useCallback(
    (
      m:
        | {
            path: string;
            id: string;
          }
        | {
            path: string;
            id: string;
          }[],
    ) => {
      const mediaArray = Array.isArray(m) ? m : [m];
      const newMedia = [...(currentMedia || []), ...mediaArray];
      setCurrentMedia(newMedia);
      onChange({
        target: {
          name,
          value: newMedia,
        },
      });
    },
    [currentMedia],
  );
  const showModal = useCallback(() => {
    modals.openModal({
      title: t('media_library', 'Media Library'),
      askClose: false,
      closeOnEscape: true,
      fullScreen: true,
      size: 'calc(100% - 80px)',
      height: 'calc(100% - 80px)',
      children: (close) => (
        <MediaBox setMedia={changeMedia} closeModal={close} />
      ),
    });
  }, [changeMedia, t]);

  const clearMedia = useCallback(
    (topIndex: number) => () => {
      const newMedia = currentMedia?.filter((f, index) => index !== topIndex);
      setCurrentMedia(newMedia);
      onChange({
        target: {
          name,
          value: newMedia,
        },
      });
    },
    [currentMedia],
  );

  return (
    <>
      <div className="b1 flex w-full flex-col gap-[8px] rounded-bl-[8px] select-none">
        <div className="flex gap-[10px] px-[12px]">
          {!!currentMedia && (
            <ReactSortable
              list={currentMedia}
              setList={(value) =>
                onChange({ target: { name: 'upload', value } })
              }
              className="sortable-container flex gap-[10px]"
              animation={200}
              swap={true}
              handle=".dragging"
            >
              {currentMedia.map((media, index) => (
                <div
                  key={media.id}
                  className="border-border relative flex h-[40px] w-[40px] cursor-pointer rounded-[5px] border-2 transition-all"
                >
                  <DragHandleIcon className="dragging absolute -start-[4px] -top-[4px] z-[20] cursor-move pe-[1px] pb-[3px]" />

                  <div className="group relative h-full w-full">
                    <div
                      onClick={async () => {
                        modals.openModal({
                          title: t('media_settings', 'Media Settings'),
                          children: (close) => (
                            <MediaComponentInner
                              media={media as any}
                              onClose={close}
                              onSelect={(value: any) => {
                                onChange({
                                  target: {
                                    name: 'upload',
                                    value: currentMedia.map((p) => {
                                      if (p.id === media.id) {
                                        return {
                                          ...p,
                                          ...value,
                                        };
                                      }
                                      return p;
                                    }),
                                  },
                                });
                              }}
                            />
                          ),
                        });
                      }}
                      className="absolute top-[50%] left-[50%] z-[9] -translate-x-[50%] -translate-y-[50%] rounded-[10px] bg-black/80 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <MediaSettingsIcon className="relative z-[200] cursor-pointer" />
                    </div>
                    {hasExtension(media?.path, 'mp4') ? (
                      <VideoFrame url={mediaDirectory.set(media?.path)} />
                    ) : (
                      <img
                        className="h-full w-full rounded-[4px] object-cover"
                        src={mediaDirectory.set(media?.path)}
                      />
                    )}
                  </div>

                  <CloseCircleIcon
                    onClick={clearMedia(index)}
                    className="absolute -end-[4px] -top-[4px] z-[20] rounded-full bg-white"
                  />
                </div>
              ))}
            </ReactSortable>
          )}
        </div>
        <div className="border-muted b1 text-foreground flex w-full gap-[8px] border-t px-[12px]">
          {!mediaNotAvailable && (
            <div className="b2 flex items-center gap-[4px] py-[10px]">
              <div
                onClick={showModal}
                className="bg-muted flex h-[30px] cursor-pointer items-center justify-center rounded-[6px] px-[8px]"
              >
                <div className="flex items-center gap-[8px]">
                  <div>
                    <InsertMediaIcon />
                  </div>
                  <div className="maxMedia:hidden block text-[10px] font-[600]">
                    {t('insert_media', 'Insert Media')}
                  </div>
                </div>
              </div>
              <ThirdPartyMedia allData={allData} onChange={changeMedia} />

              {!!user?.tier?.ai && (
                <>
                  <AiImage value={text} onChange={changeMedia} />
                  <AiVideo value={text} onChange={changeMedia} />
                </>
              )}
            </div>
          )}
          {!mediaNotAvailable && (
            <div className="text-muted flex h-full items-center">
              <VerticalDividerIcon />
            </div>
          )}
          {!!toolBar && (
            <div className="b2 flex items-center gap-[4px] py-[10px]">
              {toolBar}
            </div>
          )}
          {information && (
            <div className="b2 flex flex-1 items-center justify-end gap-[4px] py-[10px]">
              {information}
            </div>
          )}
        </div>
      </div>
      <div className="text-[12px] text-red-400">{error}</div>
    </>
  );
};
export const MediaComponent: FC<{
  label: string;
  description: string;
  value?: {
    path: string;
    id: string;
  };
  name: string;
  onChange: (event: {
    target: {
      name: string;
      value?: {
        id: string;
        path: string;
      };
    };
  }) => void;
  type?: 'image' | 'video';
  width?: number;
  height?: number;
}> = (props) => {
  const t = useT();

  const { name, type, label, description, onChange, value, width, height } =
    props;
  const { getValues } = useSettings();
  const user = useUser();
  useEffect(() => {
    const settings = getValues()[props.name];
    if (settings) {
      setCurrentMedia(settings);
    }
  }, []);
  const [currentMedia, setCurrentMedia] = useState(value);
  const modals = useModals();
  const mediaDirectory = useMediaDirectory();

  const changeMedia = useCallback((m: { path: string; id: string }[]) => {
    setCurrentMedia(m[0]);
    onChange({
      target: {
        name,
        value: m[0],
      },
    });
  }, []);
  const showModal = useCallback(() => {
    modals.openModal({
      title: t('media_library', 'Media Library'),
      askClose: false,
      closeOnEscape: true,
      fullScreen: true,
      size: 'calc(100% - 80px)',
      height: 'calc(100% - 80px)',
      children: (close) => (
        <MediaBox setMedia={changeMedia} closeModal={close} type={type} />
      ),
    });
  }, [t]);
  const clearMedia = useCallback(() => {
    setCurrentMedia(undefined);
    onChange({
      target: {
        name,
        value: undefined,
      },
    });
  }, [value]);
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="text-[14px]">{label}</div>
      <div className="text-[12px]">{description}</div>
      {!!currentMedia && (
        <div className="border-border my-[20px] h-[200px] w-[200px] cursor-pointer border-2">
          <img
            className="h-full w-full object-cover"
            src={currentMedia.path}
            onClick={() => window.open(mediaDirectory.set(currentMedia.path))}
          />
        </div>
      )}
      <div className="flex gap-[5px]">
        <Button onClick={showModal}>{t('select', 'Select')}</Button>
        <Button onClick={clearMedia}>{t('clear', 'Clear')}</Button>
      </div>
    </div>
  );
};
