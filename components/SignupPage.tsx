import React, { useState } from 'react';
import { motion } from 'motion/react';
import { connectWalletConnect, connectCoinbase } from '../services/walletService';

interface SignupPageProps {
  onWalletConnect: (address: string) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onWalletConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleWalletConnect = async (walletType: 'walletconnect' | 'coinbase') => {
    setErrorMsg(null);
    setIsConnecting(true);
    try {
      const wallet = walletType === 'walletconnect'
        ? await connectWalletConnect()
        : await connectCoinbase();
      onWalletConnect(wallet.address);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        setErrorMsg('Connection request was rejected.');
      } else {
        setErrorMsg(`Failed to connect. Please try again.`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-hyper-gold/10 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <i className="fa-solid fa-user-plus text-blue-500 text-xl"></i>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Account</h2>
          <p className="text-slate-400 text-sm">Join Clarix Protocol and start your journey.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-medium text-center mb-6">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleWalletConnect('walletconnect' as const)}
            disabled={isConnecting}
            className="wallet-connect-btn w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#3b99fc]/50 text-white font-bold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <div className="w-5 h-5 rounded-full bg-[#3b99fc] flex items-center justify-center">
              <i className="fa-solid fa-link text-white text-xs"></i>
            </div>
            WalletConnect <span className="text-slate-500 font-normal">(MetaMask, Rainbow &amp; more)</span>
          </button>

          <button 
            onClick={() => handleWalletConnect('coinbase' as const)}
            disabled={isConnecting}
            className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#0052ff]/50 text-white font-bold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <div className="w-5 h-5 rounded-full bg-[#0052ff] flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
            </div>
            Coinbase Wallet
          </button>
        </div>

        {isConnecting && (
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm rounded-3xl z-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-white font-bold tracking-wide">Connecting Wallet...</p>
            <p className="text-slate-400 text-sm mt-2">Please approve the request in your wallet</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => document.querySelector<HTMLButtonElement>('.wallet-connect-btn')?.focus()}
              className="text-blue-500 font-bold hover:text-blue-400 transition-colors"
            >
              Connect your wallet above to sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
