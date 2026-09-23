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
import { TranslatedLabel } from '@gitroom/react/translation/translated-label';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
export const PinterestBoard: FC<{
  name: string;
  onChange: (event: {
    target: {
      value: string;
      name: string;
    };
  }) => void;
}> = (props) => {
  const { onChange, name } = props;
  const t = useT();

  const customFunc = useCustomProviderFunction();
  const [orgs, setOrgs] = useState<undefined | any[]>();
  const { getValues } = useSettings();
  const [currentMedia, setCurrentMedia] = useState<string | undefined>();
  const onChangeInner = (event: {
    target: {
      value: string;
      name: string;
    };
  }) => {
    setCurrentMedia(event.target.value);
    onChange(event);
  };
  useEffect(() => {
    customFunc.get('boards').then((data) => setOrgs(data));
    const settings = getValues()[props.name];
    if (settings) {
      setCurrentMedia(settings);
    }
  }, []);
  if (!orgs) {
    return null;
  }
  if (!orgs.length) {
    return 'No boards found, you have to create a board first';
  }
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="text-[14px]">
        <TranslatedLabel label="Select board" />
      </div>
      <Select
        value={currentMedia != null ? String(currentMedia) : undefined}
        onValueChange={(value) => onChangeInner({ target: { value, name } })}
      >
        <SelectTrigger className="h-[42px]">
          <SelectValue placeholder={t('select_1', '--Select--')} />
        </SelectTrigger>
        <SelectContent>
          {orgs.map((org: any) => (
            <SelectItem key={org.id} value={String(org.id)}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
