import React from 'react';
import { APP_SHELL_MAX_WIDTH_CLASS } from '../../constants/layout';

export const MobileWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div data-app-shell-root className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#e8eaed]">
      <div
        data-app-shell
        className={`mx-auto flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#f8f9fa] text-slate-800 font-sans relative sm:shadow-xl ${APP_SHELL_MAX_WIDTH_CLASS} @container`}
      >
        {children}
      </div>
    </div>
  );
};
