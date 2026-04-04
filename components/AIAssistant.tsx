// components/AIAssistant.tsx
// Clarix — Claude-powered AI Assistant with portfolio + market context

import React, { useState, useRef, useEffect } from 'react';
import { generatePortfolioAwareResponse } from '../services/claudeService';
import { Language } from '../types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentContext: string;
  language: Language;
  // Context enrichment
  holdingsSummary?: string;       // e.g. "BTC $4,200 | ETH $1,100"
  credentialLevel?: string;       // e.g. "Level 2 — Practical"
  topCoinsSummary?: string;       // e.g. "BTC +2.1% | ETH -0.4% ..."
}

const SUGGESTED_PROMPTS = [
  'What should I do with my portfolio today?',
  'Explain Bitcoin in one paragraph',
  'What is DeFi and should I try it?',
  'What are the biggest risks right now?',
  'How do I read a price chart?',
];

const AIAssistant: React.FC<Props> = ({ isOpen, onClose, currentContext, language, holdingsSummary, credentialLevel, topCoinsSummary }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const hasPortfolio = holdingsSummary && holdingsSummary !== 'No portfolio connected';
      setMessages([{
        role: 'assistant',
        content: hasPortfolio
          ? `Hey! I'm Clarix AI. I can see your portfolio and the current market prices, so I'm ready to give you personalised answers. What would you like to know?`
          : `Hey! I'm Clarix AI, your crypto intelligence assistant. Ask me anything about crypto — I'll always give you plain English answers with one clear takeaway. What's on your mind?`,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Build history for multi-turn (exclude welcome message)
      const history = messages
        .filter(m => !(m.role === 'assistant' && messages.indexOf(m) === 0))
        .map(m => ({ role: m.role, content: m.content }));

      const response = await generatePortfolioAwareResponse(
        text.trim(),
        {
          holdingsSummary: holdingsSummary || 'No portfolio connected yet',
          credentialLevel: credentialLevel || 'Beginner',
          topCoinsSummary: topCoinsSummary || 'Not available',
          language,
        },
        history
      );

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      setError('Failed to get response. Check your Claude API key in settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared. What would you like to explore?",
      timestamp: new Date(),
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 bottom-0 md:right-6 md:bottom-24 w-full md:w-[400px] h-[85vh] md:h-[600px] bg-[#0a0a0f] border border-white/10 md:rounded-2xl shadow-2xl shadow-black/50 flex flex-col z-[49] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-black/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-electric-violet flex items-center justify-center">
            <i className="fa-solid fa-brain-circuit text-white text-sm"></i>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Clarix AI</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-lime animate-pulse"></div>
              <p className="text-cyber-lime text-[10px] font-semibold">Powered by Claude</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            title="Clear chat"
          >
            <i className="fa-solid fa-broom text-slate-400 text-xs"></i>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <i className="fa-solid fa-xmark text-slate-400 text-xs"></i>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-electric-violet/20 border border-electric-violet/30 flex items-center justify-center mr-2 mt-1 shrink-0">
                <i className="fa-solid fa-brain-circuit text-electric-violet text-[8px]"></i>
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-electric-violet text-white rounded-tr-sm'
                : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/50 text-right' : 'text-slate-600'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-electric-violet/20 border border-electric-violet/30 flex items-center justify-center mr-2 mt-1 shrink-0">
              <i className="fa-solid fa-brain-circuit text-electric-violet text-[8px]"></i>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-electric-violet animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-electric-violet animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-electric-violet animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] hover:bg-electric-violet/20 hover:border-electric-violet/30 hover:text-white transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/5 bg-black/40 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about crypto..."
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-electric-violet/50 transition-all"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-electric-violet disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-500 transition-all flex items-center justify-center shrink-0"
          >
            <i className="fa-solid fa-paper-plane text-white text-sm"></i>
          </button>
        </div>
        <p className="text-slate-600 text-[10px] mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>

    </div>
  );
};

export default AIAssistant;
