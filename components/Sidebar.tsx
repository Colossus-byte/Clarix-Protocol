
import React, { useState } from 'react';
import { TOPICS, UI_TRANSLATIONS, LANGUAGES } from '../constants';
import { Difficulty, UserProgress, Language } from '../types';
import NeuralFeed from './NeuralFeed';

interface SidebarProps {
  progress: UserProgress;
  onSelectTopic: (id: string) => void;
  onSelectView: (view: string) => void;
  onLanguageChange: (lang: Language) => void;
  activeTopicId: string;
  activeView: string;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ progress, onSelectTopic, onSelectView, onLanguageChange, activeTopicId, activeView, onClose }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const t = UI_TRANSLATIONS[progress.language] || UI_TRANSLATIONS[Language.EN];
  const currentLang = LANGUAGES.find(l => l.code === progress.language) || LANGUAGES[0];

  const filteredTopics = TOPICS.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-72 md:w-80 h-full flex flex-col bg-surface border-r border-white/5 z-[60]">
      <div className="p-6 md:p-10 shrink-0">
        <div className="flex items-center justify-between mb-8 md:mb-16">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <i className="fa-solid fa-atom text-lg md:text-xl"></i>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter text-white uppercase italic leading-none">Clarix</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setIsLangOpen(!isLangOpen)} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs md:text-sm hover:bg-white/10 transition-all">
                {currentLang.flag}
              </button>
              {isLangOpen && (
                <div className="absolute top-full right-0 mt-4 w-40 cyber-panel rounded-2xl p-2 z-[70] animate-in fade-in slide-in-from-top-2">
                  {LANGUAGES.map(l => (
                    <button 
                      key={l.code}
                      onClick={() => { onLanguageChange(l.code); setIsLangOpen(false); }}
                      className="w-full text-left p-3 rounded-xl hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white"
                    >
                      {l.flag} {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {onClose && (
              <button onClick={onClose} className="md:hidden w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        <nav className="space-y-2 md:space-y-3 mb-8 md:mb-12">
          {[
            { id: 'academy', label: t.academy, icon: 'fa-graduation-cap' },
            { id: 'portfolio', label: 'Portfolio', icon: 'fa-wallet' },
            { id: 'market', label: 'Market Intel', icon: 'fa-chart-line' },
            { id: 'peers', label: t.peers, icon: 'fa-satellite-dish' },
            { id: 'guilds', label: t.guilds, icon: 'fa-users' },
            { id: 'governance', label: t.governance, icon: 'fa-landmark' },
            { id: 'certification', label: t.certification, icon: 'fa-certificate' },
            { id: 'profile', label: t.profile, icon: 'fa-user-astronaut' }
          ].map(view => (
            <button 
              key={view.id}
              onClick={() => onSelectView(view.id)}
              className={`w-full group flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 border ${
                activeView === view.id ? 'bg-cyber-lime text-black border-cyber-lime shadow-[0_0_20px_rgba(204,255,0,0.2)]' : 'text-slate-500 border-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${view.icon} text-xs md:text-sm`}></i>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">{view.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-20 no-scrollbar">
        {activeView === 'academy' ? (
          <div className="py-4 md:py-6">
            <div className="px-4 mb-6">
              <div className="relative group">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyber-lime transition-colors text-[10px]"></i>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Atlas..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-[10px] font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-cyber-lime/30 transition-all"
                />
              </div>
            </div>

            <p className="text-[8px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 md:mb-4 px-4">Knowledge Tree</p>
            <div className="space-y-1">
              {filteredTopics.map(topic => {
                const isMatch = searchQuery && (
                  topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  topic.category.toLowerCase().includes(searchQuery.toLowerCase())
                );

                return (
                  <button 
                    key={topic.id}
                    onClick={() => onSelectTopic(topic.id)}
                    className={`w-full group relative flex items-center gap-4 md:gap-5 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all border ${
                      activeTopicId === topic.id 
                        ? 'bg-white/5 text-white border-white/5' 
                        : isMatch 
                          ? 'bg-indigo-500/5 text-slate-300 border-indigo-500/20' 
                          : 'text-slate-600 hover:text-slate-300 border-transparent'
                    }`}
                  >
                    {activeTopicId === topic.id && <div className="absolute left-0 w-1 h-6 bg-cyber-lime rounded-r-full shadow-[0_0_10px_#ccff00]"></div>}
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[8px] md:text-[10px] transition-all ${
                      progress.completedTopics.includes(topic.id) ? 'bg-cyber-lime/10 text-cyber-lime' : 'bg-white/5'
                    }`}>
                      {progress.completedTopics.includes(topic.id) ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-circle text-[4px]"></i>}
                    </div>
                    <span className="text-[10px] md:text-xs font-bold truncate tracking-tight">{topic.title}</span>
                  </button>
                );
              })}
              {filteredTopics.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No nodes found</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <NeuralFeed isPrivate={progress.isPrivate} />
        )}
      </div>

      <div onClick={() => onSelectView('profile')} className="p-6 md:p-10 border-t border-white/5 flex items-center gap-3 md:gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors">
         <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-cyber-lime/30 overflow-hidden">
            <img src={progress.avatarUrl} alt="Me" className="w-full h-full object-cover" />
         </div>
         <div className="flex-1 min-w-0">
            <p className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-tight truncate">{progress.username}</p>
            <div className="flex items-center gap-2">
               <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-cyber-lime shadow-[0_0_5px_#ccff00]"></div>
               <span className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-widest">{progress.tokenBalance} $PATH</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
