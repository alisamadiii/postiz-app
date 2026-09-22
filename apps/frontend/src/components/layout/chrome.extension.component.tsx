import { useVariables } from '@gitroom/react/helpers/variable.context';
import { Globe } from 'lucide-react';
export const ChromeExtensionComponent = () => {
  const { billingEnabled } = useVariables();
  if (!billingEnabled) {
    return null;
  }
  return (
    <a
      href="https://chromewebstore.google.com/detail/postiz/cidhffagahknaeodkplfbcpfeielnkjl"
      target="_blank"
      className="hover:text-foreground"
    >
      <Globe width={22} height={22} />
    </a>
  );
};
