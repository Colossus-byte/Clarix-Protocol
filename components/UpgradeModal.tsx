import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: string) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="w-14 h-14 rounded-2xl bg-cyber-lime/10 border border-cyber-lime/20 flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-rocket text-cyber-lime text-xl"></i>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-lime/10 border border-cyber-lime/20 mb-4">
            <i className="fa-solid fa-circle-check text-cyber-lime text-xs"></i>
            <span className="text-[10px] font-bold text-cyber-lime uppercase tracking-widest">Beta Access</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-3">Everything is free during beta</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Clarix is completely free during beta. All features are unlocked. Paid plans will be introduced after beta based on community feedback.
          </p>
          <button
            onClick={onClose}
            className="mt-8 w-full py-4 rounded-2xl bg-cyber-lime text-black font-black uppercase tracking-widest text-xs hover:bg-lime-300 transition-all"
          >
            Got it — explore everything
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UpgradeModal;
