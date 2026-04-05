
import React, { useState } from 'react';
import SkillSpider from './SkillSpider';
import GlobalLeaderboard from './GlobalLeaderboard';
import { GoogleGenAI } from "@google/genai";

interface InstitutionalPortalProps {}

const InstitutionalPortal: React.FC<InstitutionalPortalProps> = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const teamMetrics = [
    { name: 'Alice (Senior Eng)', status: 'Mainnet Ready', score: 98, metrics: { cryptography: 95, defi: 90, security: 99, economics: 85 } },
    { name: 'Bob (Junior Dev)', status: 'In-Training', score: 64, metrics: { cryptography: 40, defi: 60, security: 30, economics: 70 } },
    { name: 'Charlie (Researcher)', status: 'In-Training', score: 82, metrics: { cryptography: 80, defi: 85, security: 70, economics: 95 } }
  ];

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this team performance: ${JSON.stringify(teamMetrics)}. Provide a one-sentence tactical optimization strategy for this organization to maximize its blockchain engineering output.`,
      });
      setAiInsight(response.text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="mt-12 md:mt-24 page-transition space-y-12 md:space-y-24">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[2rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <i className="fa-solid fa-briefcase text-xl md:text-2xl"></i>
          </div>
          <div>
            <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-1">Enterprise Dashboard: V4.0</h3>
            <p className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic">Institutional Growth Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 md:gap-4 self-start md:self-auto">
            <div className="text-left md:text-right">
              <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">Organization</p>
              <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-tight">Consensys Alpha Group</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <i className="fa-solid fa-building text-slate-400 text-xs md:text-sm"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Team Performance */}
        <div className="lg:col-span-8 space-y-8">
          <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <h4 className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Team Performance Sync</h4>
              <button className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                <i className="fa-solid fa-plus"></i>
                Add Operator
              </button>
            </div>
            <div className="space-y-4 md:space-y-6">
              {teamMetrics.map((member, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 rounded-xl md:rounded-2xl bg-black/40 border border-white/5 group hover:border-indigo-500/30 transition-all gap-4">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-white transition-colors">
                      <i className="fa-solid fa-user-gear text-sm md:text-base"></i>
                    </div>
                    <div>
                      <p className="text-white font-bold text-base md:text-lg leading-tight uppercase tracking-tight">{member.name}</p>
                      <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${member.status === 'Mainnet Ready' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {member.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-10 text-right">
                    <div>
                      <p className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Competency Score</p>
                      <p className="text-lg md:text-xl font-black text-white">{member.score}%</p>
                    </div>
                    <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-all border border-white/10">
                      <i className="fa-solid fa-chart-simple text-[10px] md:text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Leaderboard Integration */}
          <GlobalLeaderboard />
        </div>
        
        {/* Sidebar Stats */}
        <div className="lg:col-span-4 space-y-8">
           <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-indigo-500/5 border border-indigo-500/20">
              <h4 className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 md:mb-6 text-center">Org-Level Skill Distribution</h4>
              <SkillSpider metrics={{ cryptography: 70, defi: 78, security: 65, economics: 82 }} />
           </div>

           <div className="p-6 md:p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Team Optimizer</h4>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              </div>
              
              {aiInsight ? (
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 animate-in fade-in zoom-in-95 duration-500">
                  <p className="text-[10px] md:text-xs text-indigo-200 leading-relaxed italic">
                    "{aiInsight}"
                  </p>
                </div>
              ) : (
                <p className="text-[9px] md:text-[10px] text-slate-500 leading-relaxed">
                  Initialize neural analysis to identify team bottlenecks and optimize node allocation.
                </p>
              )}

              <button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="w-full py-3 md:py-4 rounded-xl bg-white/5 border border-white/10 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isOptimizing ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin"></i>
                    Analyzing Team...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-sparkles text-indigo-400"></i>
                    Run AI Calibration
                  </>
                )}
              </button>
           </div>

           <div className="p-6 md:p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6">
              <h4 className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Institutional Alpha</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <p className="text-[6px] md:text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1">Total TVL</p>
                  <p className="text-sm md:text-lg font-black text-white">$1.2B</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <p className="text-[6px] md:text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1">Nodes Active</p>
                  <p className="text-sm md:text-lg font-black text-white">42</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <p className="text-[6px] md:text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1">Uptime</p>
                  <p className="text-sm md:text-lg font-black text-emerald-500">99.9%</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <p className="text-[6px] md:text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1">Compliance</p>
                  <p className="text-sm md:text-lg font-black text-indigo-400">A+</p>
                </div>
              </div>
           </div>
           
           <button className="w-full py-4 md:py-6 rounded-xl md:rounded-[2rem] bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
              <i className="fa-solid fa-bolt-lightning"></i>
              Initialize Team Calibration
           </button>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalPortal;
