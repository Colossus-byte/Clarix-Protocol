import React, { useState, useEffect } from 'react';
import UpgradeModal from './UpgradeModal';

interface ProFeatureWrapperProps {
  isPro: boolean;
  featureName: string;
  children: React.ReactNode;
  onUpgrade: () => void;
}

const ProFeatureWrapper: React.FC<ProFeatureWrapperProps> = ({ isPro, featureName, children, onUpgrade }) => {
  const [previewState, setPreviewState] = useState<'locked' | 'previewing' | 'modal'>('locked');
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (previewState === 'previewing') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPreviewState('modal');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [previewState]);

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden group">
      {/* The actual feature, blurred if locked, unblurred but unclickable if previewing */}
      <div 
        className={`w-full h-full transition-all duration-1000 ${
          previewState === 'locked' 
            ? 'blur-md select-none opacity-50' 
            : 'blur-none pointer-events-none opacity-100'
        }`}
      >
        {children}
      </div>

      {/* Locked Overlay */}
      {previewState === 'locked' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center max-w-sm transform transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-cyber-lime to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <i className="fa-solid fa-lock text-black text-xl"></i>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-3">{featureName}</h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              This is a Pro feature. See a preview below.
            </p>
            <button
              onClick={() => { setPreviewState('previewing'); setTimeLeft(5); }}
              className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-eye text-cyber-lime"></i>
              Preview Feature
            </button>
          </div>
        </div>
      )}

      {/* Previewing Overlay (Timer) */}
      {previewState === 'previewing' && (
        <div className="absolute top-6 right-6 z-20 bg-black/80 backdrop-blur-md border border-cyber-lime/30 px-6 py-3 rounded-full flex items-center gap-4 animate-in fade-in slide-in-from-top-4 shadow-[0_0_20px_rgba(204,255,0,0.1)]">
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-lime animate-pulse"></div>
          <span className="text-cyber-lime font-mono text-sm font-bold tracking-widest">PREVIEW ENDS IN {timeLeft}S</span>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={previewState === 'modal'}
        onClose={() => setPreviewState('locked')}
        onUpgrade={(plan) => {
          // Trigger the actual upgrade in the parent app
          onUpgrade();
          setPreviewState('locked');
        }}
      />
    </div>
  );
};

export default ProFeatureWrapper;
