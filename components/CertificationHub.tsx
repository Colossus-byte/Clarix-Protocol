import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from '../contexts/FirebaseContext';
import { UserProgress } from '../types';
import { CREDENTIAL_DEFS, CredentialDef } from '../constants';

interface CertificationHubProps {
  progress: UserProgress;
}

interface StoredCredential {
  id: string;
  earnedAt: number;
  verificationHash: string;
  walletAddress?: string;
  username?: string;
}

// Returns 0-100 progress toward earning a locked credential
function getLockProgress(def: CredentialDef, progress: UserProgress): { value: number; label: string } {
  if (def.levelTopicId) {
    // For level credentials show lessons completed in that topic
    const topic = def.levelTopicId;
    // The prerequisite is that all previous level credentials are earned
    // Progress = whether prerequisites are done
    const levelOrder = ['b1', 'f1', 'm1', 'p1'];
    const idx = levelOrder.indexOf(topic);
    if (idx === 0) return { value: 0, label: 'Start Level 1 to unlock' };
    const prereq = levelOrder[idx - 1];
    if (progress.completedTopics.includes(prereq)) {
      return { value: 50, label: 'Level prerequisite met — complete this level' };
    }
    return { value: 0, label: `Complete Level ${idx} first` };
  }
  if (def.id === 'streak-7') {
    const pct = Math.min(100, Math.round(((progress.streak || 0) / 7) * 100));
    return { value: pct, label: `${progress.streak || 0} / 7 days` };
  }
  if (def.id === 'streak-30') {
    const pct = Math.min(100, Math.round(((progress.streak || 0) / 30) * 100));
    return { value: pct, label: `${progress.streak || 0} / 30 days` };
  }
  if (def.id === 'portfolio-analyst') {
    return { value: 0, label: 'Run a portfolio analysis' };
  }
  if (def.id === 'governance-pioneer') {
    return { value: progress.votedProposalIds.length > 0 ? 100 : 0, label: 'Cast a governance vote' };
  }
  return { value: 0, label: 'Complete the requirement' };
}

interface CredentialCardProps {
  def: CredentialDef;
  earned: StoredCredential | null;
  progress: UserProgress;
  onShare: (def: CredentialDef, cred: StoredCredential) => void;
}

const CredentialCard: React.FC<CredentialCardProps> = ({ def, earned, progress, onShare }) => {
  const [expanded, setExpanded] = useState(false);
  const lockProgress = earned ? null : getLockProgress(def, progress);
  const dateStr = earned
    ? new Date(earned.earnedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const verifyUrl = earned?.walletAddress
    ? `${window.location.origin}/verify/${earned.walletAddress.toLowerCase()}/${def.slug}`
    : null;

  if (earned) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border cursor-pointer group"
        style={{ borderColor: `rgba(255,255,255,0.08)`, boxShadow: earned ? def.glowClass : 'none' }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Gradient header */}
        <div className={`bg-gradient-to-br ${def.bgClass} p-5 relative overflow-hidden`}>
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
          />
          {/* Corner brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/30" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/30" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/30" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/30" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-lg shrink-0">
              <i className={`fa-solid ${def.icon} text-white text-xl`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-[8px] font-black uppercase tracking-[0.3em]">{def.subtitle}</p>
              <h3 className="text-white font-black text-base tracking-tight leading-tight">{def.name}</h3>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 border border-white/30 shrink-0">
              <i className="fa-solid fa-check text-white text-[8px]"></i>
              <span className="text-white text-[8px] font-black uppercase tracking-widest">Earned</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="bg-surface/80 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold">
              {dateStr && (
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-calendar-check text-slate-600"></i>
                  {dateStr}
                </span>
              )}
              {earned.walletAddress && (
                <span className="font-mono">
                  {earned.walletAddress.slice(0, 6)}...{earned.walletAddress.slice(-4)}
                </span>
              )}
            </div>
            <i className={`fa-solid fa-chevron-${expanded ? 'up' : 'down'} text-slate-600 text-xs`}></i>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3 border-t border-white/5 mt-3">
                  <p className="text-slate-400 text-xs leading-relaxed">{def.description}</p>

                  {/* Verification hash */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <i className="fa-solid fa-shield-check text-emerald-400 text-xs"></i>
                    <span className="font-mono text-[9px] text-emerald-600">
                      {earned.verificationHash.slice(0, 28)}...
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {verifyUrl && (
                      <a
                        href={verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[9px] font-bold uppercase tracking-widest transition-all"
                      >
                        <i className="fa-solid fa-external-link text-[8px]"></i>
                        Verify
                      </a>
                    )}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I earned the "${def.name}" credential on @ClarixProtocol! 🎓\n${verifyUrl || 'clarixprotocol.com'}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black border border-white/10 hover:bg-white/5 text-white text-[9px] font-bold uppercase tracking-widest transition-all"
                    >
                      <i className="fa-brands fa-x-twitter text-[8px]"></i>
                      Tweet
                    </a>
                    {verifyUrl && (
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a66c2]/20 border border-[#0a66c2]/30 hover:bg-[#0a66c2]/30 text-[#60a5fa] text-[9px] font-bold uppercase tracking-widest transition-all"
                      >
                        <i className="fa-brands fa-linkedin text-[8px]"></i>
                        LinkedIn
                      </a>
                    )}
                    {verifyUrl && (
                      <button
                        onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(verifyUrl); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 text-[9px] font-bold uppercase tracking-widest transition-all"
                      >
                        <i className="fa-solid fa-copy text-[8px]"></i>
                        Copy Link
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // Locked card
  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 opacity-70">
      <div className="bg-white/[0.02] p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <i className={`fa-solid ${def.icon} text-slate-600 text-xl`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.3em]">{def.subtitle}</p>
          <h3 className="text-slate-400 font-black text-base tracking-tight">{def.name}</h3>
        </div>
        <i className="fa-solid fa-lock text-slate-700 text-sm shrink-0"></i>
      </div>
      <div className="bg-surface/50 px-5 py-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{lockProgress!.label}</span>
          <span className="text-[9px] text-slate-600 font-bold">{lockProgress!.value}%</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${lockProgress!.value}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${def.bgClass}`}
          />
        </div>
        <p className="text-[9px] text-slate-600 font-medium">{def.requirementText}</p>
      </div>
    </div>
  );
};

const CertificationHub: React.FC<CertificationHubProps> = ({ progress }) => {
  const { user } = useFirebase();
  const [storedCreds, setStoredCreds] = useState<Record<string, StoredCredential>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchCreds = async () => {
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'credentials'));
        const map: Record<string, StoredCredential> = {};
        snap.forEach(d => {
          map[d.id] = d.data() as StoredCredential;
        });
        setStoredCreds(map);
      } catch {
        // fall through — use earnedCredentialIds from progress as fallback
      } finally {
        setLoading(false);
      }
    };
    fetchCreds();
  }, [user, progress.earnedCredentialIds]);

  // Merge Firestore data with local progress (Firestore wins for timestamp/hash, local for earned check)
  const earnedIds = new Set([
    ...Object.keys(storedCreds),
    ...(progress.earnedCredentialIds || []),
  ]);

  const levelCreds = CREDENTIAL_DEFS.filter(c => c.tier === 'level');
  const bonusCreds = CREDENTIAL_DEFS.filter(c => c.tier === 'bonus');
  const totalEarned = earnedIds.size;
  const totalCreds = CREDENTIAL_DEFS.length;

  const getEarned = (def: CredentialDef): StoredCredential | null => {
    if (!earnedIds.has(def.id)) return null;
    return storedCreds[def.id] ?? {
      id: def.id,
      earnedAt: Date.now(),
      verificationHash: '—',
      walletAddress: progress.walletAddress,
      username: progress.username,
    };
  };

  return (
    <div className="pb-16 page-transition">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] mb-1">
            Proof of Knowledge Registry
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-3">
            Clarix <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-hyper-gold">Credentials</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            Verifiable on-chain credentials tied to your wallet address. Share them on LinkedIn and Twitter to prove your knowledge.
          </p>
        </div>

        {/* Progress ring */}
        <div className="flex items-center gap-4 shrink-0 self-start md:self-auto">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="url(#credGrad)" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - totalEarned / totalCreds)}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="credGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white font-black text-xl leading-none">{totalEarned}</span>
              <span className="text-slate-500 text-[8px] font-bold">/{totalCreds}</span>
            </div>
          </div>
          <div>
            <p className="text-white font-black text-base tracking-tight">
              {totalEarned === 0 ? 'No credentials yet' : totalEarned === totalCreds ? 'All credentials earned!' : `${totalEarned} earned`}
            </p>
            <p className="text-slate-500 text-xs font-medium mt-0.5">{totalCreds - totalEarned} remaining</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-8">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm">Loading credentials...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Level credentials */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <i className="fa-solid fa-graduation-cap text-amber-400 text-[10px]"></i>
              </div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Level Certificates</h2>
              <span className="text-[9px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {levelCreds.filter(c => earnedIds.has(c.id)).length}/{levelCreds.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {levelCreds.map(def => (
                <CredentialCard
                  key={def.id}
                  def={def}
                  earned={getEarned(def)}
                  progress={progress}
                  onShare={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Bonus credentials */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-6 rounded-lg bg-electric-violet/20 border border-electric-violet/30 flex items-center justify-center">
                <i className="fa-solid fa-star text-electric-violet text-[10px]"></i>
              </div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Bonus Awards</h2>
              <span className="text-[9px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {bonusCreds.filter(c => earnedIds.has(c.id)).length}/{bonusCreds.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bonusCreds.map(def => (
                <CredentialCard
                  key={def.id}
                  def={def}
                  earned={getEarned(def)}
                  progress={progress}
                  onShare={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Info footer */}
          <div className="mt-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-start md:items-center gap-4">
            <i className="fa-solid fa-building-columns text-amber-500/40 text-2xl shrink-0"></i>
            <p className="text-xs text-slate-400 leading-relaxed">
              Institutional Value: These credentials are stored on Firestore with a cryptographic verification hash linked to your wallet address. Share the verification link so employers and protocols can confirm your knowledge independently.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default CertificationHub;
