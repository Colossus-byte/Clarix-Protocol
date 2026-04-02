// components/WalletSummaryCard.tsx
// Clarix — Live market data + real wallet balance display

import React, { useState, useEffect, useCallback } from 'react';
import { getWalletMarketData, formatPrice, formatChange, isPositive, WalletMarketData } from '../services/marketService';

interface Props {
  address?: string;
  onConnect: () => void;
}

const WalletSummaryCard: React.FC<Props> = ({ address, onConnect }) => {
  const [marketData, setMarketData] = useState<WalletMarketData | null>(null);
  const [ethBalance, setEthBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMarketData = useCallback(async () => {
    try {
      setError(null);
      const data = await getWalletMarketData();
      setMarketData(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load market data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch real ETH balance from wallet
  const fetchEthBalance = useCallback(async () => {
    if (!address || typeof window.ethereum === 'undefined') return;
    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      const balanceWei = parseInt(balanceHex, 16);
      const balanceEth = balanceWei / 1e18;
      setEthBalance(balanceEth);
    } catch (err) {
      console.error('Failed to fetch ETH balance:', err);
    }
  }, [address]);

  useEffect(() => {
    fetchMarketData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60_000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  useEffect(() => {
    if (address) fetchEthBalance();
  }, [address, fetchEthBalance]);

  const fearGreedLabel = (score: number) => {
    if (score < 25) return { label: 'Extreme Fear', color: 'text-red-400' };
    if (score < 45) return { label: 'Fear', color: 'text-orange-400' };
    if (score < 55) return { label: 'Neutral', color: 'text-yellow-400' };
    if (score < 75) return { label: 'Greed', color: 'text-green-400' };
    return { label: 'Extreme Greed', color: 'text-cyber-lime' };
  };

  const fearGreed = marketData ? fearGreedLabel(marketData.fearGreedIndex) : null;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-electric-violet/20 border border-electric-violet/30 flex items-center justify-center">
            <i className="fa-solid fa-chart-line text-electric-violet text-sm"></i>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-tight">Market Overview</h3>
            {lastUpdated && (
              <p className="text-slate-500 text-[10px]">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={fetchMarketData}
          disabled={isLoading}
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
          title="Refresh"
        >
          <i className={`fa-solid fa-rotate text-slate-400 text-xs ${isLoading ? 'animate-spin' : ''}`}></i>
        </button>
      </div>

      {/* Market Data Grid */}
      {isLoading && !marketData ? (
        <div className="px-6 py-8 flex items-center justify-center gap-3">
          <div className="w-4 h-4 border-2 border-electric-violet border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm">Fetching live prices...</span>
        </div>
      ) : error && !marketData ? (
        <div className="px-6 py-6 text-center">
          <p className="text-orange-400 text-sm mb-3">{error}</p>
          <button onClick={fetchMarketData} className="text-electric-violet text-xs underline">Retry</button>
        </div>
      ) : marketData ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">

          {/* BTC */}
          <div className="bg-black/60 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-400 text-xs font-bold">₿ BTC</span>
            </div>
            <p className="text-white font-bold text-lg tracking-tight">{formatPrice(marketData.btcPrice)}</p>
            <p className={`text-xs font-semibold mt-1 ${isPositive(marketData.btcChange24h) ? 'text-cyber-lime' : 'text-red-400'}`}>
              {formatChange(marketData.btcChange24h)} 24h
            </p>
          </div>

          {/* ETH */}
          <div className="bg-black/60 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400 text-xs font-bold">Ξ ETH</span>
            </div>
            <p className="text-white font-bold text-lg tracking-tight">{formatPrice(marketData.ethPrice)}</p>
            <p className={`text-xs font-semibold mt-1 ${isPositive(marketData.ethChange24h) ? 'text-cyber-lime' : 'text-red-400'}`}>
              {formatChange(marketData.ethChange24h)} 24h
            </p>
          </div>

          {/* Market Cap */}
          <div className="bg-black/60 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-slate-400 text-xs font-bold">MARKET CAP</span>
            </div>
            <p className="text-white font-bold text-lg tracking-tight">
              ${(marketData.totalMarketCap / 1e12).toFixed(2)}T
            </p>
            <p className="text-slate-500 text-xs mt-1">Total crypto</p>
          </div>

          {/* Fear & Greed */}
          <div className="bg-black/60 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-slate-400 text-xs font-bold">SENTIMENT</span>
            </div>
            <p className="text-white font-bold text-lg tracking-tight">{marketData.fearGreedIndex}</p>
            {fearGreed && <p className={`text-xs font-semibold mt-1 ${fearGreed.color}`}>{fearGreed.label}</p>}
          </div>

        </div>
      ) : null}

      {/* Wallet Section */}
      <div className="px-6 py-5">
        {address ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Connected Wallet</p>
              <p className="text-white font-mono text-sm">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              {ethBalance !== null && marketData && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-blue-400 font-bold text-sm">{ethBalance.toFixed(4)} ETH</span>
                  <span className="text-slate-500 text-xs">
                    ≈ {formatPrice(ethBalance * marketData.ethPrice)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-lime/10 border border-cyber-lime/20">
              <div className="w-2 h-2 rounded-full bg-cyber-lime animate-pulse"></div>
              <span className="text-cyber-lime text-[10px] font-bold uppercase tracking-widest">Live</span>
            </div>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="w-full py-3 rounded-xl bg-electric-violet/10 border border-electric-violet/30 hover:bg-electric-violet/20 transition-all flex items-center justify-center gap-3 group"
          >
            <i className="fa-solid fa-wallet text-electric-violet text-sm"></i>
            <span className="text-white font-bold text-sm">Connect Wallet to See Your Balance</span>
            <i className="fa-solid fa-arrow-right text-electric-violet text-xs group-hover:translate-x-1 transition-transform"></i>
          </button>
        )}
      </div>

    </div>
  );
};

export default WalletSummaryCard;
