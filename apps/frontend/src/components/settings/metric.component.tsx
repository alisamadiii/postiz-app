'use client';

import React, { useState } from 'react';
import { isUSCitizen } from '@gitroom/frontend/components/launches/helpers/isuscitizen.utils';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@gitroom/react/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gitroom/react/ui/select';

const dateMetrics = [
  { label: 'AM:PM', value: 'US' },
  { label: '24 hours', value: 'GLOBAL' },
];

const MetricComponent = () => {
  const t = useT();
  const [currentMetric, setCurrentMetric] = useState(isUSCitizen());

  const changeMetric = (value: string) => {
    setCurrentMetric(value === 'US');
    localStorage.setItem('isUS', value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('date_metrics', 'Date Metrics')}</CardTitle>
        <CardDescription>
          {t(
            'date_metrics_description',
            'Choose how times are displayed across the app'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-[24px]">
          <div className="flex flex-col">
            <div className="text-sm font-medium">
              {t('time_format', 'Time format')}
            </div>
            <div className="text-xs text-muted-foreground">
              {t(
                'time_format_description',
                'Display times in 12-hour or 24-hour format'
              )}
            </div>
          </div>
          <Select
            value={currentMetric ? 'US' : 'GLOBAL'}
            onValueChange={changeMetric}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateMetrics.map((metric) => (
                <SelectItem key={metric.value} value={metric.value}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricComponent;
