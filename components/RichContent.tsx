
import React from 'react';
import { KEYWORD_RESOURCES } from '../constants';
import CodeSnippet from './CodeSnippet';

interface RichContentProps {
  content: string;
}

// Module-scope: avoids recompiling the regex on every render
const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;

const RichContent: React.FC<RichContentProps> = ({ content }) => {
  
  const injectLinks = (text: string) => {
    let result: (string | React.JSX.Element)[] = [text];

    // Priority keywords requested by user to have explicit "Learn More" labels
    const explicitLabels = ['NFTs', 'DAOs', 'Layer 2 Scaling Solutions', 'Proof-of-Stake', 'Proof-of-Work'];

    Object.entries(KEYWORD_RESOURCES).forEach(([keyword, url]) => {
      const newResult: (string | React.JSX.Element)[] = [];
      // Fix: Defined processPart as a local function instead of assigning it as a property to the result array.
      const processPart = (part: string | React.JSX.Element) => {
        if (typeof part !== 'string') {
          newResult.push(part);
          return;
        }

        const regex = new RegExp(`(${keyword})`, 'g');
        const split = part.split(regex);
        
        split.forEach((item, i) => {
          if (item === keyword) {
            const isExplicit = explicitLabels.includes(keyword);
            newResult.push(
              <span key={`${keyword}-${i}`} className="inline-flex items-center gap-1.5 group">
                <span className="font-bold text-white border-b border-cyber-lime/30 group-hover:border-cyber-lime transition-colors">
                  {item}
                </span>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-[9px] font-black text-cyber-lime uppercase tracking-widest hover:text-white transition-all flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyber-lime/5 border border-cyber-lime/10 hover:bg-cyber-lime hover:border-cyber-lime ${isExplicit ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  {isExplicit ? 'Learn More' : <i className="fa-solid fa-arrow-up-right"></i>}
                  {isExplicit && <i className="fa-solid fa-arrow-up-right text-[7px]"></i>}
                </a>
              </span>
            );
          } else if (item !== "") {
            newResult.push(item);
          }
        });
      };
      // Fix: Used the correctly defined local function processPart.
      result.forEach(processPart);
      result = newResult;
    });

    return result;
  };

  const renderContent = () => {
    const parts: (string | React.JSX.Element)[] = [];
    let lastIndex = 0;
    let match;
    let revealDelay = 0;

    codeBlockRegex.lastIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      const language = match[1];
      const code = match[2];

      if (textBefore) {
        textBefore.split('\n\n').forEach((chunk, i) => {
          if (!chunk.trim()) return;
          revealDelay += 100;
          parts.push(
            <div key={`text-${lastIndex}-${i}`} className="mb-8 reveal-item" style={{ animationDelay: `${revealDelay}ms` }}>
              {chunk.includes('Key Takeaway') ? (
                <div className="takeaway-card">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-cyber-lime/10 flex items-center justify-center border border-cyber-lime/20 shadow-lg shadow-cyber-lime/5 animate-pulse">
                          <i className="fa-solid fa-bolt-lightning text-sm text-cyber-lime"></i>
                      </div>
                      <span className="text-[10px] font-black text-cyber-lime uppercase tracking-[0.4em]">Protocol Intelligence</span>
                  </div>
                  <div className="text-white text-xl font-bold leading-relaxed tracking-tight">
                      {injectLinks(chunk.replace('💡 **Key Takeaway**', '').trim())}
                  </div>
                </div>
              ) : chunk.includes('Pro Tip') ? (
                <div className="pro-tip-card">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-electric-violet/10 flex items-center justify-center border border-electric-violet/20 shadow-lg shadow-electric-violet/5">
                          <i className="fa-solid fa-shield-halved text-sm text-electric-violet"></i>
                      </div>
                      <span className="text-[10px] font-black text-electric-violet uppercase tracking-[0.4em]">Security Directive</span>
                  </div>
                  <div className="text-slate-300 font-medium leading-relaxed italic text-lg">
                    {injectLinks(chunk.replace('🛡️ **Pro Tip**', '').trim())}
                  </div>
                </div>
              ) : (
                <p className="prose-note">{injectLinks(chunk)}</p>
              )}
            </div>
          );
        });
      }

      revealDelay += 150;
      parts.push(
        <div key={`code-wrap-${match.index}`} className="reveal-item" style={{ animationDelay: `${revealDelay}ms` }}>
          <CodeSnippet code={code} language={language} />
        </div>
      );
      lastIndex = match.index + match[0].length;
    }

    const remainingText = content.substring(lastIndex);
    if (remainingText) {
      remainingText.split('\n\n').forEach((chunk, i) => {
        if (!chunk.trim()) return;
        revealDelay += 100;
        parts.push(
          <div key={`text-end-${i}`} className="mb-8 reveal-item" style={{ animationDelay: `${revealDelay}ms` }}>
            {chunk.includes('Key Takeaway') ? (
              <div className="takeaway-card">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-cyber-lime/10 flex items-center justify-center border border-cyber-lime/20 shadow-lg shadow-cyber-lime/5 animate-pulse">
                        <i className="fa-solid fa-bolt-lightning text-sm text-cyber-lime"></i>
                    </div>
                    <span className="text-[10px] font-black text-cyber-lime uppercase tracking-[0.4em]">Protocol Intelligence</span>
                </div>
                <div className="text-white text-xl font-bold leading-relaxed tracking-tight">
                    {injectLinks(chunk.replace('💡 **Key Takeaway**', '').trim())}
                </div>
              </div>
            ) : chunk.includes('Pro Tip') ? (
              <div className="pro-tip-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-electric-violet/10 flex items-center justify-center border border-electric-violet/20 shadow-lg shadow-electric-violet/5">
                        <i className="fa-solid fa-shield-halved text-sm text-electric-violet"></i>
                    </div>
                    <span className="text-[10px] font-black text-electric-violet uppercase tracking-[0.4em]">Security Directive</span>
                </div>
                <div className="text-slate-300 font-medium leading-relaxed italic text-lg">
                  {injectLinks(chunk.replace('🛡️ **Pro Tip**', '').trim())}
                </div>
              </div>
            ) : (
              <p className="prose-note">{injectLinks(chunk)}</p>
            )}
          </div>
        );
      });
    }

    return parts;
  };

  return (
    <div className="mb-24 max-w-4xl mx-auto">
      {renderContent()}
    </div>
  );
};

export default RichContent;
