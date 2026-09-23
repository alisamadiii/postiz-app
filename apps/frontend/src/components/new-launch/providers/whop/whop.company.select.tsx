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

export const WhopCompanySelect: FC<{
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
  const [companies, setCompanies] = useState([]);
  const { getValues } = useSettings();
  const [currentCompany, setCurrentCompany] = useState<string | undefined>();
  const onChangeInner = (event: {
    target: {
      value: string;
      name: string;
    };
  }) => {
    setCurrentCompany(event.target.value);
    onChange(event);
  };
  useEffect(() => {
    customFunc.get('companies').then((data) => setCompanies(data));
    const settings = getValues()[props.name];
    if (settings) {
      setCurrentCompany(settings);
    }
  }, []);
  if (!companies.length) {
    return null;
  }
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="text-[14px]">
        {t('label_select_company', 'Select Company')}
      </div>
      <Select
        value={currentCompany != null ? String(currentCompany) : undefined}
        onValueChange={(value) =>
          onChangeInner({ target: { value, name } })
        }
      >
        <SelectTrigger className="h-[42px]">
          <SelectValue placeholder={t('select_1', '--Select--')} />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company: any) => (
            <SelectItem key={company.id} value={String(company.id)}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
