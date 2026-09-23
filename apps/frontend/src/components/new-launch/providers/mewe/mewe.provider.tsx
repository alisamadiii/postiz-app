'use client';

import {
  PostComment,
  withProvider,
} from '@gitroom/frontend/components/new-launch/providers/high.order.provider';
import { FC } from 'react';
import { MeweDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/mewe.dto';
import { MeweGroupSelect } from '@gitroom/frontend/components/new-launch/providers/mewe/mewe.group.select';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
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
import { useWatch } from 'react-hook-form';

const MeweComponent: FC = () => {
  const form = useSettings();
  const postType = useWatch({ control: form.control, name: 'postType' });

  return (
    <div>
      <FormField
        control={form.control}
        name="postType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Post To</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? undefined}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="h-[42px]">
                  <SelectValue placeholder="Post To" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="timeline">My Timeline</SelectItem>
                <SelectItem value="group">Group</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {postType === 'group' && (
        <MeweGroupSelect {...form.register('group')} />
      )}
    </div>
  );
};

export default withProvider({
  postComment: PostComment.POST,
  comments: false,
  minimumCharacters: [],
  SettingsComponent: MeweComponent,
  CustomPreviewComponent: undefined,
  dto: MeweDto,
  maximumCharacters: 63206,
});
