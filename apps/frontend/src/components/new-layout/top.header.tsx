'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { Title } from '@gitroom/frontend/components/layout/title';
import { StreakComponent } from '@gitroom/frontend/components/layout/streak.component';
import { OrganizationSelector } from '@gitroom/frontend/components/layout/organization.selector';
import { ChromeExtensionComponent } from '@gitroom/frontend/components/layout/chrome.extension.component';
import { AttachToFeedbackIcon } from '@gitroom/frontend/components/new-layout/sentry.feedback.component';
import NotificationComponent from '@gitroom/frontend/components/notifications/notification.component';

const ModeComponent = dynamic(
  () => import('@gitroom/frontend/components/layout/mode.component'),
  {
    ssr: false,
  }
);

export const TopHeader: FC = () => {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-[12px] border-b border-border bg-sidebar px-[20px]">
      <div className="text-[18px] font-[600] flex flex-1">
        <Title />
      </div>
      <div className="flex items-center gap-[20px] text-muted-foreground">
        <StreakComponent />
        <OrganizationSelector />
        <div className="hover:text-foreground">
          <ModeComponent />
        </div>
        <ChromeExtensionComponent />
        <AttachToFeedbackIcon />
        <NotificationComponent />
      </div>
    </header>
  );
};
