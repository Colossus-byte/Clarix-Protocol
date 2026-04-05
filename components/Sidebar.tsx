import React, { useState, useMemo } from 'react';
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

const NAV_ITEMS = [
  { id: 'academy',       icon: 'fa-graduation-cap', label: 'Academy' },
  { id: 'market',        icon: 'fa-chart-line',      label: 'Market Intel' },
  { id: 'portfolio',     icon: 'fa-wallet',          label: 'Portfolio' },
  { id: 'peers',         icon: 'fa-network-wired',   label: 'Peer Network' },
  { id: 'guilds',        icon: 'fa-users',           label: 'Guilds' },
  { id: 'governance',    icon: 'fa-landmark',        label: 'Governance' },
  { id: 'certification', icon: 'fa-certificate',     label: 'Credentials' },
  { id: 'institutional', icon: 'fa-briefcase',       label: 'Institutional' },
  { id: 'profile',       icon: 'fa-user',            label: 'Profile' },
];

const Sidebar: React.FC<SidebarProps> = ({
  progress, onSelectTopic, onSelectView, onLanguageChange, activeTopicId, activeView, onClose
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const t = UI_TRANSLATIONS[progress.language] || UI_TRANSLATIONS[Language.EN];
  const currentLang = LANGUAGES.find(l => l.code === progress.language) || LANGUAGES[0];

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return TOPICS;
    const query = searchQuery.toLowerCase();
    return TOPICS.filter(topic =>
      topic.title.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query) ||
      topic.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="w-60 md:w-64 h-full flex flex-col bg-[#0A0A0F] border-r border-white/[0.04] z-[60] overflow-hidden">

      {/* Logo + Language + Close */}
      <div className="px-4 pt-5 pb-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <i className="fa-solid fa-cube text-white text-xs"></i>
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight leading-none">Clarix</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Protocol</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.07] transition-colors text-xs"
            >
              {currentLang.flag}
            </button>
            {isLangOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-28 bg-[#111118] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { onLanguageChange(lang.code); setIsLangOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                      progress.language === lang.code
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Mobile close */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="px-2.5 pb-2 shrink-0">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative group ${
                  isActive
                    ? 'text-indigo-300 bg-indigo-500/10'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
                )}
                <i className={`fa-solid ${item.icon} w-4 text-center text-sm flex-shrink-0 transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'
                }`}></i>
                <span className="tracking-tight truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-white/[0.04] my-2 shrink-0" />

      {/* Topic tree — academy only */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-4 no-scrollbar">
        {activeView === 'academy' ? (
          <div>
            {/* Search */}
            <div className="mb-3">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search modules..."
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg py-2 pl-8 pr-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/30 transition-all"
                />
              </div>
            </div>

            {/* Topics grouped by difficulty */}
            {Object.values(Difficulty).map(diff => {
              const topics = filteredTopics.filter(t => t.difficulty === diff);
              if (topics.length === 0) return null;
              return (
                <div key={diff} className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-700 mb-1.5 px-1">
                    {diff}
                  </p>
                  <div className="space-y-0.5">
                    {topics.map(topic => {
                      const isActiveTopic = activeTopicId === topic.id;
                      const isCompleted = progress.completedTopics.includes(topic.id);
                      return (
                        <button
                          key={topic.id}
                          onClick={() => onSelectTopic(topic.id)}
                          className={`w-full group flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-150 relative ${
                            isActiveTopic
                              ? 'bg-white/[0.05] text-white'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                          }`}
                        >
                          {isActiveTopic && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-400 rounded-r-full" />
                          )}
                          <div className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : isActiveTopic
                                ? 'bg-indigo-500/15 text-indigo-400'
                                : 'bg-white/[0.04] text-slate-700'
                          }`}>
                            {isCompleted
                              ? <i className="fa-solid fa-check text-[8px]"></i>
                              : <i className="fa-solid fa-circle text-[4px]"></i>
                            }
                          </div>
                          <span className="text-[12px] font-medium truncate leading-tight">{topic.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredTopics.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-xs text-slate-700">No modules found</p>
              </div>
            )}
          </div>
        ) : (
          <NeuralFeed isPrivate={progress.isPrivate} />
        )}
      </div>

      {/* User footer */}
      <div
        onClick={() => onSelectView('profile')}
        className="px-3 py-3 border-t border-white/[0.04] flex items-center gap-2.5 cursor-pointer hover:bg-white/[0.02] transition-colors shrink-0"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/10 flex-shrink-0">
          <img src={progress.avatarUrl} alt="Me" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{progress.username}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            <span className="text-[10px] text-slate-600">{progress.tokenBalance.toLocaleString()} $PATH</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
