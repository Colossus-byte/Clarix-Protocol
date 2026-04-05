import React, { useState, useMemo } from 'react';
import { TOPICS, DID_YOU_KNOW_FACTS, UI_TRANSLATIONS, LANGUAGES } from './constants';
import { Difficulty, UserProgress, Language } from './types';
import CollectiblesVault from './components/CollectiblesVault';

interface SidebarProps {
  progress: UserProgress;
  onSelectTopic: (id: string) => void;
  onSelectView: (view: string) => void;
  onLanguageChange: (lang: Language) => void;
  activeTopicId: string;
  activeView: string;
}

const NAV_ITEMS = [
  { id: 'academy',       icon: 'fa-graduation-cap', label: 'Academy' },
  { id: 'market',        icon: 'fa-chart-line',      label: 'Market Intel' },
  { id: 'portfolio',     icon: 'fa-wallet',          label: 'Portfolio' },
  { id: 'guilds',        icon: 'fa-users',           label: 'Guilds' },
  { id: 'governance',    icon: 'fa-landmark',        label: 'Governance' },
  { id: 'certification', icon: 'fa-certificate',     label: 'Credentials' },
  { id: 'institutional', icon: 'fa-briefcase',       label: 'Institutional' },
  { id: 'peers',         icon: 'fa-network-wired',   label: 'Peer Network' },
  { id: 'profile',       icon: 'fa-user',            label: 'Profile' },
];

const Sidebar: React.FC<SidebarProps> = ({ progress, onSelectTopic, onSelectView, onLanguageChange, activeTopicId, activeView }) => {
  const [showVault, setShowVault] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const difficulties = Object.values(Difficulty);

  const t = UI_TRANSLATIONS[progress.language] || UI_TRANSLATIONS[Language.EN];

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return TOPICS;
    const query = searchQuery.toLowerCase();
    return TOPICS.filter(topic =>
      topic.title.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query) ||
      topic.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const currentLang = LANGUAGES.find(l => l.code === progress.language) || LANGUAGES[0];

  return (
    <div className="w-64 h-full flex flex-col bg-[#0A0A0F] border-r border-white/[0.04] z-20 overflow-hidden">

      {/* Logo */}
      <div className="px-5 pt-6 pb-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-cube text-white text-sm"></i>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">Clarix</h1>
            <p className="text-[10px] text-slate-600 mt-0.5">Protocol</p>
          </div>
        </div>

        {/* Language picker */}
        <div className="relative">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.07] transition-colors"
          >
            <span className="text-xs leading-none">{currentLang.flag}</span>
          </button>
          {isLangMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-28 bg-[#111118] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { onLanguageChange(lang.code); setIsLangMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
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
      </div>

      {/* Primary Navigation */}
      <nav className="px-3 pb-3 shrink-0">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group ${
                  isActive
                    ? 'text-indigo-300 bg-indigo-500/10'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
                )}
                <i className={`fa-solid ${item.icon} w-4 text-center text-sm ${isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'} transition-colors`}></i>
                <span className="tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/[0.04] mb-3 shrink-0" />

      {/* Topic search — only shown in academy */}
      {activeView === 'academy' && (
        <div className="px-3 mb-3 shrink-0">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search modules..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg py-2 pl-8 pr-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/30 focus:bg-white/[0.05] transition-all"
            />
          </div>
        </div>
      )}

      {/* Topic list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-5 no-scrollbar">
        {activeView === 'academy' && difficulties.map(diff => {
          const filteredDiffTopics = filteredTopics.filter(t => t.difficulty === diff);
          if (filteredDiffTopics.length === 0) return null;
          return (
            <div key={diff}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2 px-2">
                {diff}
              </p>
              <div className="space-y-0.5">
                {filteredDiffTopics.map(topic => {
                  const isActiveTopic = activeTopicId === topic.id;
                  const isCompleted = progress.completedTopics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => onSelectTopic(topic.id)}
                      className={`w-full group flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 relative ${
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
                      <span className="text-[13px] font-medium truncate leading-tight">{topic.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {activeView !== 'academy' && (
          <div className="py-8 text-center">
            <i className="fa-solid fa-compass-drafting text-2xl text-slate-800 mb-3 block"></i>
            <p className="text-xs text-slate-700">Switch to Academy to browse modules</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.04] shrink-0">
        <button
          onClick={() => setShowVault(true)}
          className="w-full py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-indigo-400 hover:border-indigo-500/20 hover:bg-indigo-500/[0.04] transition-all flex items-center justify-center gap-2 text-xs font-medium"
        >
          <i className="fa-solid fa-vault text-[11px]"></i>
          Collectibles
          <span className="ml-1 text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded-full">{progress.achievements.length}</span>
        </button>
      </div>

      {showVault && (
        <CollectiblesVault
          unlockedIds={progress.achievements}
          onClose={() => setShowVault(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
