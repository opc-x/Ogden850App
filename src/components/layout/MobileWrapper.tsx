import React from 'react';
import { APP_SHELL_MAX_WIDTH_CLASS } from '../../constants/layout';

export const MobileWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-[100dvh] w-full bg-[#e8eaed] flex justify-center">
      <div
        data-app-shell
        className={`w-full ${APP_SHELL_MAX_WIDTH_CLASS} h-[100dvh] bg-[#f8f9fa] text-slate-800 flex flex-col font-sans relative overflow-hidden sm:shadow-xl @container`}
      >
        {children}
      </div>
    </div>
  );
};
