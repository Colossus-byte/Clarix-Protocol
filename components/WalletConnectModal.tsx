// components/WalletConnectModal.tsx
// Clarix — Wallet connection modal with MetaMask + WalletConnect + install flow

import React, { useState } from 'react';
import { connectMetaMask, connectWalletConnect, WalletState, WalletError } from '../services/walletService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (wallet: WalletState) => void;
}

type Step = 'select' | 'connecting' | 'success' | 'error' | 'no-metamask';

const WalletConnectModal: React.FC<Props> = ({ isOpen, onClose, onConnected }) => {
  const [step, setStep] = useState<Step>('select');
  const [error, setError] = useState<string>('');
  const [connectedWallet, setConnectedWallet] = useState<WalletState | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<string>('');

  if (!isOpen) return null;

  const handleMetaMask = async () => {
    // Check if MetaMask is installed first
    if (typeof window.ethereum === 'undefined') {
      setStep('no-metamask');
      return;
    }

    setConnectingProvider('MetaMask');
    setStep('connecting');

    try {
      const wallet = await connectMetaMask();
      setConnectedWallet(wallet);
      setStep('success');
      setTimeout(() => {
        onConnected(wallet);
        onClose();
        setStep('select');
      }, 1500);
    } catch (err: any) {
      const walletErr = err as WalletError;
      setError(walletErr.userMessage || 'Connection failed. Please try again.');
      setStep('error');
    }
  };

  const handleWalletConnect = async () => {
    setConnectingProvider('WalletConnect');
    setStep('connecting');

    try {
      const wallet = await connectWalletConnect();
      setConnectedWallet(wallet);
      setStep('success');
      setTimeout(() => {
        onConnected(wallet);
        onClose();
        setStep('select');
      }, 1500);
    } catch (err: any) {
      const walletErr = err as WalletError;
      setError(walletErr.userMessage || 'Connection failed. Please try again.');
      setStep('error');
    }
  };

  const reset = () => {
    setStep('select');
    setError('');
    setConnectedWallet(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => { onClose(); reset(); }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#0d0d14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h2 className="text-white font-bold text-base tracking-tight">Connect Wallet</h2>
            <p className="text-slate-500 text-xs mt-0.5">Link your Web3 wallet to Clarix</p>
          </div>
          <button
            onClick={() => { onClose(); reset(); }}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <i className="fa-solid fa-xmark text-slate-400 text-sm"></i>
          </button>
        </div>

        <div className="px-6 py-6">

          {/* SELECT STEP */}
          {step === 'select' && (
            <div className="space-y-3">
              {/* MetaMask */}
              <button
                onClick={handleMetaMask}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500/5 hover:border-orange-500/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xl">🦊</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">MetaMask</p>
                  <p className="text-slate-500 text-xs">Browser extension wallet</p>
                </div>
                <i className="fa-solid fa-arrow-right text-slate-600 text-xs ml-auto group-hover:text-orange-400 transition-colors"></i>
              </button>

              {/* WalletConnect */}
              <button
                onClick={handleWalletConnect}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/5 hover:border-blue-500/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-qrcode text-blue-400 text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">WalletConnect</p>
                  <p className="text-slate-500 text-xs">Scan QR with any mobile wallet</p>
                </div>
                <i className="fa-solid fa-arrow-right text-slate-600 text-xs ml-auto group-hover:text-blue-400 transition-colors"></i>
              </button>

              <div className="pt-2 text-center">
                <p className="text-slate-600 text-[11px]">
                  New to wallets?{' '}
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-electric-violet hover:underline"
                  >
                    Get MetaMask free →
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* CONNECTING STEP */}
          {step === 'connecting' && (
            <div className="py-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-electric-violet/10 border border-electric-violet/20 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-electric-violet border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">Connecting to {connectingProvider}</p>
                <p className="text-slate-500 text-xs mt-1">
                  {connectingProvider === 'MetaMask'
                    ? 'Check your MetaMask extension for a popup...'
                    : 'Scan the QR code with your mobile wallet...'}
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS STEP */}
          {step === 'success' && connectedWallet && (
            <div className="py-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyber-lime/10 border border-cyber-lime/20 flex items-center justify-center">
                <i className="fa-solid fa-check text-cyber-lime text-2xl"></i>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">Wallet Connected!</p>
                <p className="text-slate-400 text-xs mt-1 font-mono">
                  {connectedWallet.address.slice(0, 8)}...{connectedWallet.address.slice(-6)}
                </p>
                <p className="text-cyber-lime text-xs mt-1">{connectedWallet.chainName}</p>
              </div>
            </div>
          )}

          {/* ERROR STEP */}
          {step === 'error' && (
            <div className="py-4 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                <i className="fa-solid fa-triangle-exclamation text-red-400 text-2xl"></i>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">Connection Failed</p>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{error}</p>
              </div>
              <button
                onClick={reset}
                className="w-full py-3 rounded-xl bg-electric-violet text-white font-bold text-sm hover:bg-violet-500 transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* NO METAMASK STEP */}
          {step === 'no-metamask' && (
            <div className="py-4 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <span className="text-3xl">🦊</span>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">MetaMask Not Found</p>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Install the MetaMask browser extension to connect, or use WalletConnect to connect a mobile wallet instead.
                </p>
              </div>
              <div className="w-full space-y-2">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-400 transition-all flex items-center justify-center gap-2"
                >
                  <span>Install MetaMask</span>
                  <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                </a>
                <button
                  onClick={() => { reset(); handleWalletConnect(); }}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 transition-all"
                >
                  Use WalletConnect Instead
                </button>
              </div>
              <button onClick={reset} className="text-slate-600 text-xs hover:text-slate-400 transition-colors">
                ← Go back
              </button>
            </div>
          )}

        </div>

        {/* Security note */}
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
