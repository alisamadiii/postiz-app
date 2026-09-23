'use client';

import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CopilotPopup } from '@copilotkit/react-ui';
import dayjs from 'dayjs';
import { capitalize } from 'lodash';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useShallow } from 'zustand/react/shallow';

import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
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
import { CreationMethodBadge } from '@gitroom/frontend/components/launches/creation.method.badge';
import { DatePicker } from '@gitroom/frontend/components/launches/helpers/date.picker';
import { useExistingData } from '@gitroom/frontend/components/launches/helpers/use.existing.data';
import { RepeatComponent } from '@gitroom/frontend/components/launches/repeat.component';
import { SelectCustomer } from '@gitroom/frontend/components/launches/select.customer';
import { TagsComponent } from '@gitroom/frontend/components/launches/tags.component';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { AddEditModalProps } from '@gitroom/frontend/components/new-launch/add.edit.modal';
import { DummyCodeComponent } from '@gitroom/frontend/components/new-launch/dummy.code.component';
import { EditorWrapper } from '@gitroom/frontend/components/new-launch/editor';
import { PicksSocialsComponent } from '@gitroom/frontend/components/new-launch/picks.socials.component';
import { ShowAllProviders } from '@gitroom/frontend/components/new-launch/providers/show.all.providers';
import { SelectCurrent } from '@gitroom/frontend/components/new-launch/select.current';
import {
  serializeForDirtyCheck,
  useLaunchStore,
} from '@gitroom/frontend/components/new-launch/store';
import { useShortlinkPreference } from '@gitroom/frontend/components/settings/shortlink-preference.component';
import {
  ChevronDownIcon,
  CloseIcon,
  SettingsIcon,
  TrashIcon,
} from '@gitroom/frontend/components/ui/icons';
import { useHasScroll } from '@gitroom/frontend/components/ui/is.scroll.hook';

export const ManageModal: FC<AddEditModalProps> = (props) => {
  const t = useT();
  const fetch = useFetch();
  const ref = useRef(null);
  const existingData = useExistingData();
  const [loading, setLoading] = useState(false);
  const toaster = useToaster();
  const modal = useModals();
  const [showSettings, setShowSettings] = useState(false);
  const { data: shortlinkPreferenceData } = useShortlinkPreference();

  const { addEditSets, mutate, customClose, dummy } = props;
  const isPublished = existingData?.posts?.[0]?.state === 'PUBLISHED';

  const {
    selectedIntegrations,
    hide,
    date,
    setDate,
    repeater,
    setRepeater,
    tags,
    setTags,
    integrations,
    setSelectedIntegrations,
    locked,
    current,
    activateExitButton,
    setHide,
  } = useLaunchStore(
    useShallow((state) => ({
      hide: state.hide,
      setHide: state.setHide,
      date: state.date,
      setDate: state.setDate,
      current: state.current,
      repeater: state.repeater,
      setRepeater: state.setRepeater,
      tags: state.tags,
      setTags: state.setTags,
      selectedIntegrations: state.selectedIntegrations,
      integrations: state.integrations,
      setSelectedIntegrations: state.setSelectedIntegrations,
      locked: state.locked,
      activateExitButton: state.activateExitButton,
    })),
  );

  useEffect(() => {
    if (hide) {
      setHide(false);
    }
  }, [hide]);

  const currentIntegrationText = useMemo(() => {
    if (current === 'global') {
      return (
        <div className="flex items-center gap-[10px]">
          <div className="relative">
            <SettingsIcon size={15} className="text-primary-foreground" />
          </div>
          <div>Settings</div>
        </div>
      );
    }

    const currentIntegration = integrations.find((p) => p.id === current)!;

    return (
      <div className="flex items-center gap-[10px]">
        <div className="relative">
          <img
            src={`/icons/platforms/${currentIntegration.identifier}.png`}
            className="h-[20px] w-[20px] rounded-[4px]"
            alt={currentIntegration.identifier}
          />
          <SettingsIcon
            size={15}
            className="text-primary-foreground absolute -end-[5px] -bottom-[5px]"
          />
        </div>
        <div>
          {currentIntegration.name} {t('channel_settings', 'Settings')}
        </div>
      </div>
    );
  }, [current]);

  const changeCustomer = useCallback(
    (customer: string) => {
      const neededIntegrations = integrations.filter(
        (p) => p?.customer?.id === customer,
      );
      setSelectedIntegrations(
        neededIntegrations.map((p) => ({
          settings: {},
          selectedIntegrations: p,
        })),
      );
    },
    [integrations],
  );

  const askClose = useCallback(async () => {
    if (!activateExitButton || dummy) {
      return;
    }

    // Close silently when nothing changed since the modal was opened.
    // Provider settings live inside each provider's form, so check those too.
    const state = useLaunchStore.getState();
    const providersDirty = state.selectedIntegrations.some((p) =>
      p.ref?.current?.isDirty?.(),
    );
    if (
      !providersDirty &&
      state.snapshot &&
      state.snapshot === serializeForDirtyCheck(state)
    ) {
      if (customClose) {
        customClose();
        return;
      }
      modal.closeAll();
      return;
    }

    if (
      await deleteDialog(
        t(
          'are_you_sure_you_want_to_close_this_modal_all_data_will_be_lost',
          'Are you sure you want to close this modal? (all data will be lost)',
        ),
        t('yes_close_it', 'Yes, close it!'),
      )
    ) {
      if (customClose) {
        customClose();
        return;
      }
      modal.closeAll();
    }
  }, [activateExitButton, dummy]);

  const deletePost = useCallback(async () => {
    setLoading(true);
    if (
      !(await deleteDialog(
        t(
          'are_you_sure_you_want_to_delete_post',
          'Are you sure you want to delete this post?',
        ),
        t('yes_delete_it', 'Yes, delete it!'),
      ))
    ) {
      setLoading(false);
      return;
    }
    await fetch(`/posts/${existingData.group}`, {
      method: 'DELETE',
    });
    mutate();
    modal.closeAll();
    return;
  }, [existingData, mutate, modal]);

  const schedule = useCallback(
    (type: 'draft' | 'now' | 'schedule' | 'update') => async () => {
      let republish = false;
      if (
        (type === 'now' || type === 'schedule') &&
        (existingData?.posts?.[0]?.state === 'PUBLISHED' ||
          (existingData?.posts?.[0]?.state === 'QUEUE' &&
            dayjs().isAfter(date.utc())))
      ) {
        const channels = selectedIntegrations
          .map((p) => p.integration.name)
          .join(', ');
        const isRecurring =
          !!repeater || !!existingData?.posts?.[0]?.intervalInDays;

        if (isPublished) {
          // Published posts are read-only, so "just update the details" is
          // meaningless — confirm the republish directly.
          if (
            !(await deleteDialog(
              `${t(
                'post_already_published_republish_warning',
                'This post was already published. Republishing will publish it again to',
              )} ${channels} ${t('republish_at', 'at')} ${date.format(
                'DD/MM/YYYY HH:mm',
              )}.${
                isRecurring
                  ? ` ${t(
                      'republish_recurring_note',
                      'This is a recurring post: your changes apply to all future recurrences starting now.',
                    )}`
                  : ''
              }`,
              t('yes_republish_it', 'Yes, republish it!'),
            ))
          ) {
            return;
          }
          republish = true;
        } else {
          const whatToDo = await new Promise((resolve) => {
            modal.openModal({
              title: t('what_do_you_want_to_do', 'What do you want to do?'),
              children: (
                <div className="flex flex-col">
                  <div className="mb-[20px] text-[20px]">
                    {t(
                      'post_already_published_republish_warning',
                      'This post was already published. Republishing will publish it again to',
                    )}{' '}
                    {channels} {t('republish_at', 'at')}{' '}
                    {date.format('DD/MM/YYYY HH:mm')}.
                    {isRecurring && (
                      <div className="mt-[10px]">
                        {t(
                          'republish_recurring_note',
                          'This is a recurring post: your changes apply to all future recurrences starting now.',
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex w-full gap-[10px]">
                    <div className="flex flex-1">
                      <Button
                        type="button"
                        className="flex-1"
                        onClick={() => resolve('update')}
                      >
                        {t(
                          'just_update_post_details',
                          'Just update the post details',
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-1">
                      <Button
                        type="button"
                        className="flex-1"
                        onClick={() => resolve('republish')}
                      >
                        {t('republish_the_post', 'Republish the post')}
                      </Button>
                    </div>
                  </div>
                </div>
              ),
            });
          });

          if (whatToDo === 'update') {
            type = 'update';
          }

          if (whatToDo === 'republish') {
            republish = true;
          }
        }
      }

      setLoading(true);

      // Pull the local values to build the payload, but rely on the server
      // (`/posts/valid`) for the actual validation — checkValidity now lives
      // server-side so it can't be bypassed.
      const allValues = await ref.current.getAllValues();

      const integrationById = (id: string) =>
        selectedIntegrations.find((p) => p.integration.id === id);

      const group = existingData.group || makeId(10);

      const posts = allValues.map((post: any) => ({
        integration: {
          id: post.id,
        },
        group,
        settings: { ...(post.settings || {}) },
        value: post.values.map((value: any) => ({
          ...(value.id ? { id: value.id } : {}),
          content: value.content,
          delay: value.delay || 0,
          image:
            (value?.media || []).map(
              ({ id, path, alt, thumbnail, thumbnailTimestamp }: any) => ({
                id,
                path,
                alt,
                thumbnail,
                thumbnailTimestamp,
              }),
            ) || [],
        })),
      }));

      if (!dummy) {
        const checkAllValid = await (
          await fetch('/posts/valid', {
            method: 'POST',
            body: JSON.stringify({ type, posts }),
          })
        ).json();

        const focus = (id: string, where: 'fix' | 'preview') => {
          integrationById(id)?.ref?.current?.[where]?.();
        };

        const notEnoughChars = checkAllValid.filter((p: any) => p.emptyContent);

        for (const item of notEnoughChars) {
          toaster.show(
            `${capitalize(item.identifier.split('-')[0])} (${item.name}):` +
              ' ' +
              t(
                'post_needs_content_or_image',
                'Your post should have at least one character or one image.',
              ),
            'warning',
          );
          setLoading(false);
          focus(item.id, 'preview');
          return;
        }

        if (type !== 'draft') {
          for (const item of checkAllValid) {
            if (item.valid === false) {
              toaster.show(
                `${capitalize(item.identifier.split('-')[0])} (${item.name}): ${
                  item.settingsError ||
                  t('please_fix_your_settings', 'Please fix your settings')
                }`,
                'warning',
              );
              focus(item.id, 'fix');
              setLoading(false);
              setShowSettings(true);
              return;
            }

            if (item.errors !== true) {
              toaster.show(
                `${capitalize(item.identifier.split('-')[0])} (${item.name}): ${
                  item.errors
                }`,
                'warning',
              );
              focus(item.id, 'preview');
              setLoading(false);
              setShowSettings(false);
              return;
            }

            if (item.tooLong) {
              toaster.show(
                `${item.name} (${item.identifier}) ${t(
                  'post_is_too_long',
                  'post is too long, please fix it',
                )}`,
                'warning',
              );
              focus(item.id, 'preview');
              setLoading(false);
              return;
            }
          }
        }
      }

      const shortlinkPreference = shortlinkPreferenceData?.shortlink || 'ASK';

      let shortLink = false;

      if (!dummy && shortlinkPreference !== 'NO') {
        const shortLinkUrl = await (
          await fetch('/posts/should-shortlink', {
            method: 'POST',
            body: JSON.stringify({
              messages: allValues
                // platforms that remove links won't keep shortlinks either
                .filter(
                  (p: any) => !integrationById(p.id)?.integration?.stripLinks,
                )
                .flatMap((p: any) => p.values.flatMap((a: any) => a.content)),
            }),
          })
        ).json();

        if (shortLinkUrl.ask) {
          if (shortlinkPreference === 'YES') {
            // Automatically shortlink without asking
            shortLink = true;
          } else {
            // ASK: Show the dialog
            shortLink = await deleteDialog(
              t(
                'shortlink_urls_question',
                'Do you want to shortlink the URLs? it will let you get statistics over clicks',
              ),
              t('yes_shortlink_it', 'Yes, shortlink it!'),
              undefined,
              t('no_original_urls', 'No, original URLs'),
            );
          }
        }
      }

      const data = {
        type,
        ...(republish ? { republish } : {}),
        ...(repeater ? { inter: repeater } : {}),
        tags,
        shortLink,
        date: date.utc().format('YYYY-MM-DDTHH:mm:ss'),
        posts,
      };

      if (dummy) {
        modal.openModal({
          title: '',
          children: <DummyCodeComponent code={data} />,
          classNames: {
            modal: 'w-[100%] bg-transparent text-foreground',
          },
          size: '100%',
          withCloseButton: false,
          closeOnEscape: true,
          closeOnClickOutside: true,
        });

        setLoading(false);
      }

      if (!dummy) {
        addEditSets
          ? addEditSets(data)
          : await fetch('/posts', {
              method: 'POST',
              body: JSON.stringify(data),
            });

        if (!addEditSets) {
          mutate();
          toaster.show(
            !existingData.integration
              ? t('added_successfully', 'Added successfully')
              : t('updated_successfully', 'Updated successfully'),
          );
        }
        if (customClose) {
          setTimeout(() => {
            customClose();
          }, 2000);
        }

        if (!addEditSets) {
          modal.closeAll();
        }
      }
    },
    [
      ref,
      repeater,
      tags,
      date,
      addEditSets,
      dummy,
      shortlinkPreferenceData,
      isPublished,
    ],
  );

  // Files can be dropped anywhere on the dialog; they are routed to the
  // last-focused post editor (falling back to the first one).
  const onDropFiles = useCallback((files: File[]) => {
    const state = useLaunchStore.getState();
    const handler =
      state.dropHandlers[state.activeDropTarget || ''] ||
      state.dropHandlers['post-0'] ||
      Object.values(state.dropHandlers)[0];
    handler?.(files);
  }, []);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop: onDropFiles,
    noClick: true,
    noKeyboard: true,
    noDrag: isPublished,
  });

  return (
    <div
      {...getRootProps()}
      className="relative flex h-full w-full flex-1 p-[40px]"
    >
      {isDragActive && (
        <div className="border-primary bg-background/85 text-foreground pointer-events-none absolute inset-0 z-[150] flex flex-col items-center justify-center gap-[10px] rounded-[20px] border-2 border-dashed backdrop-blur-sm">
          <Upload size={32} />
          <div className="text-[16px] font-[600]">
            {t('drop_files_here_to_upload', 'Drop your files here to upload')}
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col rounded-[20px]">
        <div className="flex flex-1">
          <div className="border-border flex flex-1 flex-col border-e">
            <div className="bg-background flex h-[65px] items-center gap-[12px] rounded-s-[20px] !rounded-b-[0] px-[20px] text-[20px] font-[600]">
              {t('create_post_title', 'Create Post')}
              <CreationMethodBadge
                creationMethod={existingData?.posts?.[0]?.creationMethod}
                size="sm"
              />
            </div>
            <div className="flex flex-1 flex-col gap-[16px]">
              <div className={cn('relative flex-1', showSettings && 'hidden')}>
                <div
                  id="social-content"
                  className="scrollbar scrollbar-thumb-muted scrollbar-track-transparent absolute top-0 left-0 flex h-full w-full flex-col gap-[32px] overflow-x-hidden overflow-y-auto ps-[20px] pe-[8px] pt-[20px]"
                >
                  <div
                    className={cn(
                      'flex w-full',
                      isPublished && 'pointer-events-none opacity-50',
                    )}
                  >
                    <div className="flex flex-1">
                      <PicksSocialsComponent toolTip={true} />
                    </div>
                    <div>
                      {!dummy && (
                        <SelectCustomer
                          onChange={changeCustomer}
                          integrations={integrations}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-[6px]">
                    <div>{!existingData.integration && <SelectCurrent />}</div>
                    <div className="flex flex-1">
                      {!hide && <EditorWrapper totalPosts={1} value="" />}
                    </div>
                    <div
                      id="social-empty"
                      className={cn(
                        'pb-[16px]',
                        // current !== 'global' && 'hidden'
                      )}
                    />
                  </div>
                </div>
              </div>
              <div
                id="wrapper-settings"
                className={cn(
                  'px-[20px] pb-[20px] select-none',
                  showSettings && 'flex flex-1 pt-[20px]',
                  current === 'global' && 'hidden',
                )}
              >
                <div className="flex flex-1 flex-col gap-[12px] overflow-hidden rounded-[12px]">
                  <div
                    onClick={() => setShowSettings(!showSettings)}
                    className={cn(
                      'bg-primary flex cursor-pointer items-center gap-[8px] rounded-[12px] p-[12px]',
                      showSettings ? '!rounded-b-none' : '',
                    )}
                  >
                    <div className="text-primary-foreground flex-1 text-[14px] font-[600]">
                      {currentIntegrationText}
                    </div>
                    <div>
                      <ChevronDownIcon
                        rotated={showSettings}
                        className="text-primary-foreground"
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      !showSettings ? 'hidden' : 'flex-1',
                      'text-foreground relative text-[14px] font-[500]',
                    )}
                  >
                    <div className="scrollbar scrollbar-thumb-card scrollbar-track-muted absolute top-0 left-0 flex h-full w-full flex-col overflow-x-hidden overflow-y-auto">
                      <div
                        id="social-settings"
                        className="bg-background flex flex-col gap-[20px]"
                      />
                    </div>
                  </div>
                  <style>
                    {`#social-settings [data-id="${current}"] {display: block !important;}`}
                  </style>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-[580px] flex-col">
            <div className="bg-background flex h-[65px] items-center rounded-e-[20px] !rounded-b-[0] px-[20px] text-[20px] font-[600]">
              <div className="flex-1">{t('post_preview', 'Post Preview')}</div>
              <div className="cursor-pointer">
                <CloseIcon
                  onClick={askClose}
                  className="text-muted-foreground"
                />
              </div>
            </div>
            <div className="relative flex-1">
              <Scrollable
                scrollClasses="!pe-[20px]"
                className="scrollbar scrollbar-thumb-muted scrollbar-track-transparent absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-auto p-[20px] pe-[8px]"
              >
                <ShowAllProviders ref={ref} />
              </Scrollable>
            </div>
          </div>
        </div>
        <div className="border-border flex h-[84px] items-center border-t py-[20px] select-none">
          <div
            className={cn(
              'flex flex-1 gap-[8px] ps-[20px]',
              isPublished && 'pointer-events-none opacity-50',
            )}
          >
            {!dummy && (
              <TagsComponent
                name="tags"
                label={t('tags', 'Tags')}
                initial={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                }}
              />
            )}

            {!dummy && (
              <RepeatComponent repeat={repeater} onChange={setRepeater} />
            )}
          </div>
          <div className="flex items-center justify-end gap-[8px] pe-[20px]">
            {existingData?.integration && (
              <Button
                variant="ghost"
                onClick={deletePost}
                className="text-destructive hover:text-destructive"
              >
                <TrashIcon />
                {t('delete_post', 'Delete Post')}
              </Button>
            )}
            <div
              className={cn(isPublished && 'pointer-events-none opacity-50')}
            >
              <DatePicker onChange={setDate} date={date} />
            </div>
            {!addEditSets && !isPublished && (
              <Button
                variant="outline"
                size="lg"
                disabled={
                  selectedIntegrations.length === 0 || loading || locked
                }
                isLoading={loading}
                showSpinner={true}
                onClick={schedule('draft')}
              >
                {t('save_as_draft', 'Save as Draft')}
              </Button>
            )}
            {addEditSets && (
              <Button
                size="lg"
                className="min-w-[180px]"
                disabled={
                  selectedIntegrations.length === 0 || loading || locked
                }
                isLoading={loading}
                showSpinner={true}
                onClick={schedule('draft')}
              >
                Save Set
              </Button>
            )}
            {!addEditSets && isPublished && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      size="lg"
                      className="min-w-[180px]"
                      disabled={
                        selectedIntegrations.length === 0 || loading || locked
                      }
                      isLoading={loading}
                      showSpinner={true}
                      onClick={schedule('now')}
                    >
                      {t('republish', 'Republish')}
                    </Button>
                  </span>
                </TooltipTrigger>
                {selectedIntegrations.length === 0 && (
                  <TooltipContent>
                    {t(
                      'select_at_least_one_channel',
                      'Select at least one channel above',
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            )}
            {!addEditSets && !isPublished && (
              <>
                {!dummy && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="secondary"
                          size="lg"
                          disabled={
                            selectedIntegrations.length === 0 ||
                            loading ||
                            locked
                          }
                          isLoading={loading}
                          showSpinner={true}
                          onClick={schedule('now')}
                        >
                          {t('post_now', 'Post Now')}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {selectedIntegrations.length === 0 && (
                      <TooltipContent>
                        {t(
                          'select_at_least_one_channel',
                          'Select at least one channel above',
                        )}
                      </TooltipContent>
                    )}
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        size="lg"
                        className="min-w-[180px]"
                        disabled={
                          selectedIntegrations.length === 0 || loading || locked
                        }
                        isLoading={loading}
                        showSpinner={true}
                        onClick={schedule('schedule')}
                      >
                        {dummy
                          ? t('create_output', 'Create output')
                          : !existingData?.integration
                            ? t('add_to_calendar', 'Add to calendar')
                            : existingData?.posts?.[0]?.state === 'DRAFT'
                              ? t('schedule', 'Schedule')
                              : t('update', 'Update')}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {selectedIntegrations.length === 0 && (
                    <TooltipContent>
                      {t(
                        'select_at_least_one_channel',
                        'Select at least one channel above',
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>
      <CopilotPopup
        hitEscapeToClose={false}
        clickOutsideToClose={true}
        instructions={`
You are an assistant that help the user to schedule their social media posts,
Here are the things you can do:
- Add a new comment / post to the list of posts
- Delete a comment / post from the list of posts
- Add content to the comment / post
- Activate or deactivate the comment / post

Post content can be added using the addPostContentFor{num} function.
After using the addPostFor{num} it will create a new addPostContentFor{num+ 1} function.
`}
        labels={{
          title: t('your_assistant', 'Your Assistant'),
          initial: t(
            'assistant_initial_message',
            'Hi! I can help you to refine your social media posts.',
          ),
        }}
      />
    </div>
  );
};

const Scrollable: FC<{
  className: string;
  scrollClasses: string;
  children: ReactNode;
}> = ({ className, scrollClasses, children }) => {
  const ref = useRef(undefined);
  const hasScroll = useHasScroll(ref);
  return (
    <div className={cn(className, hasScroll && scrollClasses)} ref={ref}>
      {children}
    </div>
  );
};
