
import React, { useState } from 'react';
import { UserProgress, Guild } from '../types';
import { DEFAULT_AVATARS, GUILD_DATA } from '../constants';
import ClarixPass from './ClarixPass';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface ProfileViewProps {
  progress: UserProgress;
  onUpdate: (updates: Partial<UserProgress>) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ progress, onUpdate }) => {
  const [username, setUsername] = useState(progress.username);
  const [bio, setBio] = useState(progress.bio);
  const [selectedAvatar, setSelectedAvatar] = useState(progress.avatarUrl);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate({ username, bio, avatarUrl: selectedAvatar });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const guild = GUILD_DATA[progress.guild];

  const handleExportData = () => {
    const dataToExport = {
      username: progress.username,
      walletAddress: progress.walletAddress,
      ipfsWatchlistCid: progress.ipfsWatchlistCid,
      ipfsPortfolioCid: progress.ipfsPortfolioCid,
      completedTopics: progress.completedTopics,
      metrics: progress.metrics,
      achievements: progress.achievements,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "clarix_protocol_data.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="page-transition max-w-5xl mx-auto py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Identity Card Area */}
        <div className="lg:col-span-5 space-y-6 md:space-y-8 flex flex-col items-center lg:items-start">
          <h3 className="terminal-text text-[8px] md:text-[10px] uppercase tracking-[0.4em] mb-2 md:mb-4">Neural Signature</h3>
          <ClarixPass progress={progress} />
          
          <div className="p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] bg-cyber-lime/5 border border-cyber-lime/20 w-full flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyber-lime/10 flex items-center justify-center shrink-0 mt-0.5">
              <i className="fa-solid fa-rocket text-cyber-lime text-sm"></i>
            </div>
            <div>
              <p className="text-[8px] md:text-[9px] font-black text-cyber-lime uppercase tracking-[0.3em] mb-1">Beta Access</p>
              <p className="text-[10px] md:text-xs text-slate-300 leading-relaxed">
                Clarix is completely free during beta. All features are unlocked. Paid plans will be introduced after beta based on community feedback.
              </p>
            </div>
          </div>
          
          <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white/[0.02] border border-white/5 w-full">
            <h4 className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 md:mb-6">Reputation Breakdown</h4>
            <div className="space-y-4 md:space-y-6">
              {[
                { label: 'Technical Proofs', val: progress.completedTopics.length * 20, color: 'indigo' },
                { label: 'Social Consensus', val: 15, color: 'emerald' },
                { label: 'Network Contribution', val: 5, color: 'amber' },
              ].map((m, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[7px] md:text-[8px] font-black uppercase">
                    <span className="text-slate-500">{m.label}</span>
                    <span className="text-white">{m.val}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-${m.color}-500`} style={{ width: `${m.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            Disconnect Identity
          </button>
        </div>

        {/* Profile Settings Area */}
        <div className="lg:col-span-7 cyber-panel rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 overflow-hidden relative h-fit">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-cyber-lime/5 blur-[80px] md:blur-[120px] pointer-events-none"></div>
          
          <div className="space-y-8 md:space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="w-full sm:w-auto">
                <h3 className="terminal-text text-[8px] md:text-[10px] uppercase tracking-[0.4em] mb-2 md:mb-3">Identity Record Configuration</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-2xl md:text-5xl font-black text-white bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-2 w-full focus:outline-none focus:border-cyber-lime/50 tracking-tighter uppercase italic"
                  />
                ) : (
                  <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none truncate">
                    {progress.username || 'Unverified Node'}
                  </h2>
                )}
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`w-full sm:w-auto px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all ${isEditing ? 'bg-cyber-lime text-black' : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'}`}
              >
                {isEditing ? 'SYNC UPDATES' : 'EDIT CORE'}
              </button>
            </div>

            {isEditing && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                <h4 className="terminal-text text-[8px] md:text-[10px] uppercase tracking-[0.2em] opacity-50">Visual Identity Proxy</h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 md:gap-3 p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/10">
                  {DEFAULT_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedAvatar(url)}
                      className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${selectedAvatar === url ? 'border-cyber-lime scale-110' : 'border-white/10'}`}
                    >
                      <img src={url} alt={`Option ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="terminal-text text-[8px] md:text-[10px] uppercase tracking-[0.2em] opacity-50">Protocol Objective / Bio</h4>
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full h-32 md:h-40 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 text-xs md:text-sm text-slate-300 font-medium focus:outline-none focus:border-cyber-lime/50 transition-all resize-none leading-relaxed"
                />
              ) : (
                <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white/[0.02] border border-white/5 text-xs md:text-sm text-slate-400 leading-relaxed font-medium italic">
                  {progress.bio || "Objective unknown. Node needs calibration."}
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 rounded-xl md:rounded-2xl border border-rose-500/20 bg-rose-500/5 flex items-center gap-4 md:gap-6">
              <i className="fa-solid fa-triangle-exclamation text-rose-500 text-lg md:text-xl"></i>
              <p className="text-[8px] md:text-[10px] text-rose-200 font-black uppercase tracking-widest leading-relaxed">
                Changes to the Identity Core require 128-bit neural signing. Ensure all credentials are accurate before syncing.
              </p>
            </div>

            {progress.did && (
              <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-surface border border-white/10 relative overflow-hidden mt-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-electric-violet/10 blur-[40px] rounded-full pointer-events-none"></div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-electric-violet/20 flex items-center justify-center border border-electric-violet/30">
                    <i className="fa-solid fa-fingerprint text-electric-violet text-lg"></i>
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-black text-white uppercase tracking-widest">Your Clarix Identity</h4>
                    <p className="text-xs text-white font-mono break-all mt-1">
                      {progress.did}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">
                  Your identity is verified on-chain. No personal data is stored by Clarix.
                </p>
              </div>
            )}

            {/* Decentralized Storage Section */}
            <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-surface border border-white/10 relative overflow-hidden mt-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <i className="fa-solid fa-cube text-blue-500 text-lg"></i>
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-black text-white uppercase tracking-widest">Your Data</h4>
                  <p className="text-[8px] md:text-[10px] text-slate-400 font-medium mt-1">
                    Your data is stored on a decentralized network. It belongs to you, not us.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Watchlist CID</p>
                    <p className="text-xs text-white font-mono break-all">
                      {progress.ipfsWatchlistCid || 'No watchlist data stored yet'}
                    </p>
                  </div>
                  {progress.ipfsWatchlistCid && (
                    <a 
                      href={`https://ipfs.io/ipfs/${progress.ipfsWatchlistCid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
                    >
                      <i className="fa-solid fa-external-link-alt"></i> View
                    </a>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Portfolio CID</p>
                    <p className="text-xs text-white font-mono break-all">
                      {progress.ipfsPortfolioCid || 'No portfolio data stored yet'}
                    </p>
                  </div>
                  {progress.ipfsPortfolioCid && (
                    <a 
                      href={`https://ipfs.io/ipfs/${progress.ipfsPortfolioCid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
                    >
                      <i className="fa-solid fa-external-link-alt"></i> View
                    </a>
                  )}
                </div>

                <button 
                  onClick={handleExportData}
                  className="w-full py-3 mt-4 bg-blue-500/20 hover:bg-blue-500/40 text-blue-500 border border-blue-500/30 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-download"></i> Export All Data
                </button>
              </div>
            </div>

            {progress.walletAddress && (
              <div className="p-4 md:p-6 rounded-xl md:rounded-2xl border border-rose-500/20 bg-rose-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6 mt-8">
                <div className="flex items-center gap-4">
                  <i className="fa-solid fa-wallet text-rose-500 text-lg md:text-xl"></i>
                  <div>
                    <h4 className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest mb-1">Connected Wallet</h4>
                    <p className="text-[8px] md:text-[10px] text-rose-200 font-mono tracking-widest">
                      {progress.walletAddress}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdate({ walletAddress: undefined })}
                  className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-500 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
