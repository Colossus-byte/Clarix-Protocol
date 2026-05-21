// components/WalletConnectModal.tsx
// Optional wallet connection (MetaMask + Coinbase) — accessed from profile settings

import React, { useState } from 'react';
import { connectMetaMask, connectCoinbase, WalletState, WalletError } from '../services/walletService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (wallet: WalletState) => void;
  onGuestPreview?: () => void;
}

type Step = 'select' | 'connecting' | 'success' | 'error' | 'no-wallet';

const ERROR_MESSAGES: Record<string, { title: string; body: string }> = {
  USER_REJECTED:  { title: 'Connection cancelled', body: 'Connection cancelled. Try again when ready.' },
  USER_CANCELLED: { title: 'Connection cancelled', body: 'Connection cancelled. Try again when ready.' },
  WRONG_NETWORK:  { title: 'Wrong network',         body: 'Please switch to Ethereum mainnet in your wallet.' },
  NO_METAMASK:    { title: 'No wallet found',        body: "MetaMask isn't installed. Install it at metamask.io." },
  NO_ACCOUNTS:    { title: 'Wallet locked',          body: 'Please unlock your wallet and try again.' },
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
  const metamaskDeepLink = `https://metamask.app.link/dapp/${dappHost}`;
  const dappUrl = encodeURIComponent(window.location.href);
  const coinbaseDeepLink = `https://go.cb-wallet.io/dapp?cbweb=${dappUrl}`;

  const connect = async (type: 'metamask' | 'coinbase') => {
    if (type === 'metamask' && !hasInjectedWallet) { setStep('no-wallet'); return; }
    setConnectingProvider(type === 'metamask' ? 'MetaMask' : 'Coinbase Wallet');
    setStep('connecting');
    try {
      const wallet = type === 'metamask' ? await connectMetaMask() : await connectCoinbase();
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

  const reset = () => {
    setStep('select');
    setError('');
    setErrorCode('');
    setConnectedWallet(null);
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
              {step === 'select' ? 'Connect Wallet' :
               step === 'connecting' ? 'Connecting…' :
               step === 'success' ? 'Connected!' :
               step === 'error' ? 'Connection Failed' : 'No Wallet Found'}
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {step === 'select' ? 'Optional — enables Web3 features' :
               step === 'connecting' ? `Waiting for ${connectingProvider}…` :
               step === 'success' ? 'Wallet linked successfully' :
               step === 'error' ? 'Something went wrong' : 'Set up a wallet to continue'}
            </p>
          </div>
          <button onClick={() => { onClose(); reset(); }} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
            <i className="fa-solid fa-xmark text-slate-400 text-sm"></i>
          </button>
        </div>

        <div className="px-6 py-6">

          {/* SELECT */}
          {step === 'select' && (
            <div className="space-y-3">
              {isMobile && !hasInjectedWallet ? (
                <>
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center pb-1">Open directly in your wallet app</p>
                  <a href={metamaskDeepLink} className="w-full flex items-center gap-4 p-4 rounded-xl bg-orange-500/8 border border-orange-500/20 hover:bg-orange-500/15 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0"><span className="text-xl">🦊</span></div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-bold text-sm">Open in MetaMask</p>
                      <p className="text-slate-500 text-xs">Connect inside the MetaMask browser</p>
                    </div>
                    <i className="fa-solid fa-arrow-up-right-from-square text-slate-600 text-xs group-hover:text-orange-400 transition-colors"></i>
                  </a>
                  <a href={coinbaseDeepLink} className="w-full flex items-center gap-4 p-4 rounded-xl bg-blue-500/8 border border-blue-500/20 hover:bg-blue-500/15 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0"><i className="fa-solid fa-circle-dot text-blue-400 text-lg"></i></div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-bold text-sm">Open in Coinbase Wallet</p>
                      <p className="text-slate-500 text-xs">Connect inside the Coinbase browser</p>
                    </div>
                    <i className="fa-solid fa-arrow-up-right-from-square text-slate-600 text-xs group-hover:text-blue-400 transition-colors"></i>
                  </a>
                </>
              ) : (
                <>
                  <button onClick={() => connect('metamask')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500/5 hover:border-orange-500/20 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0"><span className="text-xl">🦊</span></div>
                    <div className="text-left">
                      <p className="text-white font-bold text-sm">MetaMask</p>
                      <p className="text-slate-500 text-xs">Browser extension wallet</p>
                    </div>
                    <i className="fa-solid fa-arrow-right text-slate-600 text-xs ml-auto group-hover:text-orange-400 transition-colors"></i>
                  </button>
                  <button onClick={() => connect('coinbase')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/5 hover:border-blue-500/20 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0"><i className="fa-solid fa-circle-dot text-blue-400 text-lg"></i></div>
                    <div className="text-left">
                      <p className="text-white font-bold text-sm">Coinbase Wallet</p>
                      <p className="text-slate-500 text-xs">Browser extension or smart wallet</p>
                    </div>
                    <i className="fa-solid fa-arrow-right text-slate-600 text-xs ml-auto group-hover:text-blue-400 transition-colors"></i>
                  </button>
                </>
              )}
            </div>
          )}

          {/* CONNECTING */}
          {step === 'connecting' && (
            <div className="py-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-white font-bold text-sm text-center">Connecting to {connectingProvider}</p>
              <p className="text-slate-500 text-xs text-center">Check your wallet for a popup…</p>
            </div>
          )}

          {/* SUCCESS */}
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

          {/* ERROR */}
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

          {/* NO WALLET */}
          {step === 'no-wallet' && (
            <div className="py-2 flex flex-col gap-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-wallet text-slate-400 text-2xl"></i>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-sm">No wallet detected</p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    {isMobile ? 'Open this page inside your wallet app.' : 'Install MetaMask at metamask.io or use Coinbase Wallet.'}
                  </p>
                </div>
              </div>
              {isMobile ? (
                <div className="space-y-2">
                  <a href={metamaskDeepLink} className="w-full py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-sm flex items-center justify-center gap-2">
                    <span>🦊</span> Open in MetaMask
                  </a>
                  <a href={coinbaseDeepLink} className="w-full py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm flex items-center justify-center gap-2">
                    <i className="fa-solid fa-circle-dot"></i> Open in Coinbase Wallet
                  </a>
                </div>
              ) : (
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
