'use client';

import { useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

const ModeComponent = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const changeMode = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return (
    <div onClick={changeMode} className="select-none cursor-pointer">
      {resolvedTheme === 'dark' ? (
        <Sun width={22} height={22} />
      ) : (
        <Moon width={24} height={24} />
      )}
    </div>
  );
};
export default ModeComponent;
