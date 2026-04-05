import React, { useEffect, useState } from 'react';
import {
  collection, getDocs, query, orderBy, limit,
  where, Timestamp, getCountFromServer,
} from 'firebase/firestore';
import { db } from '../firebase';

interface WalletReg {
  address: string;
  connectedAt: number; // ms
  username: string;
}

interface LeaderEntry {
  uid: string;
  username: string;
  xp: number;
  completedLessons: number;
  guild: string;
  streak: number;
}

interface Stats {
  totalWallets: number;
  newThisWeek: number;
  totalLessons: number;
  topUsers: LeaderEntry[];
}

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY as string | undefined;
const SESSION_KEY = 'clarix_admin_unlocked';

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const AdminPage: React.FC = () => {
  const [unlocked, setUnlocked] = useState(!ADMIN_KEY || sessionStorage.getItem(SESSION_KEY) === '1');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [wallets, setWallets] = useState<WalletReg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = () => {
    if (pin === ADMIN_KEY) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  useEffect(() => {
    if (!unlocked) return;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        // 1. Total wallet registrations
        const regSnap = await getCountFromServer(collection(db, 'wallet_registrations'));
        const totalWallets = regSnap.data().count;

        // 2. New this week
        const weekAgo = Timestamp.fromMillis(Date.now() - 7 * 86_400_000);
        const newSnap = await getCountFromServer(
          query(collection(db, 'wallet_registrations'), where('connectedAt', '>=', weekAgo))
        );
        const newThisWeek = newSnap.data().count;

        // 3. Top 10 users by completedLessons from leaderboard collection
        const lbQ = query(collection(db, 'leaderboard'), orderBy('completedLessons', 'desc'), limit(10));
        const lbSnap = await getDocs(lbQ);
        const topUsers: LeaderEntry[] = lbSnap.docs.map(d => ({
          uid: d.id,
          username: d.data().username ?? 'Unknown',
          xp: d.data().xp ?? 0,
          completedLessons: d.data().completedLessons ?? 0,
          guild: d.data().guild ?? '—',
          streak: d.data().streak ?? 0,
        }));

        // 4. Total lessons = sum of completedLessons across leaderboard
        //    (fetch all leaderboard docs for the sum — leaderboard is small)
        const allLbQ = query(collection(db, 'leaderboard'), orderBy('completedLessons', 'desc'));
        const allLbSnap = await getDocs(allLbQ);
        const totalLessons = allLbSnap.docs.reduce((sum, d) => sum + (d.data().completedLessons ?? 0), 0);

        // 5. Recent wallet registrations for the table
        const recentQ = query(collection(db, 'wallet_registrations'), orderBy('connectedAt', 'desc'), limit(50));
        const recentSnap = await getDocs(recentQ);
        const recentWallets: WalletReg[] = recentSnap.docs.map(d => ({
          address: d.data().address ?? d.id,
          connectedAt: d.data().connectedAt?.toMillis?.() ?? d.data().connectedAt ?? 0,
          username: d.data().username ?? 'Web3User',
        }));

        setStats({ totalWallets, newThisWeek, totalLessons, topUsers });
        setWallets(recentWallets);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [unlocked]);

  // ── Password gate ────────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-4">
        <div className="w-full max-w-xs p-8 rounded-2xl bg-surface border border-white/10 text-center">
          <i className="fa-solid fa-lock text-slate-500 text-3xl mb-4"></i>
          <h2 className="text-white font-black text-lg mb-1 uppercase tracking-widest">Admin Access</h2>
          <p className="text-slate-500 text-xs mb-6">Enter admin key to continue</p>
          <input
            type="password"
            value={pin}
            onChange={e => { setPin(e.target.value); setPinError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            placeholder="Admin key"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30 mb-3"
          />
          {pinError && <p className="text-rose-400 text-xs mb-3">Incorrect key</p>}
          <button
            onClick={handleUnlock}
            className="w-full py-2.5 rounded-xl bg-cyber-lime text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-void text-slate-200 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1">Internal</p>
            <h1 className="text-3xl font-black text-white tracking-tighter">Clarix Admin</h1>
          </div>
          <button
            onClick={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>Back to App
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <i className="fa-solid fa-circle-notch fa-spin text-cyber-lime text-3xl"></i>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-8">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>{error}
          </div>
        )}

        {stats && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Total Wallets Connected', value: stats.totalWallets.toLocaleString(), icon: 'fa-wallet', color: 'text-cyber-lime' },
                { label: 'New This Week', value: stats.newThisWeek.toLocaleString(), icon: 'fa-user-plus', color: 'text-blue-400' },
                { label: 'Total Lessons Completed', value: stats.totalLessons.toLocaleString(), icon: 'fa-graduation-cap', color: 'text-electric-violet' },
                { label: 'Active Users (leaderboard)', value: stats.topUsers.length > 0 ? `${stats.topUsers.length}+` : '0', icon: 'fa-fire', color: 'text-hyper-gold' },
              ].map(card => (
                <div key={card.label} className="p-5 rounded-2xl bg-surface border border-white/5">
                  <i className={`fa-solid ${card.icon} ${card.color} text-lg mb-3`}></i>
                  <p className="text-2xl font-black text-white mb-1">{card.value}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Top 10 active users */}
            <div className="mb-10">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                Top 10 Users by Lessons Completed
              </h2>
              <div className="rounded-2xl bg-surface border border-white/5 overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      {['Rank', 'Username', 'Lessons', 'XP', 'Streak', 'Guild'].map(h => (
                        <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats.topUsers.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-600 text-sm">No data yet</td></tr>
                    ) : stats.topUsers.map((u, i) => (
                      <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <span className={`text-sm font-black ${i === 0 ? 'text-hyper-gold' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-600'}`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-white">{u.username}</td>
                        <td className="px-4 py-3 text-sm font-bold text-cyber-lime">{u.completedLessons}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{u.xp.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-slate-400">
                          <i className="fa-solid fa-fire text-orange-400 mr-1 text-xs"></i>{u.streak}d
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 uppercase tracking-wider">{u.guild}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent wallet registrations */}
            <div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                Recent Wallet Registrations ({wallets.length} shown)
              </h2>
              <div className="rounded-2xl bg-surface border border-white/5 overflow-x-auto">
                <table className="w-full text-left min-w-[560px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      {['Wallet Address', 'Username', 'Connected', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {wallets.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-600 text-sm">No wallets registered yet</td></tr>
                    ) : wallets.map(w => (
                      <tr key={w.address} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-300">{w.address}</td>
                        <td className="px-4 py-3 text-sm text-white">{w.username}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{w.connectedAt ? timeAgo(w.connectedAt) : '—'}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{w.connectedAt ? formatDate(w.connectedAt) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
