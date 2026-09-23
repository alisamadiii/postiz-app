export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import loadDynamic from 'next/dynamic';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
import { MantineWrapper } from '@gitroom/react/helpers/mantine.wrapper';
import { Toaster } from '@gitroom/react/toaster/toaster';
const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MantineWrapper>
      <Toaster />
      <ReturnUrlComponent />
      <main className="bg-background text-foreground flex min-h-dvh items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <LogoTextComponent />
          {children}
        </div>
      </main>
    </MantineWrapper>
  );
}
