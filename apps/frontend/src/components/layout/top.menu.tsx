'use client';

import { FC, ReactNode, useCallback } from 'react';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { MenuItem } from '@gitroom/frontend/components/new-layout/menu-item';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { AgentMediaModal } from '@gitroom/frontend/components/layout/agent.media.modal';
import {
  Calendar,
  LineChart,
  Image,
  Video,
  Users,
  CreditCard,
  Settings,
} from 'lucide-react';

interface MenuItemInterface {
  name: string;
  icon: ReactNode;
  path: string;
  role?: string[];
  hide?: boolean;
  requireBilling?: boolean;
  onClick?: () => void;
}

export const useMenuItem = () => {
  const { isGeneral } = useVariables();
  const t = useT();
  const { openModal } = useModals();

  const handleAgentMediaClick = useCallback(() => {
    openModal({
      title: t('agent_media_title', 'UGC videos by AgentMedia'),
      closeOnClickOutside: true,
      closeOnEscape: true,
      children: <AgentMediaModal />,
    });
  }, [openModal, t]);

  const firstMenu = [
    {
      name: isGeneral ? t('calendar', 'Calendar') : t('launches', 'Launches'),
      icon: <Calendar className="size-5" />,
      path: '/launches',
    },
    {
      name: t('analytics', 'Analytics'),
      icon: <LineChart className="size-5" />,
      path: '/analytics',
    },
    {
      name: t('media', 'Media'),
      icon: <Image className="size-5" />,
      path: '/media',
    },
  ] satisfies MenuItemInterface[] as MenuItemInterface[];

  const secondMenu = [
    {
      name: t('UGC', 'UGC'),
      icon: <Video className="size-5 text-[#c52e2e]" />,
      path: '#',
      role: ['ADMIN', 'SUPERADMIN', 'USER'],
      requireBilling: true,
      onClick: handleAgentMediaClick,
    },
    {
      name: t('affiliate', 'Affiliate'),
      icon: <Users className="size-5" />,
      path: 'https://affiliate.postiz.com',
      role: ['ADMIN', 'SUPERADMIN', 'USER'],
      requireBilling: true,
    },
    {
      name: t('billing', 'Billing'),
      icon: <CreditCard className="size-5" />,
      path: '/billing',
      role: ['ADMIN', 'SUPERADMIN'],
      requireBilling: true,
    },
    {
      name: t('settings', 'Settings'),
      icon: <Settings className="size-5" />,
      path: '/settings',
      role: ['ADMIN', 'USER', 'SUPERADMIN'],
    },
  ] satisfies MenuItemInterface[] as MenuItemInterface[];

  return {
    all: [...firstMenu, ...secondMenu],
    firstMenu,
    secondMenu,
  };
};

export const TopMenu: FC = () => {
  const user = useUser();
  const { firstMenu, secondMenu } = useMenuItem();
  const { isGeneral, billingEnabled } = useVariables();
  return (
    <>
      <div className="flex flex-1 flex-col minCustom:gap-[16px] blurMe">
        {
          // @ts-ignore
          user?.orgId &&
            // @ts-ignore
            (user.tier !== 'FREE' || !isGeneral || !billingEnabled) &&
            firstMenu
              .filter((f) => {
                if (f.hide) {
                  return false;
                }
                if (f.requireBilling && !billingEnabled) {
                  return false;
                }
                if (f.name === 'Billing' && user?.isLifetime) {
                  return false;
                }
                if (f.role) {
                  return f.role.includes(user?.role!);
                }
                return true;
              })
              .map((item, index) => (
                <MenuItem
                  path={item.path}
                  label={item.name}
                  icon={item.icon}
                  key={item.name}
                  onClick={item.onClick}
                />
              ))
        }
      </div>
      <div className="flex flex-col minCustom:gap-[20px] custom:gap-[8px] blurMe">
        {secondMenu
          .filter((f) => {
            if (f.hide) {
              return false;
            }
            if (f.requireBilling && !billingEnabled) {
              return false;
            }
            if (f.name === 'Billing' && user?.isLifetime) {
              return false;
            }
            if (f.role) {
              return f.role.includes(user?.role!);
            }
            return true;
          })
          .map((item, index) => (
            <MenuItem
              path={item.path}
              label={item.name}
              icon={item.icon}
              key={item.name}
              onClick={item.onClick}
            />
          ))}
      </div>
    </>
  );
};
