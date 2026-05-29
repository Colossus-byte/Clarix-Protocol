// components/SignupPage.tsx
// Wallet-first onboarding: MetaMask · Binance Wallet · WalletConnect

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { connectMetaMask, connectBinance, connectWalletConnect, WalletState, WalletError } from '../services/walletService';

interface SignupPageProps {
  onConnected?: (wallet: WalletState) => void;
  /** @deprecated use onConnected — kept for backward compatibility */
  onAuthSuccess?: () => void;
}

type Step = 'select' | 'connecting' | 'success' | 'error' | 'wc-mobile';

const WALLET_ERRORS: Record<string, string> = {
  USER_REJECTED:    'Connection cancelled. Try again when ready.',
  NO_METAMASK:      "MetaMask isn't installed. Get it at metamask.io.",
  NO_BINANCE:       'Binance Chain Wallet is not installed. Get it at binance.org.',
  NO_ACCOUNTS:      'Please unlock your wallet and try again.',
  CONNECTION_FAILED:'Failed to connect. Please try again.',
};

const SignupPage: React.FC<SignupPageProps> = ({ onConnected, onAuthSuccess }) => {
  const [step, setStep] = useState<Step>('select');
  const [connectingLabel, setConnectingLabel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [connectedAddress, setConnectedAddress] = useState('');

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const hasInjectedWallet = typeof window.ethereum !== 'undefined';
  const dappHost = window.location.host || 'clarixprotocol.com';
  const dappUrl = encodeURIComponent(window.location.href);
  const metamaskDeepLink = `https://metamask.app.link/dapp/${dappHost}`;
  const trustDeepLink = `https://link.trustwallet.com/open_url?coin_id=60&url=${dappUrl}`;

  const doConnect = async (type: 'metamask' | 'binance') => {
    const label = type === 'metamask' ? 'MetaMask' : 'Binance Wallet';
    setConnectingLabel(label);
    setStep('connecting');
    try {
      const wallet: WalletState = type === 'metamask'
        ? await connectMetaMask()
        : await connectBinance();
      setConnectedAddress(wallet.address);
      setStep('success');
      setTimeout(() => {
        onConnected?.(wallet);
        onAuthSuccess?.();
      }, 1200);
    } catch (err: any) {
      const code: string = err?.code ?? 'CONNECTION_FAILED';
      setErrorMsg(WALLET_ERRORS[code] ?? err?.userMessage ?? 'Something went wrong.');
      setStep('error');
    }
  };

  const doConnectWC = async () => {
    setConnectingLabel('WalletConnect');
    setStep('connecting');
    try {
      const wallet = await connectWalletConnect();
      setConnectedAddress(wallet.address);
      setStep('success');
      setTimeout(() => {
        onConnected?.(wallet);
        onAuthSuccess?.();
      }, 1200);
    } catch (err: any) {
      const code: string = err?.code ?? 'CONNECTION_FAILED';
      setErrorMsg(WALLET_ERRORS[code] ?? err?.userMessage ?? 'Something went wrong.');
      setStep('error');
    }
  };

  const goBack = () => { setStep('select'); setErrorMsg(''); };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-900/20 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="text-center pt-8 pb-6 px-6 sm:px-8">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
            <i className="fa-solid fa-wallet text-indigo-400 text-xl"></i>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
            {step === 'select'     ? 'Connect Your Wallet' :
             step === 'connecting' ? 'Connecting…' :
             step === 'success'    ? 'Connected!' :
             step === 'wc-mobile'  ? 'Open Wallet App' :
             'Connection Failed'}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {step === 'select'     ? 'Connect a wallet to save progress and earn verifiable credentials.' :
             step === 'connecting' ? `Waiting for ${connectingLabel}…` :
             step === 'success'    ? 'Wallet connected. Loading your dashboard…' :
             step === 'wc-mobile'  ? 'Open in a WalletConnect-compatible browser' :
             'Something went wrong. Please try again.'}
          </p>
        </div>

        <div className="px-6 sm:px-8 pb-8 space-y-3">

          {/* ── SELECT ───────────────────────────────────────────── */}
          {step === 'select' && (
            <>
              {/* MetaMask */}
              {isMobile && !hasInjectedWallet ? (
                <a
                  href={metamaskDeepLink}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500/5 hover:border-orange-500/20 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🦊</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-white font-bold text-sm">MetaMask</p>
                    <p className="text-slate-500 text-xs truncate">Open in MetaMask app</p>
                  </div>
                  <i className="fa-solid fa-arrow-up-right-from-square text-slate-500 text-xs shrink-0 group-hover:text-orange-400 transition-colors"></i>
                </a>
              ) : (
                <button
                  onClick={() => doConnect('metamask')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500/5 hover:border-orange-500/20 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🦊</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-white font-bold text-sm">MetaMask</p>
                    <p className="text-slate-500 text-xs truncate">Browser extension wallet</p>
                  </div>
                  <i className="fa-solid fa-arrow-right text-slate-500 text-xs shrink-0 ml-auto group-hover:text-orange-400 transition-colors"></i>
                </button>
              )}

              {/* Binance Wallet */}
              <button
                onClick={() => doConnect('binance')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-yellow-500/5 hover:border-yellow-500/20 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🔶</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white font-bold text-sm">Binance Wallet</p>
                  <p className="text-slate-500 text-xs truncate">BNB Chain extension wallet</p>
                </div>
                <i className="fa-solid fa-arrow-right text-slate-500 text-xs shrink-0 ml-auto group-hover:text-yellow-400 transition-colors"></i>
              </button>

              {/* WalletConnect */}
              <button
                onClick={doConnectWC}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/5 hover:border-blue-500/20 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 300 185" fill="none" className="w-6 h-6 shrink-0">
                    <path d="M61.4 36.3c49-48 128.5-48 177.5 0l5.9 5.8a6 6 0 010 8.5L228 67.4a3.2 3.2 0 01-4.3 0l-8-7.9c-34.2-33.5-89.6-33.5-123.7 0l-8.6 8.4a3.2 3.2 0 01-4.3 0L62.3 51.1a6 6 0 010-8.5l-.9-6.3zm219.2 40.8l18.9 18.5a6 6 0 010 8.5l-85.2 83.4a6.3 6.3 0 01-8.6 0l-60.4-59.2a1.6 1.6 0 00-2.2 0L83 187.5a6.3 6.3 0 01-8.6 0L-11.8 104a6 6 0 010-8.5l18.9-18.5a6.3 6.3 0 018.7 0l60.4 59.2c.6.6 1.5.6 2.2 0l60.5-59.2a6.3 6.3 0 018.6 0l60.4 59.2c.6.6 1.5.6 2.1 0l60.4-59.2a6.3 6.3 0 018.7 0z" fill="#3B99FC"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white font-bold text-sm">WalletConnect</p>
                  <p className="text-slate-500 text-xs truncate">Mobile wallets via QR code</p>
                </div>
                <i className="fa-solid fa-arrow-right text-slate-500 text-xs shrink-0 ml-auto group-hover:text-blue-400 transition-colors"></i>
              </button>

              <p className="text-center text-[10px] text-slate-700 pt-1">
                <i className="fa-solid fa-shield-check text-indigo-500/40 mr-1"></i>
                Clarix never stores your private keys or seed phrase
              </p>
            </>
          )}

          {/* ── CONNECTING ───────────────────────────────────────── */}
          {step === 'connecting' && (
            <div className="py-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-400 text-xs text-center">Check your wallet app for a connection popup…</p>
            </div>
          )}

          {/* ── SUCCESS ──────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="py-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyber-lime/10 border border-cyber-lime/20 flex items-center justify-center">
                <i className="fa-solid fa-check text-cyber-lime text-2xl"></i>
              </div>
              <p className="text-slate-400 text-xs font-mono break-all text-center px-2">
                {connectedAddress.slice(0, 10)}…{connectedAddress.slice(-8)}
              </p>
            </div>
          )}

          {/* ── ERROR ────────────────────────────────────────────── */}
          {step === 'error' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center leading-relaxed">
                {errorMsg}
              </div>
              <button
                onClick={goBack}
                className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ── WC MOBILE ────────────────────────────────────────── */}
          {step === 'wc-mobile' && (
            <div className="space-y-3">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center pb-1">
                Open directly in your wallet
              </p>
              <a
                href={metamaskDeepLink}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-orange-500/[0.06] border border-orange-500/20 hover:bg-orange-500/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0"><span className="text-xl">🦊</span></div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white font-bold text-sm">MetaMask</p>
                  <p className="text-slate-500 text-xs truncate">Open in MetaMask browser</p>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square text-slate-500 text-xs shrink-0 group-hover:text-orange-400 transition-colors"></i>
              </a>
              <a
                href={trustDeepLink}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/20 hover:bg-blue-500/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0"><span className="text-xl">🛡️</span></div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white font-bold text-sm">Trust Wallet</p>
                  <p className="text-slate-500 text-xs truncate">Open in Trust Wallet browser</p>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square text-slate-500 text-xs shrink-0 group-hover:text-blue-400 transition-colors"></i>
              </a>
              <button onClick={goBack} className="w-full text-slate-500 text-xs hover:text-slate-300 transition-colors text-center py-2">
                ← Back to wallets
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
