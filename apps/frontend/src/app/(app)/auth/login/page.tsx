import { Metadata } from 'next';

import { isGeneralServerSide } from '@gitroom/helpers/utils/is.general.server.side';
import { Login } from '@gitroom/frontend/components/auth/login';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Postiz' : 'Gitroom'} Login`,
  description: '',
};
export default async function Auth() {
  return <Login />;
}
