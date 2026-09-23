'use client';

import {
  PostComment, withProvider
} from '@gitroom/frontend/components/new-launch/providers/high.order.provider';
import { FC, useState } from 'react';
import { SkoolDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/skool.dto';
import { SkoolGroupSelect } from '@gitroom/frontend/components/new-launch/providers/skool/skool.group.select';
import { SkoolLabelSelect } from '@gitroom/frontend/components/new-launch/providers/skool/skool.label.select';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import { Input } from '@gitroom/react/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@gitroom/react/ui/form';
const SkoolComponent: FC = () => {
  const form = useSettings();
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(
    form.getValues().group
  );
  const groupRegister = form.register('group');
  const onGroupChange = (event: { target: { value: string; name: string } }) => {
    setSelectedGroup(event.target.value);
    groupRegister.onChange(event);
  };
  return (
    <div>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <SkoolGroupSelect {...groupRegister} onChange={onGroupChange} />
      <SkoolLabelSelect {...form.register('label')} groupId={selectedGroup} />
    </div>
  );
};
export default withProvider({
  minimumCharacters: [],
  SettingsComponent: SkoolComponent,
  CustomPreviewComponent: undefined,
  dto: SkoolDto,
  maximumCharacters: 50000,
  postComment: PostComment.ALL,
});
