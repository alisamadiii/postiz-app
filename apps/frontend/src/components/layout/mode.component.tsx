'use client';

import { useCallback, useEffect, useState } from 'react';
import useCookie from 'react-use-cookie';
import EventEmitter from 'events';
import { Sun, Moon } from 'lucide-react';

export const modeEmitter = new EventEmitter();

const ModeComponent = () => {
  const [mode, setMode] = useCookie('mode', 'dark');

  const changeMode = useCallback(() => {
    modeEmitter.emit('mode', mode === 'dark' ? 'light' : 'dark');
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode]);

  useEffect(() => {
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(mode);
  }, [mode]);
  return (
    <div onClick={changeMode} className="select-none cursor-pointer">
      {mode === 'dark' ? (
        <Sun width={22} height={22} />
      ) : (
        <Moon width={24} height={24} />
      )}
    </div>
  );
};
export default ModeComponent;
