import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getTopCoins, type CoinPrice } from '../services/marketService';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  signal: 'Bullish' | 'Neutral' | 'Bearish';
  confidence: number;
  summary: string;
  sparkline: number[];
}

interface MarketDemoProps {
  progress?: { ipfsWatchlistCid?: string };
  onUpdate?: (updates: any) => void;
}

const INITIAL_ASSETS: Asset[] = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', price: 64230.50, change24h: 2.4, signal: 'Bullish', confidence: 88, summary: 'Strong accumulation by institutional wallets detected. Key resistance at $65k likely to break within 48 hours.', sparkline: [40, 45, 42, 50, 48, 55, 60, 58, 65, 70] },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', price: 3450.20, change24h: 1.2, signal: 'Bullish', confidence: 82, summary: 'Network congestion dropping, leading to lower burn rate, but Layer 2 activity is driving overall ecosystem growth.', sparkline: [30, 32, 35, 34, 38, 40, 39, 45, 48, 50] },
  { id: 'sol', symbol: 'SOL', name: 'Solana', price: 145.80, change24h: -0.5, signal: 'Neutral', confidence: 65, summary: 'Consolidating after recent rally. DEX volume remains high, but momentum indicators suggest a short-term cooling off period.', sparkline: [60, 58, 55, 59, 54, 50, 48, 52, 49, 45] },
  { id: 'bnb', symbol: 'BNB', name: 'Binance Coin', price: 580.40, change24h: 0.8, signal: 'Neutral', confidence: 70, summary: 'Launchpool announcements providing steady support. Price action is tightly bound to broader market movements.', sparkline: [50, 52, 51, 53, 52, 55, 54, 56, 55, 58] },
  { id: 'matic', symbol: 'MATIC', name: 'Polygon', price: 0.85, change24h: -2.1, signal: 'Bearish', confidence: 75, summary: 'Active addresses declining slightly week-over-week. Migration to new token standard causing temporary uncertainty.', sparkline: [70, 65, 68, 60, 55, 58, 50, 45, 42, 35] },
  { id: 'ada', symbol: 'ADA', name: 'Cardano', price: 0.45, change24h: 0.1, signal: 'Neutral', confidence: 55, summary: 'Development activity remains top-tier, but on-chain velocity is stagnant. Awaiting next major protocol upgrade.', sparkline: [40, 42, 41, 40, 43, 42, 44, 43, 45, 46] },
  { id: 'dot', symbol: 'DOT', name: 'Polkadot', price: 7.20, change24h: 4.5, signal: 'Bullish', confidence: 91, summary: 'Parachain auction dynamics shifting favorably. Social sentiment spike detected across major crypto forums.', sparkline: [20, 25, 30, 28, 35, 45, 50, 60, 75, 85] },
  { id: 'link', symbol: 'LINK', name: 'Chainlink', price: 14.50, change24h: -1.2, signal: 'Bearish', confidence: 68, summary: 'Exchange inflows spiking, suggesting potential sell pressure. Oracle usage remains stable but price action is weak.', sparkline: [80, 75, 78, 70, 65, 60, 55, 58, 50, 45] },
  { id: 'avax', symbol: 'AVAX', name: 'Avalanche', price: 35.40, change24h: 5.6, signal: 'Bullish', confidence: 85, summary: 'Subnet adoption accelerating. Gaming partnerships driving new wallet creation at a record pace this month.', sparkline: [30, 35, 40, 38, 45, 55, 65, 70, 85, 95] },
  { id: 'uni', symbol: 'UNI', name: 'Uniswap', price: 7.80, change24h: -0.4, signal: 'Neutral', confidence: 60, summary: 'Fee switch governance discussions ongoing. Trading volume holding steady against competitors.', sparkline: [50, 48, 52, 50, 49, 51, 50, 48, 47, 49] },
];

const Sparkline: React.FC<{ data: number[], color: string }> = ({ data, color }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (((val - min) / range) * 100);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 -10 100 120" className="w-full h-12 overflow-visible" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-md"
      />
    </svg>
  );
};

const MarketDemo: React.FC<MarketDemoProps> = ({ progress, onUpdate }) => {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewbieMode, setIsNewbieMode] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveToIPFS = () => {
    setIsSaving(true);
    // Simulate IPFS upload delay
    setTimeout(() => {
      const mockCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
      if (onUpdate) {
        onUpdate({ ipfsWatchlistCid: mockCid });
      }
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 2000);
  };

  const [isFetching, setIsFetching] = useState(false);

  const fetchRealData = async () => {
    setIsFetching(true);
    try {
      const data: CoinPrice[] = await getTopCoins(15);

      const newAssets = data.map(coin => {
        let signal: 'Bullish' | 'Neutral' | 'Bearish' = 'Neutral';
        let confidence = 50 + Math.floor(Math.random() * 30);

        if (coin.price_change_percentage_24h > 2) {
          signal = 'Bullish';
          confidence += 10;
        } else if (coin.price_change_percentage_24h < -2) {
          signal = 'Bearish';
          confidence += 10;
        }

        let summary = '';
        if (signal === 'Bullish') summary = `Strong upward momentum detected for ${coin.name}. On-chain metrics suggest accumulation.`;
        else if (signal === 'Bearish') summary = `Selling pressure observed for ${coin.name}. Key support levels are being tested.`;
        else summary = `${coin.name} is consolidating. Volatility is low, awaiting next major market catalyst.`;

        return {
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h || 0,
          signal,
          confidence: Math.min(99, confidence),
          summary,
          sparkline: coin.sparkline_in_7d?.price?.slice(-10) || [],
        };
      });
      setAssets(newAssets);
    } catch (error) {
      console.error("Failed to fetch market data:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Live data fetching
  useEffect(() => {
    fetchRealData();
    const interval = setInterval(fetchRealData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [assets, searchQuery]);

  const labels = {
    asset: isNewbieMode ? 'Coin' : 'Asset',
    price: isNewbieMode ? 'Current Value' : 'Price (USD)',
    change: isNewbieMode ? "Today's Move" : '24h Change',
    signal: isNewbieMode ? 'AI Prediction' : 'Clarix AI Signal',
    confidence: isNewbieMode ? 'AI Certainty' : 'Confidence Score'
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'Bullish': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Bearish': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getSparklineColor = (signal: string) => {
    switch (signal) {
      case 'Bullish': return '#34d399'; // emerald-400
      case 'Bearish': return '#fb7185'; // rose-400
      default: return '#94a3b8'; // slate-400
    }
  };

  return (
    <section className="w-full py-20 bg-surface relative overflow-hidden font-sans border-t border-white/5">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-hyper-gold/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header & Ticker */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300">Intelligence Feed</span>
            </h2>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                Live Demo Data · Signals update every 30s
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {progress?.ipfsWatchlistCid && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20" title="Watchlist Stored on IPFS">
                <i className="fa-solid fa-cube text-blue-500 text-[10px]"></i>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">IPFS</span>
              </div>
            )}
            <button 
              onClick={handleSaveToIPFS}
              disabled={isSaving || isSaved}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all group ${
                isSaved 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
              }`}
            >
              {isSaving ? (
                <><i className="fa-solid fa-circle-notch fa-spin"></i> <span className="text-xs font-bold tracking-wide">Uploading...</span></>
              ) : isSaved ? (
                <><i className="fa-solid fa-check"></i> <span className="text-xs font-bold tracking-wide">Saved to IPFS</span></>
              ) : (
                <><i className="fa-solid fa-cloud-arrow-up text-blue-500"></i> <span className="text-xs font-bold tracking-wide">Backup Watchlist</span></>
              )}
            </button>
            <div className="relative w-full sm:w-64">
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              <input 
                type="text" 
                placeholder="Search assets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              onClick={() => setIsNewbieMode(!isNewbieMode)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <i className={`fa-solid ${isNewbieMode ? 'fa-graduation-cap text-hyper-gold' : 'fa-bolt text-blue-500'} transition-colors`}></i>
              <span className="text-xs font-bold text-white tracking-wide">
                {isNewbieMode ? 'Expert Mode' : 'Newbie Mode'}
              </span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">{labels.asset}</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">{labels.price}</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">{labels.change}</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">{labels.signal}</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">{labels.confidence}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredAssets.map((asset) => (
                    <motion.tr 
                      key={asset.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedAsset(asset)}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                    >
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
                      <td className="px-6 py-5 font-mono text-white font-medium">
                        ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-1 font-bold ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <i className={`fa-solid ${asset.change24h >= 0 ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
                          {Math.abs(asset.change24h).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest ${getSignalColor(asset.signal)}`}>
                          {asset.signal === 'Bullish' && <i className="fa-solid fa-arrow-trend-up"></i>}
                          {asset.signal === 'Bearish' && <i className="fa-solid fa-arrow-trend-down"></i>}
                          {asset.signal === 'Neutral' && <i className="fa-solid fa-minus"></i>}
                          {asset.signal}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-hyper-gold rounded-full transition-all duration-1000"
                              style={{ width: `${asset.confidence}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-white">{asset.confidence}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredAssets.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                No assets found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/signup');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-black text-black uppercase tracking-widest transition-all bg-gradient-to-r from-blue-500 to-cyber-lime rounded-full hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95"
          >
            Get Full Access
            <i className="fa-solid fa-arrow-right ml-3"></i>
          </button>
        </div>

      </div>

      {/* Slide-over Panel */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div key="slide-over-container" className="fixed inset-0 z-[100]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAsset(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-full max-w-md bg-surface border-l border-white/10 shadow-2xl flex flex-col overflow-y-auto"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl text-white">
                    {selectedAsset.symbol[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedAsset.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">{selectedAsset.symbol}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAsset(null)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <div className="p-6 flex-1 space-y-8">
                {/* Price & Signal */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{labels.price}</p>
                    <p className="text-4xl font-black text-white tracking-tight">
                      ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border font-bold uppercase tracking-widest text-sm ${getSignalColor(selectedAsset.signal)}`}>
                    {selectedAsset.signal}
                  </div>
                </div>

                {/* Sparkline Chart */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">7-Day Trend (Mocked)</p>
                  <Sparkline data={selectedAsset.sparkline} color={getSparklineColor(selectedAsset.signal)} />
                </div>

                {/* AI Summary */}
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/40">
                    <i className="fa-solid fa-brain"></i>
                  </div>
                  <h4 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-3 ml-2">AI Intelligence Summary</h4>
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {selectedAsset.summary}
                  </p>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{labels.change}</p>
                    <p className={`text-lg font-bold ${selectedAsset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h.toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{labels.confidence}</p>
                    <p className="text-lg font-bold text-white">{selectedAsset.confidence}%</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-white/[0.02]">
                <button className="w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  Trade {selectedAsset.symbol} Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MarketDemo;
