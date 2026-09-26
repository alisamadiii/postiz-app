import { ReactNode } from 'react';

// Platforms whose developer policies require disclosure in our Terms / Privacy.
// Keep this list in sync with the integrations you have applied for.
export const SUPPORTED_PLATFORMS =
  'TikTok, Instagram, Facebook, Threads, and Pinterest';

export const LegalSection = ({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) => {
  return (
    <section className="flex flex-col gap-2">
      {title ? (
        <h2 className="text-foreground text-lg font-semibold">{title}</h2>
      ) : null}
      <div className="text-muted-foreground text-sm leading-6">{children}</div>
    </section>
  );
};

export const LegalPage = ({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) => {
  return (
    <main className="bg-background text-foreground min-h-dvh px-6 py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header className="border-border flex flex-col gap-2 border-b pb-6">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground text-sm">Last updated: {updated}</p>
        </header>
        <div className="flex flex-col gap-6">{children}</div>
      </div>
    </main>
  );
};
