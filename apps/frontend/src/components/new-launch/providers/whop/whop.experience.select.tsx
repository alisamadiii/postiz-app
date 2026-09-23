'use client';

import { FC, useEffect, useState } from 'react';
import { useCustomProviderFunction } from '@gitroom/frontend/components/launches/helpers/use.custom.provider.function';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gitroom/react/ui/select';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

export const WhopExperienceSelect: FC<{
  name: string;
  companyId: string | undefined;
  onChange: (event: {
    target: {
      value: string;
      name: string;
    };
  }) => void;
}> = (props) => {
  const { onChange, name, companyId } = props;
  const t = useT();
  const customFunc = useCustomProviderFunction();
  const [experiences, setExperiences] = useState([]);
  const { getValues } = useSettings();
  const [currentExperience, setCurrentExperience] = useState<
    string | undefined
  >();
  const onChangeInner = (event: {
    target: {
      value: string;
      name: string;
    };
  }) => {
    setCurrentExperience(event.target.value);
    onChange(event);
  };
  useEffect(() => {
    if (!companyId) {
      setExperiences([]);
      setCurrentExperience(undefined);
      return;
    }
    customFunc
      .get('experiences', { id: companyId })
      .then((data) => setExperiences(data));
  }, [companyId]);
  useEffect(() => {
    const settings = getValues()[name];
    if (settings) {
      setCurrentExperience(settings);
    }
  }, []);
  if (!companyId || !experiences.length) {
    return null;
  }
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="text-[14px]">
        {t('label_select_forum', 'Select Forum')}
      </div>
      <Select
        value={
          currentExperience != null ? String(currentExperience) : undefined
        }
        onValueChange={(value) =>
          onChangeInner({ target: { value, name } })
        }
      >
        <SelectTrigger className="h-[42px]">
          <SelectValue placeholder={t('select_1', '--Select--')} />
        </SelectTrigger>
        <SelectContent>
          {experiences.map((experience: any) => (
            <SelectItem key={experience.id} value={String(experience.id)}>
              {experience.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
