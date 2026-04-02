import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface SignupPageProps {
  onSignup: (email: string) => Promise<void>;
  onWalletConnect: (address: string) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onWalletConnect }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      await onSignup('');
    } catch (error: any) {
      console.error("Google login error:", error);
      setErrorMsg(error.message || 'Failed to connect with Google. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    onSignup(email);
  };

  const handleWalletConnect = async (walletType: string) => {
    setErrorMsg(null);
    setIsConnecting(true);
    
    try {
      if (walletType === 'metamask') {
        if (typeof window.ethereum !== 'undefined' && window.ethereum.request) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            onWalletConnect(accounts[0]);
          } else {
            setErrorMsg("No accounts found. Please unlock MetaMask.");
          }
        } else {
          setErrorMsg("MetaMask is not installed. Please install it to use this feature.");
          setTimeout(() => window.open('https://metamask.io/download/', '_blank'), 2000);
        }
      } else if (walletType === 'walletconnect') {
        setIsConnecting(true);
        setTimeout(() => {
          setIsConnecting(false);
          setErrorMsg('WalletConnect is currently unavailable in this environment.');
        }, 1500);
      } else if (walletType === 'coinbase') {
        setIsConnecting(true);
        setTimeout(() => {
          setIsConnecting(false);
          setErrorMsg('Coinbase Wallet connection is coming soon!');
        }, 1500);
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        setErrorMsg("Connection request was rejected.");
      } else {
        setErrorMsg(`Failed to connect ${walletType}. Please try again.`);
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

        <div className="space-y-5">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}
          <button 
            onClick={handleGoogleLogin}
            disabled={isConnecting}
            className="w-full py-4 mt-4 rounded-xl bg-white hover:bg-slate-100 text-black font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            {isConnecting ? 'Connecting...' : 'Continue with Google'}
          </button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-surface text-slate-500 font-medium uppercase tracking-widest text-xs">Or connect wallet</span>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => handleWalletConnect('metamask')}
            disabled={isConnecting}
            className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-hyper-gold/50 text-white font-bold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5" />
            Continue with MetaMask
          </button>
          
          <button 
            onClick={() => handleWalletConnect('walletconnect')}
            disabled={isConnecting}
            className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#3b99fc]/50 text-white font-bold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <div className="w-5 h-5 rounded-full bg-[#3b99fc] flex items-center justify-center">
              <i className="fa-solid fa-link text-white text-xs"></i>
            </div>
            WalletConnect
          </button>

          <button 
            onClick={() => handleWalletConnect('coinbase')}
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
          <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
            Already have an account? <span className="text-blue-500 font-bold">Sign in</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
