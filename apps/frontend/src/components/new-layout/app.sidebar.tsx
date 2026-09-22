'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useMenuItem } from '@gitroom/frontend/components/layout/top.menu';
import { Logo } from '@gitroom/frontend/components/new-layout/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@gitroom/react/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@gitroom/react/ui/dropdown-menu';
import { ChevronsUpDown } from 'lucide-react';
import { LogoutComponent } from '@gitroom/frontend/components/layout/logout.component';

interface MenuItemInterface {
  name: string;
  icon: ReactNode;
  path: string;
  role?: string[];
  hide?: boolean;
  requireBilling?: boolean;
  onClick?: () => void;
}

const SidebarLink: FC<{ item: MenuItemInterface }> = ({ item }) => {
  const currentPath = usePathname();
  const isExternal = item.path.indexOf('http') === 0;
  const isActive =
    !item.onClick &&
    !isExternal &&
    item.path !== '#' &&
    currentPath.indexOf(item.path) === 0;

  const inner = (
    <>
      {item.icon}
      <span>{item.name}</span>
    </>
  );

  if (item.onClick) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={item.name} onClick={item.onClick}>
          {inner}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.name} isActive={isActive}>
        <Link
          prefetch={true}
          href={item.path}
          {...(isExternal && { target: '_blank' })}
        >
          {inner}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const AppSidebar: FC = () => {
  const user = useUser();
  const { firstMenu, secondMenu } = useMenuItem();
  const { isGeneral, billingEnabled } = useVariables();

  const filterItem = (f: MenuItemInterface) => {
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
  };

  const showFirstMenu =
    // @ts-ignore
    user?.orgId &&
    // @ts-ignore
    (user.tier !== 'FREE' || !isGeneral || !billingEnabled);

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Logo className="w-7 h-7 shrink-0" />
          <span className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Postiz
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {showFirstMenu ? (
          <SidebarGroup>
            <SidebarGroupLabel>Publish</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {firstMenu.filter(filterItem).map((item) => (
                  <SidebarLink item={item} key={item.name} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondMenu.filter(filterItem).map((item) => (
                <SidebarLink item={item} key={item.name} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sm font-medium uppercase text-sidebar-accent-foreground">
                    {initial}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[--radix-popper-anchor-width] min-w-56"
              >
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="p-0"
                >
                  <div className="w-full px-2 py-1.5">
                    <LogoutComponent />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
