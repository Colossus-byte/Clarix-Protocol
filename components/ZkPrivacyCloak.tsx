
import React from 'react';

interface ZkPrivacyCloakProps {
  isActive: boolean;
  onToggle: () => void;
}

const ZkPrivacyCloak: React.FC<ZkPrivacyCloakProps> = ({ isActive, onToggle }) => {
  return (
    <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-surface border border-white/5 flex items-center justify-between group transition-all hover:border-white/10">
      <div className="flex items-center gap-3 md:gap-4">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-cyber-lime text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-white/5 text-slate-500'}`}>
          <i className={`fa-solid ${isActive ? 'fa-user-secret' : 'fa-user'} text-xs md:text-sm`}></i>
        </div>
        <div>
          <h4 className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest mb-0.5 md:mb-1">ZK-Cloaking Protocol</h4>
          <p className="text-[7px] md:text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em]">{isActive ? 'PROOF GENERATION: ACTIVE' : 'IDENTITY: PUBLIC'}</p>
        </div>
      </div>
      
      <button 
        onClick={onToggle}
        className={`relative w-10 h-5 md:w-12 md:h-6 rounded-full transition-all ${isActive ? 'bg-cyber-lime' : 'bg-white/10'}`}
      >
        <div className={`absolute top-0.5 md:top-1 w-4 h-4 rounded-full bg-white transition-all ${isActive ? 'left-5.5 md:left-7 bg-black' : 'left-0.5 md:left-1'}`}></div>
      </button>
    </div>
  );
};

export default ZkPrivacyCloak;
