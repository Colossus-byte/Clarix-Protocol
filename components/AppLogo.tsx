import React from 'react';

interface AppLogoProps {
  /** 'sm' = sidebar size (28px), 'lg' = hero/manifesto size (64px) */
  size?: 'sm' | 'lg';
}

const AppLogo: React.FC<AppLogoProps> = ({ size = 'sm' }) => {
  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
          <i className="fa-solid fa-cube text-white text-2xl"></i>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-white tracking-tight leading-none">Clarix</p>
          <p className="text-xs text-slate-500 mt-0.5">Protocol</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
        <i className="fa-solid fa-cube text-white text-xs"></i>
      </div>
      <div>
        <p className="text-sm font-bold text-white tracking-tight leading-none">Clarix</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Protocol</p>
      </div>
    </div>
  );
};

export default AppLogo;
