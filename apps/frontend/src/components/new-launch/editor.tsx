'use client';

import React, {
  ClipboardEvent,
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import { History } from '@tiptap/extension-history';
import Link from '@tiptap/extension-link';
import { BulletList, ListItem } from '@tiptap/extension-list';
import Mention from '@tiptap/extension-mention';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extensions';
import {
  EditorContent,
  Extension,
  mergeAttributes,
  useEditor,
} from '@tiptap/react';
import { Dashboard } from '@uppy/react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useTheme } from 'next-themes';
import { useShallow } from 'zustand/react/shallow';

import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';
import { cn } from '@gitroom/react/helpers/cn';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { Button } from '@gitroom/react/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@gitroom/react/ui/tooltip';
import { useExistingData } from '@gitroom/frontend/components/launches/helpers/use.existing.data';
import { InformationComponent } from '@gitroom/frontend/components/launches/information.component';
import { UpDownArrow } from '@gitroom/frontend/components/launches/up.down.arrow';
import { MultiMediaComponent } from '@gitroom/frontend/components/media/media.component';
import { useUppyUploader } from '@gitroom/frontend/components/media/new.uploader';
import { AComponent } from '@gitroom/frontend/components/new-launch/a.component';
import { AddPostButton } from '@gitroom/frontend/components/new-launch/add.post.button';
import { BoldText } from '@gitroom/frontend/components/new-launch/bold.text';
import { Bullets } from '@gitroom/frontend/components/new-launch/bullets.component';
import { DelayComponent } from '@gitroom/frontend/components/new-launch/delay.component';
import { HeadingComponent } from '@gitroom/frontend/components/new-launch/heading.component';
import { suggestion } from '@gitroom/frontend/components/new-launch/mention.component';
import {
  SelectedIntegrations,
  useLaunchStore,
} from '@gitroom/frontend/components/new-launch/store';
import { UText } from '@gitroom/frontend/components/new-launch/u.text';
import { SignatureBox } from '@gitroom/frontend/components/signature';
import {
  ConnectionLineIcon,
  DelayIcon,
  EmojiIcon,
  LockIcon,
  ResetIcon,
  TrashIcon,
} from '@gitroom/frontend/components/ui/icons';

const MAX_UPLOAD_SIZE = 1024 * 1024 * 1024; // 1 GB

const InterceptBoldShortcut = Extension.create({
  name: 'preventBoldWithUnderline',

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => {
        // For example, toggle bold while removing underline
        this?.editor?.commands?.unsetUnderline();
        return this?.editor?.commands?.toggleBold();
      },
    };
  },
});

const InterceptUnderlineShortcut = Extension.create({
  name: 'preventUnderlineWithUnderline',

  addKeyboardShortcuts() {
    return {
      'Mod-u': () => {
        // For example, toggle bold while removing underline
        this?.editor?.commands?.unsetBold();
        return this?.editor?.commands?.toggleUnderline();
      },
    };
  },
});

export const EditorWrapper: FC<{
  totalPosts: number;
  value: string;
}> = () => {
  const t = useT();
  const {
    setGlobalValueText,
    setInternalValueText,
    addRemoveInternal,
    internal,
    global,
    current,
    addInternalValue,
    addGlobalValue,
    setInternalValueMedia,
    appendInternalValueMedia,
    appendGlobalValueMedia,
    setGlobalValueMedia,
    changeOrderGlobal,
    changeOrderInternal,
    isCreateSet,
    deleteGlobalValue,
    deleteInternalValue,
    setGlobalValue,
    setInternalValue,
    setInternalDelay,
    setGlobalDelay,
    internalFromAll,
    totalChars,
    postComment,
    dummy,
    editor,
    loadedState,
    setLoadedState,
    selectedIntegration,
    chars,
    comments,
  } = useLaunchStore(
    useShallow((state) => ({
      internal: state.internal.find((p) => p.integration.id === state.current),
      internalFromAll: state.integrations.find((p) => p.id === state.current),
      global: state.global,
      comments: state.comments,
      current: state.current,
      addRemoveInternal: state.addRemoveInternal,
      dummy: state.dummy,
      setInternalValueText: state.setInternalValueText,
      setGlobalValueText: state.setGlobalValueText,
      addInternalValue: state.addInternalValue,
      addGlobalValue: state.addGlobalValue,
      setGlobalValueMedia: state.setGlobalValueMedia,
      setInternalValueMedia: state.setInternalValueMedia,
      changeOrderGlobal: state.changeOrderGlobal,
      changeOrderInternal: state.changeOrderInternal,
      isCreateSet: state.isCreateSet,
      deleteGlobalValue: state.deleteGlobalValue,
      deleteInternalValue: state.deleteInternalValue,
      setGlobalValue: state.setGlobalValue,
      setInternalValue: state.setInternalValue,
      setGlobalDelay: state.setGlobalDelay,
      setInternalDelay: state.setInternalDelay,
      totalChars: state.totalChars,
      appendInternalValueMedia: state.appendInternalValueMedia,
      appendGlobalValueMedia: state.appendGlobalValueMedia,
      postComment: state.postComment,
      editor: state.editor,
      loadedState: state.loaded,
      setLoadedState: state.setLoaded,
      selectedIntegration: state.selectedIntegrations,
      chars: state.chars,
    })),
  );

  const existingData = useExistingData();
  const isPublished = existingData?.posts?.[0]?.state === 'PUBLISHED';
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    if (loaded && loadedState) {
      return;
    }

    setLoadedState(true);
    setLoaded(true);
  }, [loaded, loadedState]);

  const canEdit = useMemo(() => {
    return current === 'global' || !!internal;
  }, [current, internal]);

  const items = useMemo(() => {
    if (internal) {
      return internal.integrationValue;
    }

    return global;
  }, [internal, global]);

  const setValue = useCallback(
    (value: string[]) => {
      const newValue = value.map((p, index) => {
        return {
          id: makeId(10),
          delay: 0,
          ...(items?.[index]?.media
            ? { media: items[index].media }
            : { media: [] }),
          content: p,
        };
      });
      if (internal) {
        return setInternalValue(current, newValue);
      }

      return setGlobalValue(newValue);
    },
    [internal, items],
  );

  useCopilotReadable({
    description: 'Current content of posts',
    value: items.map((p) => p.content),
  });

  useCopilotAction({
    name: 'setPosts',
    description: 'a thread of posts',
    parameters: [
      {
        name: 'content',
        type: 'string[]',
        description: 'a thread of posts',
      },
    ],
    handler: async ({ content }) => {
      setValue(content);
    },
  });

  const changeValue = useCallback(
    (index: number) => (value: string) => {
      if (internal) {
        return setInternalValueText(current, index, value);
      }

      return setGlobalValueText(index, value);
    },
    [current, global, internal],
  );

  const changeImages = useCallback(
    (index: number) => (value: any[]) => {
      if (internal) {
        return setInternalValueMedia(current, index, value);
      }

      return setGlobalValueMedia(index, value);
    },
    [current, global, internal],
  );

  const appendImages = useCallback(
    (index: number) => (value: any[]) => {
      if (internal) {
        return appendInternalValueMedia(current, index, value);
      }

      return appendGlobalValueMedia(index, value);
    },
    [current, global, internal],
  );

  const changeOrder = useCallback(
    (index: number) => (direction: 'up' | 'down') => {
      if (internal) {
        changeOrderInternal(current, index, direction);
        return setLoaded(false);
      }

      changeOrderGlobal(index, direction);
      setLoaded(false);
    },
    [changeOrderInternal, changeOrderGlobal, current, global, internal],
  );

  const goBackToGlobal = useCallback(async () => {
    if (
      await deleteDialog(
        t(
          'are_you_sure_go_back_to_global_mode',
          'This action is irreversible. Are you sure you want to go back to global mode?',
        ),
        t('yes_go_back_to_global_mode', 'Yes, go back to global mode'),
      )
    ) {
      setLoaded(false);
      addRemoveInternal(current);
    }
  }, [addRemoveInternal, current, t]);

  const addValue = useCallback(
    (index: number) => () => {
      setTimeout(() => {
        // scroll the the bottom
        document.querySelector('#social-content').scrollTo({
          top: document.querySelector('#social-content').scrollHeight,
        });
      }, 20);
      if (internal) {
        return addInternalValue(index, current, [
          {
            delay: 0,
            content: '',
            id: makeId(10),
            media: [],
          },
        ]);
      }

      return addGlobalValue(index, [
        {
          delay: 0,
          content: '',
          id: makeId(10),
          media: [],
        },
      ]);
    },
    [current, global, internal],
  );

  const deletePost = useCallback(
    (index: number) => async () => {
      if (
        !(await deleteDialog(
          t(
            'are_you_sure_delete_this_post',
            'Are you sure you want to delete this post?',
          ),
          t('yes_delete_it', 'Yes, delete it!'),
        ))
      ) {
        return;
      }

      if (internal) {
        deleteInternalValue(current, index);
        return setLoaded(false);
      }

      deleteGlobalValue(index);
      setLoaded(false);
    },
    [current, global, internal, t],
  );

  if (!loaded || !loadedState) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative flex-1 flex-col gap-[20px]',
        (items.length === 1 || !canEdit || !comments) && 'flex',
        ((!canEdit && !isCreateSet) || !comments) && 'bg-card rounded-[12px]',
      )}
    >
      {isCreateSet && current !== 'global' && (
        <>
          <div className="absolute top-0 left-0 z-[101] flex h-full w-full flex-col items-center justify-center gap-[16px] text-center">
            <div>
              <div className="absolute z-[101] flex h-[54px] w-[54px] items-center justify-center rounded-full">
                <LockIcon />
              </div>
              <div className="bg-card h-[54px] w-[54px] rounded-full opacity-80" />
            </div>
            <div className="text-[14px] font-[600] text-white">
              {t(
                'cant_edit_networks_when_creating_set',
                "You can't edit networks when creating a set",
              )}
            </div>
          </div>
          <div className="bg-background absolute top-0 left-0 z-[100] h-full w-full rounded-[12px] opacity-60" />
        </>
      )}
      {!canEdit && !isCreateSet && (
        <>
          <div
            onClick={() => {
              setLoaded(false);
              addRemoveInternal(current);
            }}
            className="absolute top-0 left-0 z-[101] flex h-full w-full flex-col items-center justify-center gap-[16px] p-[20px] text-center"
          >
            <div>
              <div className="absolute z-[101] flex h-[54px] w-[54px] items-center justify-center rounded-full">
                <LockIcon />
              </div>
              <div className="bg-card h-[54px] w-[54px] rounded-full opacity-80" />
            </div>
            <div className="text-[14px] font-[600] text-white">
              {t(
                'click_to_exit_global_editing',
                'Click this button to exit global editing and customize the post for this channel',
              )}
            </div>
            <div>
              <div className="text-primary-foreground bg-primary hover:bg-primary/80 flex h-[44px] cursor-pointer items-center justify-center rounded-[8px] px-[20px]">
                {t('edit_content', 'Edit content')}
              </div>
            </div>
          </div>
          <div className="bg-background absolute top-0 left-0 z-[100] h-full w-full rounded-[12px] opacity-60" />
        </>
      )}
      {items.map((g, index) => (
        <div
          key={g.id}
          className={cn(
            'bg-card relative flex flex-1 flex-col gap-[20px]',
            index === 0 && 'rounded-t-[12px]',
            (index === items.length - 1 || !comments) && 'rounded-b-[12px]',
            !canEdit && !isCreateSet && 'blur-s',
            ((!canEdit && index > 0) || (!comments && index > 0)) && 'hidden',
          )}
        >
          <div className="flex w-full flex-1 gap-[5px]">
            <div className="flex w-full flex-1">
              {index > 0 && (
                <div className="text-border flex justify-center pl-[12px]">
                  <ConnectionLineIcon />
                </div>
              )}
              <Editor
                comments={comments}
                editorType={editor}
                allValues={items}
                onChange={changeValue(index)}
                key={index}
                num={index}
                totalPosts={global.length}
                value={g.content}
                pictures={g.media}
                setImages={changeImages(index)}
                autoComplete={canEdit}
                validateChars={true}
                identifier={internalFromAll?.identifier || 'global'}
                totalChars={totalChars}
                appendImages={appendImages(index)}
                dummy={dummy}
                selectedIntegration={selectedIntegration}
                chars={chars}
                childButton={
                  <>
                    {!isPublished &&
                    ((canEdit && items.length - 1 === index) || !comments) ? (
                      <div className="flex items-center">
                        <div className="flex-1">
                          {comments && (
                            <AddPostButton
                              num={index}
                              onClick={addValue(index)}
                              postComment={postComment}
                            />
                          )}
                        </div>
                        {!!internal && !existingData?.integration && (
                          <div
                            className="mt-[12px] flex cursor-pointer items-center gap-[20px] select-none"
                            onClick={goBackToGlobal}
                          >
                            <div className="flex items-center gap-[6px]">
                              <div className="bg-primary h-[8px] w-[8px] rounded-full" />
                              <div className="text-[14px] font-[600]">
                                {t(
                                  'editing_a_specific_network',
                                  'Editing a Specific Network',
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-[6px]">
                              <div>
                                <ResetIcon />
                              </div>
                              <div className="text-[13px] font-[600]">
                                {t('back_to_global', 'Back to global')}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </>
                }
              />
            </div>
            {comments && !isPublished && (
              <div className="flex flex-col items-center gap-[10px] pe-[12px]">
                <UpDownArrow
                  isUp={index !== 0}
                  isDown={index !== items.length - 1}
                  onChange={changeOrder(index)}
                />
                {items.length > 1 && (
                  <TrashIcon
                    onClick={deletePost(index)}
                    data-tooltip-id="tooltip"
                    data-tooltip-content={t(
                      'delete_post_tooltip',
                      'Delete Post',
                    )}
                    className="text-destructive cursor-pointer"
                  />
                )}
                {index > 0 && (
                  <DelayComponent currentIndex={index} currentDelay={g.delay} />
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const Editor: FC<{
  editorType?: 'none' | 'normal' | 'markdown' | 'html';
  totalPosts: number;
  value: string;
  num?: number;
  pictures?: any[];
  allValues?: any[];
  onChange: (value: string) => void;
  setImages?: (value: any[]) => void;
  appendImages?: (value: any[]) => void;
  autoComplete?: boolean;
  validateChars?: boolean;
  comments: boolean | 'no-media';
  identifier?: string;
  totalChars?: number;
  selectedIntegration: SelectedIntegrations[];
  dummy: boolean;
  chars: Record<string, number>;
  childButton?: React.ReactNode;
}> = (props) => {
  const {
    editorType = 'normal',
    allValues,
    pictures,
    setImages,
    num,
    identifier,
    appendImages,
    dummy,
    chars,
    childButton,
    comments,
  } = props;
  const [id] = useState(makeId(10));
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const t = useT();
  const toaster = useToaster();
  const editorRef = useRef<undefined | { editor: any }>(undefined);
  const [loading, setLoading] = useState(false);

  const uppy = useUppyUploader({
    onUploadSuccess: (result: any) => {
      appendImages(result);
      uppy.clear();
    },
    allowedFileTypes: 'image/*,video/mp4',
    onStart: () => {},
    onEnd: () => setLoading(false),
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const totalSize = acceptedFiles.reduce((acc, file) => acc + file.size, 0);

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

      for (const file of acceptedFiles) {
        uppy.addFile(file);
      }
    },
    [uppy, toaster, t],
  );

  const paste = useCallback(
    async (event: ClipboardEvent | File[]) => {
      if (num > 0 && comments === 'no-media') {
        return;
      }
      // @ts-ignore
      const clipboardItems = event.clipboardData?.items;
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

      if (files.length > 0) {
        setLoading(true);
      }

      for (const file of files) {
        uppy.addFile(file);
      }
    },
    [uppy, num, comments, toaster, t],
  );

  const { registerDropHandler, unregisterDropHandler, setActiveDropTarget } =
    useLaunchStore(
      useShallow((state) => ({
        registerDropHandler: state.registerDropHandler,
        unregisterDropHandler: state.unregisterDropHandler,
        setActiveDropTarget: state.setActiveDropTarget,
      })),
    );

  const existingData = useExistingData();
  const isPublished = existingData?.posts?.[0]?.state === 'PUBLISHED';

  const dropKey = `post-${num || 0}`;
  useEffect(() => {
    if ((num > 0 && comments === 'no-media') || isPublished) {
      return;
    }
    registerDropHandler(dropKey, (files: File[]) => {
      if (loading) {
        toaster.show(
          'Upload current in progress, please wait and then try again.',
          'warning',
        );
        return;
      }
      onDrop(files);
    });
    return () => unregisterDropHandler(dropKey);
  }, [dropKey, num, comments, loading, onDrop, isPublished]);

  const valueWithoutHtml = useMemo(() => {
    return stripHtmlValidation('normal', props.value || '', true);
  }, [props.value]);

  const addText = useCallback(
    (emoji: string) => {
      editorRef?.current?.editor?.commands?.insertContent(emoji);
      editorRef?.current?.editor?.commands?.focus();
    },
    [props.value, id],
  );

  const [loadedEditor, setLoadedEditor] = useState(editorType);
  const [showEditor, setShowEditor] = useState(true);
  useEffect(() => {
    if (editorType === loadedEditor) {
      return;
    }
    setLoadedEditor(editorType);
    setShowEditor(false);
  }, [editorType]);

  useEffect(() => {
    if (showEditor) {
      return;
    }
    setTimeout(() => {
      setShowEditor(true);
    }, 20);
  }, [showEditor]);

  if (!showEditor) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-[20px]">
      <div
        className={cn(
          'relative flex flex-1 flex-col px-[12px] pt-[12px] pb-[12px]',
          num > 0 && '!rounded-bs-[0]',
        )}
        id={id}
      >
        <div className="relative flex flex-1 cursor-text flex-col">
          <div
            className="flex flex-1 flex-col"
            onFocusCapture={() => setActiveDropTarget(dropKey)}
            onMouseDown={() => setActiveDropTarget(dropKey)}
          >
            <div className="bg-card relative z-[99] rounded-t-[6px] px-[10px] pt-[10px]">
              <OnlyEditor
                value={props.value}
                editorType={editorType}
                onChange={props.onChange}
                paste={paste}
                ref={editorRef}
              />
            </div>
            <div
              className="bg-card flex-1"
              onClick={() => {
                if (editorRef?.current?.editor?.isFocused) {
                  return;
                }
                editorRef?.current?.editor?.commands?.focus('end');
              }}
            />
            <div className="pointer-events-none w-full">
              <div className="bg-card uppyChange absolute left-0 h-[46px] w-full overflow-hidden">
                <Dashboard
                  height={46}
                  uppy={uppy}
                  id={`prog-${num}`}
                  showProgressDetails={true}
                  hideUploadButton={true}
                  hideRetryButton={true}
                  hidePauseResumeButton={true}
                  hideCancelButton={true}
                  hideProgressAfterFinish={true}
                />
              </div>
            </div>
            <div
              className="bg-card h-[46px] w-full cursor-text"
              onClick={() => {
                if (editorRef?.current?.editor?.isFocused) {
                  return;
                }
                editorRef?.current?.editor?.commands?.focus('end');
              }}
            />
            <div className="flex cursor-default rounded-b-[6px]">
              {setImages && (
                <MultiMediaComponent
                  mediaNotAvailable={
                    (num > 0 && comments === 'no-media') || isPublished
                  }
                  allData={allValues}
                  text={valueWithoutHtml}
                  label={t('attachments', 'Attachments')}
                  description=""
                  value={props.pictures}
                  dummy={dummy}
                  name="image"
                  information={
                    <InformationComponent
                      isPicture={pictures?.length > 0}
                      chars={chars}
                      totalChars={valueWithoutHtml.length}
                      totalAllowedChars={props.totalChars}
                      text={valueWithoutHtml}
                    />
                  }
                  toolBar={
                    isPublished ? undefined : (
                      <div className="flex gap-[5px]">
                        <SignatureBox editor={editorRef?.current?.editor} />
                        {editorType !== 'none' && (
                          <>
                            <UText
                              editor={editorRef?.current?.editor}
                              currentValue={props.value!}
                            />
                            <BoldText
                              editor={editorRef?.current?.editor}
                              currentValue={props.value!}
                            />
                          </>
                        )}
                        {(editorType === 'markdown' || editorType === 'html') &&
                          identifier !== 'telegram' && (
                            <>
                              <AComponent
                                editor={editorRef?.current?.editor}
                                currentValue={props.value!}
                              />
                              <Bullets
                                editor={editorRef?.current?.editor}
                                currentValue={props.value!}
                              />
                              <HeadingComponent
                                editor={editorRef?.current?.editor}
                                currentValue={props.value!}
                              />
                            </>
                          )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setEmojiPickerOpen(!emojiPickerOpen)
                              }
                            >
                              <EmojiIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {t('insert_emoji', 'Insert Emoji')}
                          </TooltipContent>
                        </Tooltip>
                        <div className="relative">
                          <div
                            className={cn(
                              'absolute -start-[50px] z-[500]',
                              num === 0 && allValues?.length > 1
                                ? 'top-[35px]'
                                : 'bottom-[35px]',
                            )}
                          >
                            <EmojiPicker
                              height={400}
                              theme={
                                resolvedTheme === 'light'
                                  ? Theme.LIGHT
                                  : Theme.DARK
                              }
                              onEmojiClick={(e) => {
                                addText(e.emoji);
                                setEmojiPickerOpen(false);
                              }}
                              open={emojiPickerOpen}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }
                  onChange={(value) => {
                    setImages(value.target.value);
                  }}
                  onOpen={() => {}}
                  onClose={() => {}}
                />
              )}
            </div>
            <div>{childButton}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OnlyEditor = forwardRef<
  any,
  {
    editorType: 'none' | 'normal' | 'markdown' | 'html';
    value: string;
    onChange: (value: string) => void;
    paste?: (event: ClipboardEvent | File[]) => void;
  }
>(({ editorType, value, onChange, paste }, ref) => {
  const t = useT();
  const fetch = useFetch();
  const existingData = useExistingData();
  const isPublished = existingData?.posts?.[0]?.state === 'PUBLISHED';

  const { internal } = useLaunchStore(
    useShallow((state) => ({
      internal: state.internal.find((p) => p.integration.id === state.current),
    })),
  );

  const loadList = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        return [];
      }

      if (!internal?.integration.id) {
        return [];
      }

      try {
        const load = await fetch('/integrations/mentions', {
          method: 'POST',
          body: JSON.stringify({
            name: 'mention',
            id: internal.integration.id,
            data: { query },
          }),
        });

        const result = await load.json();
        return result;
      } catch (error) {
        console.error('Error loading mentions:', error);
        return [];
      }
    },
    [internal, fetch],
  );

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Underline,
      Bold,
      InterceptBoldShortcut,
      InterceptUnderlineShortcut,
      BulletList,
      ListItem,
      Placeholder.configure({
        placeholder: t('write_something', 'Write something …'),
        emptyEditorClass: 'is-editor-empty',
      }),
      ...(editorType === 'html' || editorType === 'markdown'
        ? [
            Link.configure({
              openOnClick: false,
              autolink: true,
              defaultProtocol: 'https',
              protocols: ['http', 'https'],
              isAllowedUri: (url, ctx) => {
                try {
                  // prevent transforming plain emails like foo@bar.com into links
                  const trimmed = String(url).trim();
                  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (emailPattern.test(trimmed)) {
                    return false;
                  }

                  // construct URL
                  const parsedUrl = url.includes(':')
                    ? new URL(url)
                    : new URL(`${ctx.defaultProtocol}://${url}`);

                  // use default validation
                  if (!ctx.defaultValidate(parsedUrl.href)) {
                    return false;
                  }

                  // disallowed protocols
                  const disallowedProtocols = ['ftp', 'file', 'mailto'];
                  const protocol = parsedUrl.protocol.replace(':', '');

                  if (disallowedProtocols.includes(protocol)) {
                    return false;
                  }

                  // only allow protocols specified in ctx.protocols
                  const allowedProtocols = ctx.protocols.map((p) =>
                    typeof p === 'string' ? p : p.scheme,
                  );

                  if (!allowedProtocols.includes(protocol)) {
                    return false;
                  }

                  // all checks have passed
                  return true;
                } catch {
                  return false;
                }
              },
              shouldAutoLink: (url) => {
                try {
                  // prevent auto-linking of plain emails like foo@bar.com
                  const trimmed = String(url).trim();
                  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (emailPattern.test(trimmed)) {
                    return false;
                  }

                  // construct URL
                  const parsedUrl = url.includes(':')
                    ? new URL(url)
                    : new URL(`https://${url}`);

                  // only auto-link if the domain is not in the disallowed list
                  const disallowedDomains = [
                    'example-no-autolink.com',
                    'another-no-autolink.com',
                  ];
                  const domain = parsedUrl.hostname;

                  return !disallowedDomains.includes(domain);
                } catch {
                  return false;
                }
              },
            }),
          ]
        : []),
      ...(internal?.integration?.id
        ? [
            Mention.configure({
              HTMLAttributes: {
                class: 'mention',
              },
              renderHTML({ options, node }) {
                return [
                  'span',
                  mergeAttributes(options.HTMLAttributes, {
                    'data-mention-id': node.attrs.id || '',
                    'data-mention-label': node.attrs.label || '',
                  }),
                  `@${node.attrs.label}`,
                ];
              },
              suggestion: suggestion(loadList),
            }),
          ]
        : []),
      ...(editorType === 'html' || editorType === 'markdown'
        ? [
            Heading.configure({
              levels: [1, 2, 3],
            }),
          ]
        : []),
      History.configure({
        depth: 100, // default is 100
        newGroupDelay: 100, // default is 500ms
      }),
    ],
    content: value || '',
    editable: !isPublished,
    shouldRerenderOnTransaction: true,
    immediatelyRender: false,
    // @ts-ignore
    onPaste: paste,
    onUpdate: (innerProps) => {
      onChange?.(innerProps.editor.getHTML());
    },
  });

  useImperativeHandle(ref, () => ({
    editor,
  }));

  return <EditorContent editor={editor} />;
});
