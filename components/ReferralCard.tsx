import React, { useState, useEffect } from 'react';
import { getReferralStats, ReferralStats } from '../services/referralService';

interface ReferralCardProps {
  referralCode: string | undefined;
  walletAddress: string | undefined;
}

const BASE_URL = 'https://clarixprotocol.com';

const ReferralCard: React.FC<ReferralCardProps> = ({ referralCode, walletAddress }) => {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const referralLink = referralCode ? `${BASE_URL}?ref=${referralCode}` : null;

  useEffect(() => {
    if (!referralCode) return;
    setLoadingStats(true);
    getReferralStats(referralCode)
      .then(setStats)
      .catch(() => setStats({ totalReferrals: 0, tokensEarned: 0 }))
      .finally(() => setLoadingStats(false));
  }, [referralCode]);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!walletAddress && !referralCode) {
    return (
      <div className="p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-3">
          <i className="fa-solid fa-share-nodes text-cyan-400 text-lg"></i>
          <h4 className="text-xs font-black text-white uppercase tracking-widest">Refer & Earn</h4>
        </div>
        <p className="text-xs text-slate-500">
          Connect your wallet to generate your unique referral link.
          Earn 15 $PATH for each friend who completes their first lesson.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 rounded-xl md:rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <i className="fa-solid fa-share-nodes text-cyan-400 text-lg"></i>
        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-widest">Refer &amp; Earn</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">15 $PATH per referral · 5 $PATH welcome bonus for your friend</p>
        </div>
      </div>

      {/* Referral code badge */}
      {referralCode && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Your Code</p>
            <p className="font-mono text-lg font-black text-cyan-400 tracking-widest">{referralCode}</p>
          </div>
        </div>
      )}

      {/* Referral link + copy */}
      {referralLink && (
        <div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Your Link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] font-mono text-[11px] text-slate-400 truncate">
              {referralLink}
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 flex-shrink-0 ${
                copied
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'
              }`}
            >
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-[10px]`}></i>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
          {loadingStats ? (
            <i className="fa-solid fa-circle-notch fa-spin text-slate-600 text-xs"></i>
          ) : (
            <>
              <p className="text-xl font-black text-white">{stats?.totalReferrals ?? 0}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Referrals</p>
            </>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
          {loadingStats ? (
            <i className="fa-solid fa-circle-notch fa-spin text-slate-600 text-xs"></i>
          ) : (
            <>
              <p className="text-xl font-black text-cyan-400">+{stats?.tokensEarned ?? 0}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">$PATH Earned</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralCard;
