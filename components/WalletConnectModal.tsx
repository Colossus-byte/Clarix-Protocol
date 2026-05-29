// components/WalletConnectModal.tsx
// Wallet connection: MetaMask · Binance Wallet · WalletConnect

import React, { useState } from 'react';
import { connectMetaMask, connectBinance, WalletState, WalletError } from '../services/walletService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (wallet: WalletState) => void;
  onGuestPreview?: () => void;
}

type Step = 'select' | 'connecting' | 'success' | 'error' | 'no-wallet' | 'wc-mobile';

const ERROR_MESSAGES: Record<string, { title: string; body: string }> = {
  USER_REJECTED:  { title: 'Connection cancelled',      body: 'Connection cancelled. Try again when ready.' },
  USER_CANCELLED: { title: 'Connection cancelled',      body: 'Connection cancelled. Try again when ready.' },
  WRONG_NETWORK:  { title: 'Wrong network',             body: 'Please switch to a supported network in your wallet.' },
  NO_METAMASK:    { title: 'MetaMask not found',        body: "MetaMask isn't installed. Get it at metamask.io." },
  NO_BINANCE:     { title: 'Binance Wallet not found',  body: 'Binance Chain Wallet is not installed. Download it at binance.org.' },
  NO_ACCOUNTS:    { title: 'Wallet locked',             body: 'Please unlock your wallet and try again.' },
};

const WalletConnectModal: React.FC<Props> = ({ isOpen, onClose, onConnected }) => {
  const [step, setStep] = useState<Step>('select');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [connectedWallet, setConnectedWallet] = useState<WalletState | null>(null);
  const [connectingProvider, setConnectingProvider] = useState('');

  if (!isOpen) return null;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const hasInjectedWallet = typeof window.ethereum !== 'undefined';
  const dappHost = window.location.host || 'clarixprotocol.com';
  const dappUrl = encodeURIComponent(window.location.href);
  const metamaskDeepLink = `https://metamask.app.link/dapp/${dappHost}`;
  const trustDeepLink = `https://link.trustwallet.com/open_url?coin_id=60&url=${dappUrl}`;

  const connect = async (type: 'metamask' | 'binance') => {
    if (type === 'metamask' && !hasInjectedWallet) { setStep('no-wallet'); return; }
    const label = type === 'metamask' ? 'MetaMask' : 'Binance Wallet';
    setConnectingProvider(label);
    setStep('connecting');
    try {
      const wallet = type === 'metamask' ? await connectMetaMask() : await connectBinance();
      setConnectedWallet(wallet);
      setStep('success');
      setTimeout(() => { onConnected(wallet); onClose(); reset(); }, 1500);
    } catch (err: any) {
      const walletErr = err as WalletError;
      setError(walletErr.userMessage || 'Connection failed.');
      setErrorCode(walletErr.code || 'CONNECTION_FAILED');
      setStep('error');
    }
  };

  const connectViaWC = async () => {
    if (hasInjectedWallet) {
      // Many mobile wallets (Trust, Rainbow, etc.) inject window.ethereum — connect directly
      setConnectingProvider('WalletConnect');
      setStep('connecting');
      try {
        const wallet = await connectMetaMask();
        setConnectedWallet(wallet);
        setStep('success');
        setTimeout(() => { onConnected(wallet); onClose(); reset(); }, 1500);
      } catch (err: any) {
        const walletErr = err as WalletError;
        setError(walletErr.userMessage || 'Connection failed.');
        setErrorCode(walletErr.code || 'CONNECTION_FAILED');
        setStep('error');
      }
      return;
    }
    setStep('wc-mobile');
  };

  const reset = () => {
    setStep('select');
    setError('');
    setErrorCode('');
    setConnectedWallet(null);
    setConnectingProvider('');
  };

  const errorDisplay = ERROR_MESSAGES[errorCode] ?? { title: 'Connection failed', body: error || 'Something went wrong.' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { onClose(); reset(); }} />
      <div className="relative w-full max-w-sm bg-[#0d0d14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h2 className="text-white font-bold text-base tracking-tight">
              {step === 'select'    ? 'Connect Wallet' :
               step === 'connecting'? 'Connecting…' :
               step === 'success'   ? 'Connected!' :
               step === 'wc-mobile' ? 'WalletConnect' :
               step === 'error'     ? 'Connection Failed' : 'No Wallet Found'}
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {step === 'select'    ? 'Choose your wallet to continue' :
               step === 'connecting'? `Waiting for ${connectingProvider}…` :
               step === 'success'   ? 'Wallet linked successfully' :
               step === 'wc-mobile' ? 'Open in a compatible wallet app' :
               step === 'error'     ? 'Something went wrong' : 'Install a wallet to continue'}
            </p>
          </div>
          <button onClick={() => { onClose(); reset(); }} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
            <i className="fa-solid fa-xmark text-slate-400 text-sm"></i>
          </button>
        </div>

        <div className="px-6 py-6">

          {/* ── SELECT ─────────────────────────────────────────────────────────── */}
          {step === 'select' && (
            <div className="space-y-3">
              {/* MetaMask */}
              {isMobile && !hasInjectedWallet ? (
                <a href={metamaskDeepLink} className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500/5 hover:border-orange-500/20 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0"><span className="text-xl">🦊</span></div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-bold text-sm">MetaMask</p>
                    <p className="text-slate-500 text-xs">Open in MetaMask app</p>
                  </div>
                  <i className="fa-solid fa-arrow-up-right-from-square text-slate-600 text-xs group-hover:text-orange-400 transition-colors"></i>
                </a>
              ) : (
                <button onClick={() => connect('metamask')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500/5 hover:border-orange-500/20 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0"><span className="text-xl">🦊</span></div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">MetaMask</p>
                    <p className="text-slate-500 text-xs">Browser extension wallet</p>
                  </div>
                  <i className="fa-solid fa-arrow-right text-slate-600 text-xs ml-auto group-hover:text-orange-400 transition-colors"></i>
                </button>
              )}

              {/* Binance Wallet */}
              <button onClick={() => connect('binance')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-yellow-500/5 hover:border-yellow-500/20 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xl">🔶</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">Binance Wallet</p>
                  <p className="text-slate-500 text-xs">BNB Chain extension wallet</p>
                </div>
                <i className="fa-solid fa-arrow-right text-slate-600 text-xs ml-auto group-hover:text-yellow-400 transition-colors"></i>
              </button>

              {/* WalletConnect */}
              <button onClick={connectViaWC} className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/5 hover:border-blue-500/20 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 300 185" fill="none" className="w-6 h-6">
                    <path d="M61.4 36.3c49-48 128.5-48 177.5 0l5.9 5.8a6 6 0 010 8.5L228 67.4a3.2 3.2 0 01-4.3 0l-8-7.9c-34.2-33.5-89.6-33.5-123.7 0l-8.6 8.4a3.2 3.2 0 01-4.3 0L62.3 51.1a6 6 0 010-8.5l-.9-6.3zm219.2 40.8l18.9 18.5a6 6 0 010 8.5l-85.2 83.4a6.3 6.3 0 01-8.6 0l-60.4-59.2a1.6 1.6 0 00-2.2 0L83 187.5a6.3 6.3 0 01-8.6 0L-11.8 104a6 6 0 010-8.5l18.9-18.5a6.3 6.3 0 018.7 0l60.4 59.2c.6.6 1.5.6 2.2 0l60.5-59.2a6.3 6.3 0 018.6 0l60.4 59.2c.6.6 1.5.6 2.1 0l60.4-59.2a6.3 6.3 0 018.7 0z" fill="#3B99FC"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">WalletConnect</p>
                  <p className="text-slate-500 text-xs">Mobile wallets via QR code</p>
                </div>
                <i className="fa-solid fa-arrow-right text-slate-600 text-xs ml-auto group-hover:text-blue-400 transition-colors"></i>
              </button>
            </div>
          )}

          {/* ── WC MOBILE DEEP LINKS ────────────────────────────────────────────── */}
          {step === 'wc-mobile' && (
            <div className="space-y-3">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center pb-1">Open in your wallet app</p>
              <a href={metamaskDeepLink} className="w-full flex items-center gap-4 p-4 rounded-xl bg-orange-500/[0.06] border border-orange-500/20 hover:bg-orange-500/10 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0"><span className="text-xl">🦊</span></div>
                <div className="flex-1 text-left">
                  <p className="text-white font-bold text-sm">MetaMask</p>
                  <p className="text-slate-500 text-xs">Open in MetaMask browser</p>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square text-slate-600 text-xs group-hover:text-orange-400 transition-colors"></i>
              </a>
              <a href={trustDeepLink} className="w-full flex items-center gap-4 p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/20 hover:bg-blue-500/10 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0"><span className="text-xl">🛡️</span></div>
                <div className="flex-1 text-left">
                  <p className="text-white font-bold text-sm">Trust Wallet</p>
                  <p className="text-slate-500 text-xs">Open in Trust Wallet browser</p>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square text-slate-600 text-xs group-hover:text-blue-400 transition-colors"></i>
              </a>
              <button onClick={() => setStep('select')} className="w-full text-slate-600 text-xs hover:text-slate-400 transition-colors text-center py-1">← Back to wallets</button>
            </div>
          )}

          {/* ── CONNECTING ──────────────────────────────────────────────────────── */}
          {step === 'connecting' && (
            <div className="py-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-white font-bold text-sm text-center">Connecting to {connectingProvider}</p>
              <p className="text-slate-500 text-xs text-center">Check your wallet for a popup…</p>
            </div>
          )}

          {/* ── SUCCESS ─────────────────────────────────────────────────────────── */}
          {step === 'success' && connectedWallet && (
            <div className="py-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyber-lime/10 border border-cyber-lime/20 flex items-center justify-center">
                <i className="fa-solid fa-check text-cyber-lime text-2xl"></i>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">Wallet Connected!</p>
                <p className="text-slate-400 text-xs mt-1 font-mono">{connectedWallet.address.slice(0, 8)}…{connectedWallet.address.slice(-6)}</p>
                <p className="text-cyber-lime text-xs mt-1">{connectedWallet.chainName}</p>
              </div>
            </div>
          )}

          {/* ── ERROR ───────────────────────────────────────────────────────────── */}
          {step === 'error' && (
            <div className="py-4 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                <i className="fa-solid fa-triangle-exclamation text-red-400 text-2xl"></i>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">{errorDisplay.title}</p>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{errorDisplay.body}</p>
              </div>
              <button onClick={() => setStep('select')} className="w-full py-3 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-400 transition-all">
                Try Again
              </button>
            </div>
          )}

          {/* ── NO WALLET ───────────────────────────────────────────────────────── */}
          {step === 'no-wallet' && (
            <div className="py-2 flex flex-col gap-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-wallet text-slate-400 text-2xl"></i>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-sm">No wallet detected</p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    {isMobile ? 'Open this page inside your wallet app.' : 'Install MetaMask at metamask.io, then refresh.'}
                  </p>
                </div>
              </div>
              {!isMobile && (
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-sm flex items-center justify-center gap-2">
                  <span>🦊</span> Install MetaMask
                </a>
              )}
              <button onClick={() => setStep('select')} className="text-slate-600 text-xs hover:text-slate-400 transition-colors text-center">← Go back</button>
            </div>
          )}

        </div>

        {step === 'select' && (
          <div className="px-6 pb-5">
            <div className="flex items-center gap-2 text-slate-600 text-[10px]">
              <i className="fa-solid fa-shield-check text-cyber-lime/40"></i>
              <span>Clarix never stores your private keys or seed phrase</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnectModal;
