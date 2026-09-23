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

export const MeweGroupSelect: FC<{
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
  const [groups, setGroups] = useState([]);
  const { getValues } = useSettings();
  const [currentGroup, setCurrentGroup] = useState<string | undefined>();

  const onChangeInner = (event: {
    target: {
      value: string;
      name: string;
    };
  }) => {
    setCurrentGroup(event.target.value);
    onChange(event);
  };

  useEffect(() => {
    customFunc.get('groups').then((data) => setGroups(data));
    const settings = getValues()[props.name];
    if (settings) {
      setCurrentGroup(settings);
    }
  }, []);

  if (!groups.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[6px]">
      <div className="text-[14px]">Select Group</div>
      <Select
        value={currentGroup || undefined}
        onValueChange={(value) => onChangeInner({ target: { value, name } })}
      >
        <SelectTrigger className="h-[42px]">
          <SelectValue placeholder={t('select_1', '--Select--')} />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group: any) => (
            <SelectItem key={group.id} value={String(group.id)}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
