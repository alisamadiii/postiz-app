export const dynamic = 'force-dynamic';
import { PlatformsComponent } from '@gitroom/frontend/components/platforms/platforms.component';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Platforms',
  description: '',
};
export default async function Index() {
  return <PlatformsComponent />;
}
