
import React, { useState, useEffect, useRef } from 'react';
import { Peer, UserProgress, P2PMessage, P2PTransaction, Guild } from '../types';
import { PEERS, GUILD_DATA } from '../constants';

interface PeerNexusProps {
  progress: UserProgress;
  onSendMessage: (receiverId: string, text: string) => void;
  onSendTokens: (receiverId: string, amount: number) => void;
}

const PeerNexus: React.FC<PeerNexusProps> = ({ progress, onSendMessage, onSendTokens }) => {
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [showPeerList, setShowPeerList] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedPeer = PEERS.find(p => p.id === selectedPeerId);
  const activeChat = progress.p2pMessages.filter(
    m => (m.senderId === 'me' && m.receiverId === selectedPeerId) || 
         (m.senderId === selectedPeerId && m.receiverId === 'me')
  ).sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    if (selectedPeerId) {
      setShowPeerList(false);
    }
  }, [selectedPeerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [activeChat]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedPeerId) return;
    onSendMessage(selectedPeerId, chatInput);
    setChatInput('');
  };

  const handleTransfer = () => {
    if (!selectedPeerId || transferAmount <= 0 || transferAmount > progress.tokenBalance) return;
    setIsTransferring(true);
    setTimeout(() => {
      onSendTokens(selectedPeerId, transferAmount);
      setIsTransferring(false);
      setTransferAmount(0);
    }, 1500);
  };

  return (
    <div className="mt-4 md:mt-8 page-transition grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 h-[calc(100vh-200px)] md:h-[calc(100vh-280px)]">
      {/* Peer Discovery List */}
      <div className={`lg:col-span-4 cyber-panel rounded-[2rem] md:rounded-[2.5rem] flex flex-col overflow-hidden border-white/5 ${!showPeerList && 'hidden lg:flex'}`}>
        <div className="p-6 md:p-8 border-b border-white/5">
          <h3 className="terminal-text text-[8px] md:text-[10px] uppercase tracking-[0.4em] mb-2">Node Discovery</h3>
          <p className="text-white font-bold tracking-tighter uppercase text-xs md:text-sm">Active Connections</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 no-scrollbar">
          {PEERS.map(peer => {
            const guild = GUILD_DATA[peer.guild];
            return (
              <button
                key={peer.id}
                onClick={() => setSelectedPeerId(peer.id)}
                className={`w-full p-4 md:p-6 rounded-xl md:rounded-2xl border transition-all duration-500 flex items-center justify-between group ${
                  selectedPeerId === peer.id ? 'bg-cyber-lime/10 border-cyber-lime scale-[1.02]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-white bg-${guild.color}-500/20 text-${guild.color}-500 border border-${guild.color}-500/30`}>
                    <i className={`fa-solid ${guild.icon} text-[10px] md:text-xs`}></i>
                  </div>
                  <div className="text-left">
                    <p className="text-xs md:text-sm font-bold text-white tracking-tight uppercase leading-none mb-1">{peer.address}</p>
                    <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest ${peer.status === 'online' ? 'text-cyber-lime' : 'text-slate-500'}`}>
                      {peer.status} • {peer.latency}ms
                    </span>
                  </div>
                </div>
                <i className={`fa-solid fa-signal text-[8px] md:text-[10px] ${peer.status === 'online' ? 'text-cyber-lime' : 'text-slate-800'}`}></i>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messaging & Transfer Area */}
      <div className={`lg:col-span-8 flex flex-col gap-4 md:gap-8 ${showPeerList && 'hidden lg:flex'}`}>
        {!selectedPeerId ? (
          <div className="flex-1 cyber-panel rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 md:p-12 opacity-50">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 md:mb-8 border border-white/10 animate-pulse">
              <i className="fa-solid fa-satellite-dish text-2xl md:text-3xl text-slate-700"></i>
            </div>
            <p className="terminal-text text-[8px] md:text-[10px] uppercase tracking-widest mb-2">Awaiting Handshake</p>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Select a remote node to initialize secure signal link.</p>
          </div>
        ) : (
          <>
            {/* Secure Signal Chat */}
            <div className="flex-1 cyber-panel rounded-[2rem] md:rounded-[2.5rem] flex flex-col overflow-hidden relative">
              <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-3 md:gap-4">
                  <button 
                    onClick={() => setShowPeerList(true)}
                    className="lg:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white"
                  >
                    <i className="fa-solid fa-arrow-left text-xs"></i>
                  </button>
                  <div className="w-2 h-2 rounded-full bg-cyber-lime animate-pulse"></div>
                  <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[150px] md:max-w-none">
                    Signal Encrypted: {selectedPeer?.address}
                  </span>
                </div>
                <div className="hidden sm:block text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">Protocol: V10-P2P</div>
              </div>
              
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 no-scrollbar">
                {activeChat.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 italic">
                    <p className="text-[10px] md:text-xs text-slate-500">Secure session established. Metadata cleared.</p>
                  </div>
                ) : (
                  activeChat.map(msg => (
                    <div key={msg.id} className={`flex gap-3 md:gap-4 ${msg.senderId === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 overflow-hidden flex-shrink-0">
                         <img 
                           src={msg.senderId === 'me' ? progress.avatarUrl : `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${msg.senderId}`} 
                           alt="Peer" 
                           className="w-full h-full object-cover" 
                         />
                      </div>
                      <div className={`max-w-[85%] md:max-w-[80%] p-4 md:p-5 rounded-2xl md:rounded-3xl text-xs md:text-sm leading-relaxed ${
                        msg.senderId === 'me' ? 'bg-electric-violet text-white rounded-tr-none' : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5'
                      }`}>
                        {msg.text}
                        <div className="text-[7px] md:text-[8px] mt-2 opacity-50 font-black uppercase tracking-widest">
                          {new Date(msg.timestamp).toLocaleTimeString()} • {msg.senderId === 'me' ? progress.username : 'Remote Node'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendChat} className="p-4 md:p-6 border-t border-white/5 bg-black/20">
                <div className="relative group">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Broadcast signal..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-4 md:pl-6 pr-12 md:pr-16 focus:outline-none focus:border-cyber-lime/30 transition-all text-xs md:text-sm terminal-text"
                  />
                  <button type="submit" className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-cyber-lime text-white flex items-center justify-center shadow-lg shadow-cyber-lime/10">
                    <i className="fa-solid fa-paper-plane text-[10px] md:text-xs"></i>
                  </button>
                </div>
              </form>
            </div>

            {/* Token Transfer Widget */}
            <div className="cyber-panel rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border-cyber-lime/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                <div className="flex items-center gap-4 md:gap-6 self-start md:self-auto">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-cyber-lime/10 border border-cyber-lime/20 flex items-center justify-center text-cyber-lime text-lg md:text-xl">
                    <i className="fa-solid fa-money-bill-transfer"></i>
                  </div>
                  <div>
                    <h4 className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Peer Transfer Protocol</h4>
                    <p className="text-white font-bold tracking-tight text-sm md:text-base italic uppercase">Direct $PATH Bridge</p>
                  </div>
                </div>

                <div className="w-full md:flex-1 md:max-w-xs relative">
                  <input 
                    type="number" 
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-lg md:text-xl font-bold text-white focus:outline-none focus:border-cyber-lime/40 transition-all"
                  />
                  <span className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-[8px] md:text-[10px] font-black text-cyber-lime uppercase tracking-widest">$PATH</span>
                </div>

                <button 
                  onClick={handleTransfer}
                  disabled={isTransferring || transferAmount <= 0 || transferAmount > progress.tokenBalance}
                  className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-black font-black uppercase tracking-widest text-[8px] md:text-[10px] rounded-xl md:rounded-2xl hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-20"
                >
                  {isTransferring ? <><i className="fa-solid fa-spinner animate-spin mr-2"></i> Initializing...</> : 'Initialize Bridge'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PeerNexus;
