
import React, { useState } from 'react';
import { auditCode } from '../services/geminiService';

interface CodeSnippetProps {
  code: string;
  language: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ code, language }) => {
  const [currentCode, setCurrentCode] = useState(code.trim());
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const isModified = currentCode !== code.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCurrentCode(code.trim());
    setOutput(null);
    setAuditResult(null);
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    try {
      const result = await auditCode(currentCode);
      setAuditResult(result);
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setIsAuditing(false);
    }
  };

  const simulateRun = () => {
    setIsRunning(true);
    setOutput(null);
    
    setTimeout(() => {
      setIsRunning(false);
      
      // Dynamic simulation logic based on code content
      let mockOutput = "";
      const hasRequire = currentCode.includes('require');
      const hasFlashLoan = currentCode.includes('flashLoan');
      const hasMapping = currentCode.includes('mapping');
      const hasEvent = currentCode.includes('event') || currentCode.includes('emit');
      const hasFunction = currentCode.includes('function');

      if (hasFlashLoan) {
        mockOutput = "⚠ [EVM] Atomicity Check Failed: Loan not repaid in same block.\n⚠ [EVM] Reverting state changes...\nTotal Loss: 0 ETH (Security Protocol Active)";
      } else if (hasRequire && currentCode.includes('msg.sender')) {
        mockOutput = "✓ [EVM] Access Control Verified: msg.sender authorized.\n✓ [EVM] Transaction Validated: Condition met.\n✓ Gas Used: 24,102\n✓ Finality Status: Confirmed";
      } else if (hasMapping) {
        mockOutput = "✓ [EVM] Storage Slot Allocated: Mapping updated.\n✓ [EVM] Key-Value pair stored in persistent state.\n✓ Gas Used: 45,000\n✓ Status: Success";
      } else if (hasEvent) {
        mockOutput = "✓ [EVM] Event Emitted: Log entry created.\n✓ [EVM] Topic Hash: 0x" + Math.random().toString(16).substring(2, 10) + "...\n✓ [EVM] Data indexed for off-chain listeners.";
      } else if (hasFunction) {
        mockOutput = "✓ [V-CORE] Function Execution Simulation Successful\n✓ [V-CORE] Stack Depth: 1\n✓ [V-CORE] Memory Allocated: 64 bytes\n✓ [V-CORE] Hash: 0x" + Math.random().toString(16).substring(2, 10) + "...";
      } else {
        mockOutput = "✓ [V-CORE] Simulation Successful\n✓ [V-CORE] Output: State Updated\n✓ [V-CORE] Virtual Node Sync: Complete";
      }

      setOutput(mockOutput);
    }, 1200);
  };

  const lines = currentCode.split('\n');

  return (
    <div className="my-8 md:my-14 rounded-2xl md:rounded-3xl bg-surface border border-white/5 overflow-hidden shadow-2xl relative group/editor">
      {/* Header / Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-8 py-4 md:py-5 bg-white/[0.03] border-b border-white/5 backdrop-blur-md gap-4">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex gap-1.5 md:gap-2">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-neon-rose/50"></div>
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-hyper-gold/50"></div>
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-cyber-lime/50"></div>
          </div>
          <div className="h-3 md:h-4 w-px bg-white/10 mx-1"></div>
          <div className="flex flex-col">
            <span className="terminal-text text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <i className="fa-solid fa-terminal text-[10px] md:text-xs text-cyber-lime"></i>
              {language} SHELL_v8
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[6px] md:text-[7px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <i className="fa-solid fa-shield-check"></i>
                Sandbox Active (Safe)
              </span>
              {isModified && (
                <span className="text-[6px] md:text-[7px] font-black text-hyper-gold uppercase tracking-widest flex items-center gap-1">
                  <i className="fa-solid fa-pen-nib"></i>
                  Modified
                </span>
              )}
            </div>
          </div>
        </div>
        
          <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6">
            <button 
              onClick={handleAudit}
              disabled={isAuditing}
              className={`h-8 md:h-10 px-4 md:px-6 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2 md:gap-3 ${
                  isAuditing 
                  ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/30' 
                  : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/10 hover:scale-[1.05] active:scale-95'
              }`}
            >
              {isAuditing ? (
                  <><i className="fa-solid fa-microchip animate-pulse"></i> Auditing...</>
              ) : (
                  <><i className="fa-solid fa-shield-halved text-[8px] md:text-[10px]"></i> AI Audit</>
              )}
            </button>

            <button 
              onClick={simulateRun}
            disabled={isRunning}
            className={`h-8 md:h-10 px-4 md:px-6 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2 md:gap-3 ${
                isRunning 
                ? 'bg-hyper-gold/10 text-hyper-gold border border-hyper-gold/30' 
                : 'bg-cyber-lime text-white shadow-lg shadow-cyber-lime/10 hover:scale-[1.05] active:scale-95'
            }`}
          >
            {isRunning ? (
                <><i className="fa-solid fa-spinner animate-spin"></i> Processing...</>
            ) : (
                <><i className="fa-solid fa-play text-[6px] md:text-[8px]"></i> Simulate Node</>
            )}
          </button>
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="relative flex min-h-[200px] md:min-h-[250px] group/textarea">
        {isRunning && <div className="scanline z-10"></div>}
        
        {/* Line Numbers */}
        <div className="bg-white/[0.01] border-r border-white/5 py-6 md:py-8 px-3 md:px-5 text-right select-none">
          {lines.map((_, i) => (
            <div key={i} className="text-[10px] md:text-[12px] font-mono text-slate-700 leading-relaxed h-[1.6em]">
              {String(i + 1).padStart(2, '0')}
            </div>
          ))}
        </div>
        
        <div className="relative flex-1 bg-black/20">
            <textarea 
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full bg-transparent p-6 md:p-8 font-mono text-xs md:text-[15px] text-slate-300 focus:outline-none resize-none leading-[1.6em] custom-scrollbar selection:bg-cyber-lime/20"
              placeholder="Enter code to simulate..."
            />
            {/* Logo Watermark */}
            <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 pointer-events-none opacity-[0.03] transition-opacity group-focus-within/textarea:opacity-[0.01]">
              <i className="fa-solid fa-cube text-6xl md:text-8xl text-white"></i>
            </div>
        </div>
      </div>

      {/* Console Area */}
      {output && (
        <div className="p-6 md:p-8 bg-surface border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <div className="flex items-center gap-2 md:gap-3">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-cyber-lime shadow-[0_0_8px_#ccff00]"></div>
                <span className="terminal-text text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em]">EVM Node Trace</span>
            </div>
            <span className="text-[7px] md:text-[8px] font-black text-slate-700 uppercase tracking-widest">ProcessID: {Math.floor(Math.random()*9000)+1000}</span>
          </div>
          <pre className="font-mono text-[11px] md:text-[13px] text-cyber-lime/80 leading-relaxed whitespace-pre-wrap border-l-2 border-cyber-lime/20 pl-6 md:pl-8 py-2 md:py-3 bg-cyber-lime/[0.02] rounded-r-2xl">
            {output}
          </pre>
        </div>
      )}

      {/* AI Audit Area */}
      {auditResult && (
        <div className="p-6 md:p-10 bg-surface border-t border-indigo-500/20 animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <i className="fa-solid fa-brain text-xl md:text-2xl"></i>
              </div>
              <div>
                <h4 className="text-[10px] md:text-[12px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-1">Neural Security Audit</h4>
                <p className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic">Vulnerability Report</p>
              </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="text-right">
                <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Security Score</p>
                <p className={`text-2xl md:text-4xl font-black tracking-tighter ${auditResult.securityScore > 80 ? 'text-emerald-400' : auditResult.securityScore > 50 ? 'text-amber-400' : 'text-rose-500'}`}>
                  {auditResult.securityScore}/100
                </p>
              </div>
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                <div 
                  className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${auditResult.securityScore > 80 ? 'border-emerald-500' : auditResult.securityScore > 50 ? 'border-amber-500' : 'border-rose-500'}`}
                  style={{ clipPath: `inset(${100 - auditResult.securityScore}% 0 0 0)` }}
                ></div>
                <i className={`fa-solid ${auditResult.securityScore > 80 ? 'fa-shield-check text-emerald-500' : 'fa-shield-slash text-rose-500'} text-xl md:text-2xl`}></i>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-6 md:space-y-8">
              <h5 className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <i className="fa-solid fa-bug text-rose-500"></i>
                Critical Vulnerabilities
              </h5>
              <div className="space-y-4 md:space-y-5">
                {auditResult.vulnerabilities.map((v: any, i: number) => (
                  <div key={i} className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <span className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-tight">{v.type}</span>
                      <span className={`px-2 md:px-3 py-1 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest ${
                        v.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-500' : 
                        v.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500' : 
                        'bg-amber-500/20 text-amber-500'
                      }`}>
                        {v.severity}
                      </span>
                    </div>
                    <p className="text-[11px] md:text-[13px] text-slate-400 leading-relaxed mb-4 md:mb-5">{v.description}</p>
                    <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                      <p className="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Recommended Fix</p>
                      <p className="text-[10px] md:text-[12px] text-indigo-200/70 font-mono italic">{v.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              <h5 className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <i className="fa-solid fa-wand-magic-sparkles text-indigo-400"></i>
                Optimization Suggestions
              </h5>
              <div className="space-y-3 md:space-y-4">
                {auditResult.optimizations.map((opt: string, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/[0.01] border border-white/5">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                      <i className="fa-solid fa-check text-[10px]"></i>
                    </div>
                    <p className="text-[11px] md:text-[13px] text-slate-400 font-medium leading-relaxed">{opt}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 md:mt-10 p-6 md:p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                <h6 className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 md:mb-4">Executive Summary</h6>
                <p className="text-[12px] md:text-[14px] text-slate-300 leading-relaxed italic">
                  "{auditResult.summary}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeSnippet;
