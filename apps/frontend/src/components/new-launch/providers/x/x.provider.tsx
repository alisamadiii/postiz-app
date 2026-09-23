'use client';

import {
  PostComment,
  withProvider,
} from '@gitroom/frontend/components/new-launch/providers/high.order.provider';
import { ThreadFinisher } from '@gitroom/frontend/components/new-launch/finisher/thread.finisher';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gitroom/react/ui/select';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import { XDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/x.dto';
import { Input } from '@gitroom/react/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@gitroom/react/ui/form';
import { Checkbox } from '@gitroom/react/form/checkbox';
import { MediaComponent } from '@gitroom/frontend/components/media/media.component';

const whoCanReply = [
  {
    label: 'Everyone',
    value: 'everyone',
  },
  {
    label: 'Accounts you follow',
    value: 'following',
  },
  {
    label: 'Mentioned accounts',
    value: 'mentionedUsers',
  },
  {
    label: 'Subscribers',
    value: 'subscribers',
  },
  {
    label: 'Verified accounts',
    value: 'verified',
  },
];

const SettingsComponent = () => {
  const t = useT();
  const form = useSettings();
  const { register, watch, setValue } = form;
  const postType = watch('post_type') || 'post';

  return (
    <>
      <FormField
        control={form.control}
        name="post_type"
        defaultValue="post"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('label_post_type', 'Post type')}</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? undefined}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="mb-5 h-[42px]">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="post">
                  {t('label_post_type_post', 'Post')}
                </SelectItem>
                <SelectItem value="article">
                  {t('label_post_type_article', 'Article (long-form)')}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {postType === 'article' ? (
        <>
          <FormField
            control={form.control}
            name="article_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('label_article_title', 'Article title')}
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="article_status"
            defaultValue="draft"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('label_article_status', 'Article status')}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="mb-5 h-[42px]">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">
                      {t('label_article_status_draft', 'Save as draft')}
                    </SelectItem>
                    <SelectItem value="published">
                      {t('label_article_status_published', 'Publish')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <MediaComponent
            type="image"
            label={t('label_article_cover', 'Cover image')}
            description={t(
              'description_article_cover',
              'Cover picture for the article (optional)'
            )}
            {...register('article_cover')}
          />
        </>
      ) : (
        <>
          <FormField
            control={form.control}
            name="who_can_reply_post"
            defaultValue="everyone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(
                    'label_who_can_reply_to_this_post',
                    'Who can reply to this post?'
                  )}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="mb-5 h-[42px]">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {whoCanReply.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="community"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {
                    'Post to a community, URL (Ex: https://x.com/i/communities/1493446837214187523)'
                  }
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-5 flex flex-col gap-[10px]">
            <Checkbox
              label={t('label_made_with_ai', 'Made with AI')}
              {...register('made_with_ai')}
            />
            <Checkbox
              label={t('label_paid_partnership', 'Paid partnership')}
              {...register('paid_partnership')}
            />
          </div>

          <ThreadFinisher />
        </>
      )}
    </>
  );
};

export default withProvider({
  postComment: PostComment.POST,
  minimumCharacters: [],
  SettingsComponent: SettingsComponent,
  CustomPreviewComponent: undefined,
  dto: XDto,
  maximumCharacters: (settings) => {
    if (settings?.[0]?.value) {
      return 4000;
    }
    return 280;
  },
});
