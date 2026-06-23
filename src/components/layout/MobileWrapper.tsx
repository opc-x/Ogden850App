import React from 'react';
import { APP_SHELL_MAX_WIDTH_CLASS } from '../../constants/layout';

export const MobileWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div data-app-shell-root className="h-app-screen w-full bg-[#e8eaed] flex justify-center overflow-hidden">
      <div
        data-app-shell
        className={`w-full ${APP_SHELL_MAX_WIDTH_CLASS} h-app-screen bg-[#f8f9fa] text-slate-800 flex flex-col font-sans relative overflow-hidden sm:shadow-xl @container`}
      >
        {children}
      </div>
    </div>
  );
};
