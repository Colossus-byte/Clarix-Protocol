
import React from 'react';
import AppLogo from './AppLogo';

interface ManifestoProps {
  onClose: () => void;
}

const Manifesto: React.FC<ManifestoProps> = ({ onClose }) => {
  const outlineSteps = [
    { title: "Identity Synthesis", desc: "Initialize your ClarixPass and sync your neural signature." },
    { title: "Privacy Hardening", desc: "Activate ZK-Cloaking to operate anonymously across the P2P nexus." },
    { title: "Knowledge Sync", desc: "Navigate the obsidian nodes from Genesis to Pro-level architecture." },
    { title: "AI Co-Processing", desc: "Harness the Sentinel AI to audit protocols and predict market sentiment." },
    { title: "Mainnet Transmutation", desc: "Convert your proofs of knowledge into sovereign SBT credentials." }
  ];

  return (
    <div className="fixed inset-0 z-[600] bg-void overflow-y-auto no-scrollbar py-12 md:py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-20 md:space-y-32">
        <header className="text-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="flex justify-center">
            <AppLogo size="lg" />
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter italic uppercase">The Clarix Manifesto</h1>
          <p className="text-base md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            The world is centralized by default. Clarix is your terminal for reclaiming sovereignty.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
            <h2 className="text-[8px] md:text-[10px] font-black text-cyber-lime uppercase tracking-[0.5em]">The Vision</h2>
            <p className="text-xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              To bridge the gap between human intuition and cryptographic reality through an AI-augmented obsidian layer.
            </p>
          </div>
          <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <h2 className="text-[8px] md:text-[10px] font-black text-electric-violet uppercase tracking-[0.5em]">The Mission</h2>
            <p className="text-xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              To empower a new generation of sovereign digital citizens with the depth of an auditor and the foresight of an architect.
            </p>
          </div>
        </section>

        <section className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <h2 className="text-center text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">The Strategic Outline</h2>
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {outlineSteps.map((step, i) => (
              <div key={i} className="group p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row gap-4 md:gap-8 items-start sm:items-center hover:bg-white/[0.04] transition-all">
                <div className="text-4xl md:text-5xl font-black text-slate-800 italic group-hover:text-cyber-lime transition-colors">{i + 1}</div>
                <div>
                  <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-1 italic">{step.title}</h4>
                  <p className="text-sm md:text-base text-slate-500 font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center pb-12 md:pb-20">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-12 md:px-20 py-4 md:py-6 bg-cyber-lime text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(99,102,241,0.2)]"
          >
            I Accept the Directive
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Manifesto;
