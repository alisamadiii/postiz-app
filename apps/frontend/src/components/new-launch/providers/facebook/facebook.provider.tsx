'use client';

import {
  PostComment,
  withProvider,
} from '@gitroom/frontend/components/new-launch/providers/high.order.provider';
import {
  FacebookDto,
  FACEBOOK_PRESETS,
} from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/facebook.dto';
import { getPresetBackground } from '@gitroom/frontend/components/new-launch/providers/facebook/facebook.background';
import { Input } from '@gitroom/react/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gitroom/react/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@gitroom/react/ui/form';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import { useIntegration } from '@gitroom/frontend/components/launches/helpers/use.integration';
import { FacebookPreview } from '@gitroom/frontend/components/new-launch/providers/facebook/facebook.preview';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useEffect } from 'react';

const postType = [
  {
    value: 'post',
    label: 'Post',
  },
  {
    value: 'story',
    label: 'Story',
  },
];

export const FacebookSettings = () => {
  const t = useT();
  const { watch, setValue, control } = useSettings();
  const { value } = useIntegration();
  const postCurrentType = watch('post_type');
  const preset = watch('text_format_preset_id');

  // Facebook background presets only render on text-only Page posts (no media).
  const hasMedia = !!value?.some((p) => !!p.image?.length);
  const presetAvailable = postCurrentType !== 'story' && !hasMedia;
  const selectedBg = getPresetBackground(preset);

  // Clear any selected background when it can no longer apply (story / media),
  // so a stray combination never reaches the provider.
  useEffect(() => {
    if (!presetAvailable && preset) {
      setValue('text_format_preset_id', '');
    }
  }, [presetAvailable, preset, setValue]);

  return (
    <>
      <div className="pt-[20px]">
        <FormField
          control={control}
          name="post_type"
          defaultValue="post"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? undefined}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-[42px]">
                    <SelectValue
                      placeholder={t(
                        'select_post_type',
                        'Select Post Type...'
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {postType.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {postCurrentType !== 'story' && (
        <FormField
          control={control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Embedded URL (only for text Post)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {presetAvailable && (
        <>
          <FormField
            control={control}
            name="text_format_preset_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Background (applies to text-only posts shorter than 130
                  characters)
                </FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === '__none__' ? '' : value)
                  }
                  value={field.value ? String(field.value) : '__none__'}
                  defaultValue={field.value ? String(field.value) : '__none__'}
                >
                  <FormControl>
                    <SelectTrigger
                      className="h-[42px]"
                      style={
                        selectedBg
                          ? {
                              background: selectedBg.background,
                              color: selectedBg.text,
                            }
                          : undefined
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      value="__none__"
                      style={{ background: '#ffffff', color: '#1c1e21' }}
                    >
                      {t('facebook_background_none', 'None (plain text)')}
                    </SelectItem>
                    {FACEBOOK_PRESETS.map((item) => {
                      const bg = getPresetBackground(item.id);
                      return (
                        <SelectItem
                          key={item.id}
                          value={item.id}
                          style={
                            bg
                              ? { background: bg.background, color: bg.text }
                              : undefined
                          }
                        >
                          {item.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <div className="text-[12px] opacity-70 mt-[8px]">
            {t(
              'facebook_background_note',
              'Unofficial list: the colors shown are approximate, an unsupported background is dropped (published as plain text)'
            )}
          </div>
        </>
      )}
    </>
  );
};

export default withProvider<FacebookDto>({
  postComment: PostComment.COMMENT,
  minimumCharacters: [],
  SettingsComponent: FacebookSettings,
  CustomPreviewComponent: FacebookPreview,
  dto: FacebookDto,
  maximumCharacters: 63206,
});
