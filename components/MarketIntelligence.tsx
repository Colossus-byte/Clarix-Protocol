
import React, { useState, useEffect } from 'react';
import { fetchIntelligencePulse } from '../services/geminiService';
import { Language } from '../types';

interface MarketIntelligenceProps {
  language: Language;
}

const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({ language }) => {
  const [intel, setIntel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMarketIntel = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchIntelligencePulse("Bitcoin and Ethereum institutional sentiment and technical updates", language);
        setIntel(data);
      } catch {
        setError('Market data unavailable');
      } finally {
        setLoading(false);
      }
    };
    loadMarketIntel();
  }, [language]);

  return (
    <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-surface border border-white/[0.03] overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-emerald-500/[0.03] blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <i className="fa-solid fa-satellite-dish text-[10px] text-emerald-500"></i>
          </div>
          <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Market Grounding</h4>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[7px] md:text-[8px] font-bold text-emerald-500/70 uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 md:space-y-4">
          <div className="h-1.5 md:h-2 w-full bg-white/5 rounded animate-pulse"></div>
          <div className="h-1.5 md:h-2 w-[80%] bg-white/5 rounded animate-pulse"></div>
          <div className="h-1.5 md:h-2 w-[90%] bg-white/5 rounded animate-pulse"></div>
        </div>
      ) : error ? (
        <p className="text-[10px] text-rose-400/70 font-medium">{error}</p>
      ) : (
        <>
          <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed font-medium mb-4 md:mb-6">
            {intel?.text?.substring(0, 180)}...
          </p>
          <div className="space-y-2">
            {intel?.sources?.slice(0, 2).map((s: any, i: number) => (
              <a 
                key={i} 
                href={s.uri} 
                target="_blank" 
                className="flex items-center justify-between p-2.5 md:p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.05] transition-all"
              >
                <span className="text-[8px] md:text-[9px] font-bold text-slate-300 truncate w-32 md:w-40">{s.title}</span>
                <i className="fa-solid fa-arrow-right text-[7px] md:text-[8px] text-slate-600"></i>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MarketIntelligence;
