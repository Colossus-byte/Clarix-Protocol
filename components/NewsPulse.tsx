
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchIntelligencePulse } from '../services/geminiService';
import { Language } from '../types';

interface NewsPulseProps {
  topicTitle: string;
  language: Language;
}

const NewsPulse: React.FC<NewsPulseProps> = ({ topicTitle, language }) => {
  const [pulseData, setPulseData] = useState<{ text: string; sources: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPulse = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchIntelligencePulse(topicTitle, language);
        setPulseData(data);
      } catch {
        setError('Could not load market intelligence. Check your API key or try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    getPulse();
  }, [topicTitle, language]);

  if (isLoading) {
    return (
      <div className="mt-16 p-8 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse">
        <div className="h-4 w-48 bg-white/10 rounded mb-4"></div>
        <div className="h-20 w-full bg-white/5 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
        <i className="fa-solid fa-triangle-exclamation shrink-0"></i>
        {error}
      </div>
    );
  }

  if (!pulseData) return null;

  return (
    <div className="mt-8 md:mt-16 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-black/40 border-l-4 border-emerald-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-ping"></div>
        <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Live Intelligence Pulse</h3>
      </div>
      
      <div className="prose-note text-xs md:text-sm mb-6 md:mb-8 leading-relaxed text-slate-400 markdown-content">
        <ReactMarkdown>{pulseData.text}</ReactMarkdown>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3">
        {pulseData.sources.map((source, idx) => (
          <a 
            key={idx}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-bold text-slate-300 transition-all"
          >
            <i className="fa-solid fa-link text-[6px] md:text-[8px]"></i>
            {source.title.substring(0, 20)}...
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsPulse;
