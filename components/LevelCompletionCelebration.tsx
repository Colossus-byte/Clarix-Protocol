import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LevelCompletionCelebrationProps {
  isVisible: boolean;
  topicTitle: string;
  xpEarned: number;
  tokensEarned: number;
  nextTopicTitle?: string;
  onDismiss: () => void;
}

const PARTICLE_COUNT = 30;

const Particle: React.FC<{ index: number }> = ({ index }) => {
  const colors = ['bg-cyber-lime', 'bg-electric-violet', 'bg-hyper-gold', 'bg-blue-400', 'bg-rose-400'];
  const color = colors[index % colors.length];
  const left = `${Math.random() * 100}%`;
  const delay = `${Math.random() * 1.5}s`;
  const duration = `${1.5 + Math.random() * 2}s`;
  const size = Math.random() > 0.5 ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <div
      className={`absolute rounded-sm ${color} ${size} opacity-0`}
      style={{
        left,
        top: '-10px',
        animation: `confettiFall ${duration} ${delay} ease-in forwards`,
      }}
    />
  );
};

const LevelCompletionCelebration: React.FC<LevelCompletionCelebrationProps> = ({
  isVisible,
  topicTitle,
  xpEarned,
  tokensEarned,
  nextTopicTitle,
  onDismiss,
}) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isVisible) { setCountdown(5); return; }
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); onDismiss(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          onClick={onDismiss}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
              <Particle key={i} index={i} />
            ))}
          </div>

          {/* Card */}
          <motion.div
            initial={{ scale: 0.5, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="relative z-10 w-full max-w-md mx-4 p-8 rounded-[2.5rem] bg-surface border border-white/10 shadow-2xl shadow-cyber-lime/10 text-center"
          >
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-cyber-lime/5 blur-2xl pointer-events-none" />

            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-cyber-lime/15 border-2 border-cyber-lime/40 flex items-center justify-center mx-auto mb-6 relative">
              <i className="fa-solid fa-trophy text-3xl text-cyber-lime"></i>
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full border-2 border-cyber-lime/20"
              />
            </div>

            <p className="text-[10px] font-black text-cyber-lime uppercase tracking-[0.4em] mb-2">Level Complete</p>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-6">{topicTitle}</h2>

            {/* Rewards row */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
                className="flex flex-col items-center px-5 py-3 rounded-2xl bg-electric-violet/10 border border-electric-violet/30"
              >
                <i className="fa-solid fa-bolt text-electric-violet text-lg mb-1"></i>
                <span className="text-2xl font-black text-white">+{xpEarned}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">XP</span>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.45, type: 'spring', stiffness: 400 }}
                className="flex flex-col items-center px-5 py-3 rounded-2xl bg-hyper-gold/10 border border-hyper-gold/30"
              >
                <i className="fa-solid fa-coins text-hyper-gold text-lg mb-1"></i>
                <span className="text-2xl font-black text-white">+{tokensEarned}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">$PATH</span>
              </motion.div>
            </div>

            {nextTopicTitle && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                  <i className="fa-solid fa-lock-open text-cyber-lime mr-1"></i> Next Level Unlocked
                </p>
                <p className="text-sm font-bold text-white">{nextTopicTitle}</p>
              </motion.div>
            )}

            <button
              onClick={onDismiss}
              className="w-full py-4 rounded-2xl bg-cyber-lime text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-cyber-lime/20"
            >
              Keep Going  <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>

            <p className="text-[9px] text-slate-600 mt-3">Auto-continues in {countdown}s</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelCompletionCelebration;
