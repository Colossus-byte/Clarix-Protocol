import React from 'react';
import { useNewbieMode } from '../contexts/NewbieModeContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { motion, AnimatePresence } from 'motion/react';

const LearningModeBanner: React.FC = () => {
  const { isNewbieMode } = useNewbieMode();
  const { progress, updateProgress, user } = useFirebase();

  const isDismissed = !!progress?.learningBannerDismissed;

  const handleDismiss = () => {
    if (user) {
      updateProgress({ learningBannerDismissed: true });
    }
  };

  return (
    <AnimatePresence>
      {isNewbieMode && !isDismissed && (
        <motion.div
          key="learning-mode-banner"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
        >
          <div className="px-4 md:px-5 py-3 rounded-full bg-surface/95 backdrop-blur-md border border-hyper-gold/30 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex items-center gap-3 mx-auto w-fit">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-hyper-gold/20 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-graduation-cap text-hyper-gold text-xs md:text-sm"></i>
            </div>
            <span className="text-[10px] md:text-sm font-medium text-white">
              You're in <span className="text-hyper-gold font-bold">Learning Mode</span>. Everything is explained as you go.
            </span>
            {user && (
              <button
                onClick={handleDismiss}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition-all ml-1"
                aria-label="Dismiss learning mode banner"
              >
                <i className="fa-solid fa-xmark text-slate-400 text-[9px]"></i>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LearningModeBanner;
