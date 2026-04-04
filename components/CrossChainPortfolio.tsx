import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useNewbieMode } from '../contexts/NewbieModeContext';
import { getCoinPrices } from '../services/marketService';
import { analyzePortfolio, PortfolioAnalysis } from '../services/claudeService';

interface TokenHolding {
  id: string;
  symbol: string;
  name: string;
  chain: string;
  balance: number;
  priceUsd: number;
  valueUsd: number;
  change24h: number;
  isStable: boolean;
  signal: 'Bullish' | 'Neutral' | 'Bearish';
  summary: string;
  confidence: number;
}

interface CrossChainPortfolioProps {
  walletAddress?: string;
  onConnectWallet: () => void;
  onFirstAnalysis?: () => void;
  completedTopics?: string[];
  username?: string;
}

const COLORS = {
  Ethereum: '#627EEA',
  'BNB Chain': '#F3BA2F',
  Polygon: '#8247E5',
  Solana: '#14F195',
};

export default function CrossChainPortfolio({ walletAddress, onConnectWallet, onFirstAnalysis, completedTopics = [], username = 'Investor' }: CrossChainPortfolioProps) {
  const { isNewbieMode } = useNewbieMode();
  const [addressInput, setAddressInput] = useState(walletAddress || '');
  const [isFetching, setIsFetching] = useState(false);
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Sync input with prop
  useEffect(() => {
    if (walletAddress) {
      setAddressInput(walletAddress);
      fetchPortfolio(walletAddress);
    }
  }, [walletAddress]);

  const fetchPortfolio = async (address: string) => {
    if (!address) return;
    setIsFetching(true);
    setError(null);

    try {
      const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY || 'YourApiKeyToken';
      const BSCSCAN_API_KEY = import.meta.env.VITE_BSCSCAN_API_KEY || 'YourApiKeyToken';
      const POLYGONSCAN_API_KEY = import.meta.env.VITE_POLYGONSCAN_API_KEY || 'YourApiKeyToken';
      const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';

      const fetchedHoldings: TokenHolding[] = [];

      try {
        // 1. Fetch Ethereum Balance (Etherscan Public API)
        const ethRes = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`);
        const ethData = await ethRes.json();
        if (ethData.status === '1') {
          const balance = parseInt(ethData.result) / 1e18;
          if (balance > 0) {
            fetchedHoldings.push({
              id: 'eth', symbol: 'ETH', name: 'Ethereum', chain: 'Ethereum', balance, priceUsd: 3450.20, valueUsd: balance * 3450.20, change24h: 1.2, isStable: false,
              signal: 'Bullish', confidence: 82, summary: 'Network congestion dropping, leading to lower burn rate, but Layer 2 activity is driving overall ecosystem growth.'
            });
          }
        }

        // 2. Fetch BNB Balance (BSCScan Public API)
        const bnbRes = await fetch(`https://api.bscscan.com/api?module=account&action=balance&address=${address}&tag=latest&apikey=${BSCSCAN_API_KEY}`);
        const bnbData = await bnbRes.json();
        if (bnbData.status === '1') {
          const balance = parseInt(bnbData.result) / 1e18;
          if (balance > 0) {
            fetchedHoldings.push({
              id: 'bnb', symbol: 'BNB', name: 'Binance Coin', chain: 'BNB Chain', balance, priceUsd: 580.40, valueUsd: balance * 580.40, change24h: 0.8, isStable: false,
              signal: 'Neutral', confidence: 70, summary: 'Launchpool announcements providing steady support. Price action is tightly bound to broader market movements.'
            });
          }
        }

        // 3. Fetch Polygon Balance (Polygonscan Public API)
        const maticRes = await fetch(`https://api.polygonscan.com/api?module=account&action=balance&address=${address}&tag=latest&apikey=${POLYGONSCAN_API_KEY}`);
        const maticData = await maticRes.json();
        if (maticData.status === '1') {
          const balance = parseInt(maticData.result) / 1e18;
          if (balance > 0) {
            fetchedHoldings.push({
              id: 'matic', symbol: 'MATIC', name: 'Polygon', chain: 'Polygon', balance, priceUsd: 0.85, valueUsd: balance * 0.85, change24h: -2.1, isStable: false,
              signal: 'Bearish', confidence: 75, summary: 'Active addresses declining slightly week-over-week. Migration to new token standard causing temporary uncertainty.'
            });
          }
        }

        // 4. Fetch Solana Balance (Solana Public RPC)
        const solRes = await fetch(SOLANA_RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address] })
        });
        const solData = await solRes.json();
        if (solData.result) {
          const balance = solData.result.value / 1e9;
          if (balance > 0) {
            fetchedHoldings.push({
              id: 'sol', symbol: 'SOL', name: 'Solana', chain: 'Solana', balance, priceUsd: 145.80, valueUsd: balance * 145.80, change24h: -0.5, isStable: false,
              signal: 'Neutral', confidence: 65, summary: 'Consolidating after recent rally. DEX volume remains high, but momentum indicators suggest a short-term cooling off period.'
            });
          }
        }
      } catch (apiError) {
        console.warn("API fetch failed, falling back to mock data", apiError);
      }

      // Fetch live prices from CoinGecko for all relevant coins
      let livePrices: Record<string, { usd: number; usd_24h_change: number }> = {};
      try {
        livePrices = await getCoinPrices(['ethereum', 'binancecoin', 'matic-network', 'solana', 'usd-coin']);
      } catch {
        // silently fall back to placeholder prices already set on each holding
      }

      const COIN_ID_MAP: Record<string, string> = {
        eth: 'ethereum',
        bnb: 'binancecoin',
        matic: 'matic-network',
        sol: 'solana',
        'usdc-eth': 'usd-coin',
      };

      const enrichWithLivePrice = (h: TokenHolding): TokenHolding => {
        const coinId = COIN_ID_MAP[h.id];
        const p = coinId ? livePrices[coinId] : undefined;
        if (!p) return h;
        const change24h = p.usd_24h_change ?? h.change24h;
        const signal: 'Bullish' | 'Neutral' | 'Bearish' =
          change24h > 2 ? 'Bullish' : change24h < -2 ? 'Bearish' : 'Neutral';
        return { ...h, priceUsd: p.usd, valueUsd: h.balance * p.usd, change24h, signal };
      };

      if (fetchedHoldings.length === 0) {
        setUsingMockData(true);
        const mockHoldings: TokenHolding[] = [
          { id: 'eth',      symbol: 'ETH',  name: 'Ethereum',     chain: 'Ethereum',  balance: 1.5,   priceUsd: 3450.20, valueUsd: 5175.30,  change24h: 1.2,  isStable: false, signal: 'Bullish', confidence: 82, summary: 'Network congestion dropping, leading to lower burn rate, but Layer 2 activity is driving overall ecosystem growth.' },
          { id: 'usdc-eth', symbol: 'USDC', name: 'USD Coin',     chain: 'Ethereum',  balance: 2500,  priceUsd: 1.00,    valueUsd: 2500.00,  change24h: 0.01, isStable: true,  signal: 'Neutral', confidence: 99, summary: 'Stablecoin pegged to USD. No significant price action expected.' },
          { id: 'bnb',      symbol: 'BNB',  name: 'Binance Coin', chain: 'BNB Chain', balance: 12.4,  priceUsd: 580.40,  valueUsd: 7196.96,  change24h: 0.8,  isStable: false, signal: 'Neutral', confidence: 70, summary: 'Launchpool announcements providing steady support. Price action is tightly bound to broader market movements.' },
          { id: 'matic',    symbol: 'MATIC',name: 'Polygon',      chain: 'Polygon',   balance: 5000,  priceUsd: 0.85,    valueUsd: 4250.00,  change24h: -2.1, isStable: false, signal: 'Bearish', confidence: 75, summary: 'Active addresses declining slightly week-over-week. Migration to new token standard causing temporary uncertainty.' },
          { id: 'sol',      symbol: 'SOL',  name: 'Solana',       chain: 'Solana',    balance: 45.2,  priceUsd: 145.80,  valueUsd: 6590.16,  change24h: -0.5, isStable: false, signal: 'Neutral', confidence: 65, summary: 'Consolidating after recent rally. DEX volume remains high, but momentum indicators suggest a short-term cooling off period.' },
        ].map(enrichWithLivePrice);
        setHoldings(mockHoldings);
      } else {
        setUsingMockData(false);
        setHoldings(fetchedHoldings.map(enrichWithLivePrice));
        // Fire first-analysis callback once
        if (!hasAnalyzed) {
          setHasAnalyzed(true);
          onFirstAnalysis?.();
        }
      }

    } catch (err) {
      setError('Failed to fetch portfolio data. Please check the address and try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPortfolio(addressInput);
  };

  const handleAiAnalyze = async () => {
    if (!holdings.length) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAiAnalysis(null);
    try {
      const holdingInput = holdings.map(h => ({
        symbol: h.symbol,
        chain: h.chain,
        valueUsd: h.valueUsd,
        change24h: h.change24h,
        signal: h.signal,
      }));
      const result = await analyzePortfolio(holdingInput, totalValue, completedTopics, username);
      setAiAnalysis(result);
    } catch {
      setAnalysisError('Analysis is unavailable right now. Check your Claude API key or try again shortly.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalValue = useMemo(() => holdings.reduce((sum, h) => sum + h.valueUsd, 0), [holdings]);
  
  const chainData = useMemo(() => {
    const chains: Record<string, number> = {};
    holdings.forEach(h => {
      chains[h.chain] = (chains[h.chain] || 0) + h.valueUsd;
    });
    return Object.entries(chains).map(([name, value]) => ({ name, value }));
  }, [holdings]);

  const healthScore = useMemo(() => {
    if (holdings.length === 0) return 0;
    
    // 1. Diversification (max 40 points)
    const numChains = new Set(holdings.map(h => h.chain)).size;
    const divScore = Math.min(40, numChains * 10);

    // 2. Stable vs Volatile Mix (max 30 points)
    const stableValue = holdings.filter(h => h.isStable).reduce((sum, h) => sum + h.valueUsd, 0);
    const stableRatio = stableValue / totalValue;
    // Ideal stable ratio is around 10-30% for a balanced portfolio
    const stableScore = stableRatio >= 0.1 && stableRatio <= 0.4 ? 30 : (stableRatio > 0.4 ? 20 : 10);

    // 3. Market Trend Alignment (max 30 points)
    const bullishValue = holdings.filter(h => h.signal === 'Bullish').reduce((sum, h) => sum + h.valueUsd, 0);
    const bearishValue = holdings.filter(h => h.signal === 'Bearish').reduce((sum, h) => sum + h.valueUsd, 0);
    const trendScore = bullishValue > bearishValue ? 30 : (bullishValue === bearishValue ? 15 : 5);

    return divScore + stableScore + trendScore;
  }, [holdings, totalValue]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'Bullish': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Bearish': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
    }
  };

  const labels = {
    token: isNewbieMode ? 'Coin' : 'Token',
    chain: isNewbieMode ? 'Network' : 'Chain',
    balance: isNewbieMode ? 'Amount Owned' : 'Balance',
    value: isNewbieMode ? 'Current Value' : 'Value USD',
    change: isNewbieMode ? "Today's Move" : '24h Change',
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-none mb-4">
            Cross-Chain <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300">Portfolio</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm md:text-base">
            Track your assets across Ethereum, BNB Chain, Polygon, and Solana. Powered by public APIs (Etherscan, BSCScan, Polygonscan, Solana RPC).
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <i className="fa-solid fa-wallet absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
          <input
            type="text"
            placeholder="Enter wallet address (0x... or Solana address)"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
          />
        </div>
        <button
          type="button"
          onClick={onConnectWallet}
          className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <i className="fa-solid fa-link"></i> Connect
        </button>
        <button
          type="submit"
          disabled={isFetching || !addressInput}
          className="px-8 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {isFetching ? (
            <><i className="fa-solid fa-circle-notch fa-spin"></i> Scanning Chains...</>
          ) : (
            <><i className="fa-solid fa-radar"></i> Analyze Portfolio</>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <i className="fa-solid fa-triangle-exclamation"></i>
          {error}
        </div>
      )}

      {usingMockData && holdings.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
          <i className="fa-solid fa-flask-vial"></i>
          Demo data: no real holdings found for this address. Connect a wallet or enter an address with on-chain activity to see live data.
        </div>
      )}

      {holdings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overview Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-br from-slate-900 to-surface border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none"></div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Net Worth</h3>
              <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
                <span>Portfolio Health Score</span>
                <span className={`text-lg font-black ${healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {healthScore}/100
                </span>
              </h3>
              
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-6">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${healthScore >= 80 ? 'bg-emerald-400' : healthScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                  style={{ width: `${healthScore}%` }}
                ></div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Diversification</span>
                  <span className="text-white font-bold">{new Set(holdings.map(h => h.chain)).size} Chains</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Stablecoin Ratio</span>
                  <span className="text-white font-bold">{((holdings.filter(h => h.isStable).reduce((sum, h) => sum + h.valueUsd, 0) / totalValue) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden h-64">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Chain Allocation</h3>
              <div className="w-full h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chainData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chainData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="lg:col-span-2 bg-surface/80 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{labels.token}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{labels.chain}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">{labels.balance}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">{labels.value}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">{labels.change}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {holdings.map((asset) => (
                    <React.Fragment key={asset.id}>
                      <tr className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white shadow-inner">
                              {asset.symbol[0]}
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-blue-500 transition-colors">{asset.name}</div>
                              <div className="text-xs text-slate-500 font-medium">{asset.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[asset.chain as keyof typeof COLORS] || '#fff' }}></div>
                            <span className="text-xs font-bold text-slate-300">{asset.chain}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-mono text-white font-medium text-right">
                          {asset.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                        </td>
                        <td className="px-6 py-5 font-mono text-white font-medium text-right">
                          ${asset.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className={`inline-flex items-center gap-1 font-bold ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <i className={`fa-solid ${asset.change24h >= 0 ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
                            {Math.abs(asset.change24h).toFixed(2)}%
                          </div>
                        </td>
                      </tr>
                      {/* AI Signal Row */}
                      <tr className="bg-white/[0.01]">
                        <td colSpan={5} className="px-6 py-4 border-b border-white/5">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest shrink-0 ${getSignalColor(asset.signal)}`}>
                              {asset.signal === 'Bullish' && <i className="fa-solid fa-arrow-trend-up"></i>}
                              {asset.signal === 'Bearish' && <i className="fa-solid fa-arrow-trend-down"></i>}
                              {asset.signal === 'Neutral' && <i className="fa-solid fa-minus"></i>}
                              {asset.signal}
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              <i className="fa-solid fa-robot text-blue-500 opacity-50"></i>
                              <p className="text-xs text-slate-400 italic">
                                "{asset.summary}" <span className="text-blue-500 font-bold not-italic">(AI Confidence: {asset.confidence}%)</span>
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AI Portfolio Advisor */}
      {holdings.length > 0 && (
        <div className="mt-8 rounded-[2rem] bg-surface border border-electric-violet/20 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-white/5 bg-electric-violet/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric-violet/20 border border-electric-violet/30 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-brain-circuit text-electric-violet text-lg"></i>
              </div>
              <div>
                <h3 className="text-white font-black text-sm tracking-tight">AI Portfolio Advisor</h3>
                <p className="text-slate-500 text-[10px]">Powered by Claude · personalised to your knowledge level</p>
              </div>
            </div>
            {!aiAnalysis && (
              <button
                onClick={handleAiAnalyze}
                disabled={isAnalyzing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-electric-violet hover:bg-violet-500 disabled:opacity-60 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-electric-violet/20"
              >
                {isAnalyzing ? (
                  <><i className="fa-solid fa-circle-notch fa-spin"></i> Analysing...</>
                ) : (
                  <><i className="fa-solid fa-wand-magic-sparkles"></i> Analyse My Portfolio</>
                )}
              </button>
            )}
            {aiAnalysis && (
              <button
                onClick={handleAiAnalyze}
                disabled={isAnalyzing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest transition-all"
              >
                <i className="fa-solid fa-rotate text-[10px]"></i> Refresh
              </button>
            )}
          </div>

          {/* Loading skeleton */}
          {isAnalyzing && (
            <div className="p-6 space-y-4 animate-pulse">
              <div className="h-3 w-1/2 bg-white/10 rounded-full"></div>
              <div className="h-3 w-3/4 bg-white/5 rounded-full"></div>
              <div className="h-3 w-2/3 bg-white/5 rounded-full"></div>
              <div className="h-3 w-1/2 bg-white/5 rounded-full"></div>
              <p className="text-slate-500 text-xs text-center pt-2">Claude is reading your holdings and market conditions...</p>
            </div>
          )}

          {/* Error state */}
          {analysisError && !isAnalyzing && (
            <div className="p-6 flex items-start gap-3">
              <i className="fa-solid fa-triangle-exclamation text-rose-400 mt-0.5 shrink-0"></i>
              <div>
                <p className="text-rose-400 text-sm font-medium">{analysisError}</p>
                <button onClick={handleAiAnalyze} className="text-electric-violet text-xs font-bold mt-2 hover:underline">Try again</button>
              </div>
            </div>
          )}

          {/* Analysis results */}
          {aiAnalysis && !isAnalyzing && (
            <div className="p-6 space-y-5">
              {/* Health score bar */}
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                    <circle
                      cx="28" cy="28" r="22" fill="none"
                      stroke={aiAnalysis.healthScore >= 70 ? '#a3e635' : aiAnalysis.healthScore >= 40 ? '#f59e0b' : '#f43f5e'}
                      strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 22}`}
                      strokeDashoffset={`${2 * Math.PI * 22 * (1 - aiAnalysis.healthScore / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-black text-sm">{aiAnalysis.healthScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-white font-black text-base tracking-tight">{aiAnalysis.healthLabel}</p>
                  <p className="text-slate-400 text-xs leading-relaxed mt-0.5">{aiAnalysis.summary}</p>
                </div>
              </div>

              {/* Analysis cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <i className="fa-solid fa-chart-pie"></i> Concentration Risk
                  </p>
                  <p className="text-slate-300 text-xs leading-relaxed">{aiAnalysis.concentrationRisk}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <i className="fa-solid fa-signal"></i> Market Conditions
                  </p>
                  <p className="text-slate-300 text-xs leading-relaxed">{aiAnalysis.marketConditions}</p>
                </div>
              </div>

              {/* Recommendation highlight */}
              <div className="p-4 rounded-xl bg-electric-violet/10 border border-electric-violet/20">
                <p className="text-[9px] font-black text-electric-violet uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-lightbulb"></i> Your Next Move
                </p>
                <p className="text-white text-sm leading-relaxed font-medium">{aiAnalysis.recommendation}</p>
              </div>

              {/* Watch out */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <i className="fa-solid fa-eye text-rose-400 mt-0.5 shrink-0 text-sm"></i>
                <div>
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Watch Out</p>
                  <p className="text-slate-300 text-xs leading-relaxed">{aiAnalysis.watchOut}</p>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder if no analysis yet and not loading */}
          {!aiAnalysis && !isAnalyzing && !analysisError && (
            <div className="px-6 py-8 text-center">
              <i className="fa-solid fa-brain-circuit text-electric-violet/30 text-3xl mb-3"></i>
              <p className="text-slate-500 text-sm">Click "Analyse My Portfolio" to get a personalised AI breakdown of your holdings, risks, and what to do next.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
