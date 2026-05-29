
import React, { useState } from 'react';
import { Guild } from '../types';

interface OnboardingProps {
  onComplete: (username: string, guild: Guild) => void;
  onRemindLater: () => void;
}

const GUILDS = [
  {
    id: Guild.SENTINELS,
    name: 'Sentinels',
    icon: 'fa-shield-halved',
    color: '#ff0055',
    members: 1247,
    desc: 'Security-first. Defenders of the protocol.',
  },
  {
    id: Guild.ARCHITECTS,
    name: 'Architects',
    icon: 'fa-cube',
    color: '#8b5cf6',
    members: 984,
    desc: 'Builders & innovators. Shaping Web3.',
  },
  {
    id: Guild.LIQUIDATORS,
    name: 'Liquidators',
    icon: 'fa-water',
    color: '#ccff00',
    members: 1103,
    desc: 'DeFi natives. Masters of market flow.',
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onRemindLater }) => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [selectedGuild, setSelectedGuild] = useState<Guild>(Guild.NONE);

  return (
    <div className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-4 gap-4">
      <div className="max-w-lg w-full bg-[#0D1117] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">

        {/* Reward preview */}
        <div className="p-5 border-b border-white/[0.06] bg-gradient-to-r from-cyan-500/[0.08] to-indigo-500/[0.08]">
          <div className="flex items-center gap-4">
            {/* Blurred locked credential teaser */}
            <div className="relative w-14 h-14 shrink-0">
              <div
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/30 via-indigo-500/20 to-purple-500/30 border border-cyan-500/20 flex items-center justify-center"
                style={{ filter: 'blur(1.5px)' }}
              >
                <i className="fa-solid fa-certificate text-cyan-400 text-2xl"></i>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                <div className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center">
                  <i className="fa-solid fa-lock text-white text-[10px]"></i>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-cyan-400/70 uppercase tracking-widest mb-1">Setup Reward</p>
              <p className="text-sm text-white font-semibold leading-snug">
                Complete setup → earn{' '}
                <span className="text-cyan-400 font-bold">50 XP</span>
                {' '}+{' '}
                <span className="text-amber-400 font-bold">1 $PATH</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">+ unlock your Clarix Credential</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-5 pb-1">
          <div className="flex items-center gap-2">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-cyan-400' : 'bg-white/10'}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5">Step {step} of 2</p>
        </div>

        {/* Step 1 — Username */}
        {step === 1 && (
          <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold text-white mb-1">What should we call you?</h2>
            <p className="text-xs text-slate-500 mb-5">
              Your username appears on the leaderboard and in your credential.
            </p>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && username.trim()) setStep(2); }}
              placeholder="Enter a username…"
              maxLength={24}
              autoFocus
              className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3 text-white text-sm font-semibold placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 transition-all"
            />
            <div className="mt-6 flex flex-col items-end gap-3">
              <button
                disabled={!username.trim()}
                onClick={() => setStep(2)}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <i className="fa-solid fa-arrow-right text-[10px] ml-1"></i>
              </button>
              <button
                onClick={onRemindLater}
                className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
              >
                Remind me later
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Guild */}
        {step === 2 && (
          <div className="p-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-white mb-1">Choose your Guild</h2>
            <p className="text-xs text-slate-500 mb-5">
              Guilds unlock leaderboards, group challenges, and exclusive $PATH rewards.
            </p>

            <div className="flex flex-col gap-3">
              {GUILDS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGuild(g.id)}
                  className="flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200"
                  style={{
                    backgroundColor: selectedGuild === g.id ? `${g.color}10` : 'rgba(255,255,255,0.02)',
                    borderColor: selectedGuild === g.id ? g.color : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${g.color}20`, color: g.color }}
                  >
                    <i className={`fa-solid ${g.icon} text-lg`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{g.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{g.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-400">{g.members.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest">members</p>
                  </div>
                  {selectedGuild === g.id && (
                    <i className="fa-solid fa-circle-check shrink-0" style={{ color: g.color }}></i>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-arrow-left text-[10px] mr-1"></i> Back
              </button>
              <div className="flex flex-col items-end gap-3">
                <button
                  disabled={selectedGuild === Guild.NONE}
                  onClick={() => onComplete(username.trim(), selectedGuild)}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-bolt text-[10px] mr-1"></i> Complete Setup
                </button>
                <button
                  onClick={onRemindLater}
                  className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Remind me later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guest preview entry — below the card */}
      <button
        onClick={onRemindLater}
        className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
      >
        Not ready? Continue as guest →
      </button>
    </div>
  );
};

export default Onboarding;
