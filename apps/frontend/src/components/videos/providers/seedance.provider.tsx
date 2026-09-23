import { videoWrapper } from '@gitroom/frontend/components/videos/video.wrapper';
import { FC, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useVideo } from '@gitroom/frontend/components/videos/video.context.wrapper';
import { Textarea } from '@gitroom/react/ui/textarea';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@gitroom/react/ui/form';
import { MultiMediaComponent } from '@gitroom/frontend/components/media/media.component';
import { hasExtension } from '@gitroom/helpers/utils/has.extension';

export interface Voice {
  id: string;
  name: string;
  preview_url: string;
}

const SeedanceSettings: FC = () => {
  const { register, watch, setValue, formState, control } = useFormContext();
  const { value } = useVideo();

  const media = register('media', {
    value: [],
  });

  const mediaValue = watch('media');

  return (
    <div>
      <FormField
        control={control}
        name="prompt"
        defaultValue={value}
        rules={{
          required: true,
          minLength: 5,
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prompt</FormLabel>
            <FormControl>
              <Textarea {...field} className="min-h-[150px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="mb-[6px]">Images (max 3)</div>
      <MultiMediaComponent
        allData={[]}
        dummy={true}
        text="Images"
        description="Images"
        name="images"
        label="Media"
        value={mediaValue}
        onChange={(val) =>
          setValue(
            'images',
            val.target.value
              .filter((f) => !hasExtension(f.path, 'mp4'))
              .slice(0, 3)
          )
        }
        error={formState?.errors?.media?.message}
      />
    </div>
  );
};

const SeedanceComponent = () => {
  return <SeedanceSettings />;
};

videoWrapper('seedance', SeedanceComponent);
