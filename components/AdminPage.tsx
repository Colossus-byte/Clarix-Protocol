import React, { useEffect, useState, useCallback } from 'react';
import {
  collection, getDocs, query, orderBy, limit,
  where, Timestamp, getCountFromServer,
} from 'firebase/firestore';
import { db } from '../firebase';

// ── Types ─────────────────────────────────────────────────────────────────────

interface WalletReg {
  address: string;
  connectedAt: number;
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

interface EventDoc {
  id: string;
  eventName: string;
  walletAddress: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

interface UserDoc {
  uid: string;
  username: string;
  walletAddress?: string;
  tokenBalance?: number;
  completedLessons?: number;
  credentialCount?: number;
  createdAt?: number;
}

interface ModuleRow {
  id: string;
  title: string;
  starts: number;
  completions: number;
  dropOff: number;
}

interface OverviewStats {
  totalWallets: number;
  activeToday: number;
  totalLessons: number;
  totalCredentials: number;
  onboardingRate: number;
  totalPathDistributed: number;
  activeUsers: number;
  topUsers: LeaderEntry[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY as string | undefined;
const SESSION_KEY = 'clarix_admin_unlocked';

// Wallet addresses that bypass the PIN gate entirely (case-insensitive).
const ADMIN_WALLETS = [
  '0xa1778ca7b0ac30b61b7c6b00c618ed0bb8c81f9e',
];

/** Returns the wallet address currently stored in Clarix localStorage state. */
function getConnectedWallet(): string | null {
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith('clarix_v1_state')) continue;
      const data = JSON.parse(localStorage.getItem(key) ?? '{}');
      if (data.walletAddress) return (data.walletAddress as string).toLowerCase();
    }
  } catch { /* ignore parse errors */ }
  return null;
}

function isAdminWallet(): boolean {
  const w = getConnectedWallet();
  return w !== null && ADMIN_WALLETS.includes(w);
}

const MODULE_NAMES: Record<string, string> = {
  b1: 'Crypto Foundations',
  b2: 'Blockchain Mechanics',
  b3: 'Wallets and Security',
  f1: 'DeFi Fundamentals',
  f2: 'Trading and Technical Analysis',
  f3: 'Tokenomics and Market Cycles',
  m1: 'Web3 and NFTs',
  m2: 'Layer 2s and Scaling',
  p1: 'Crypto Portfolio Strategy',
  p2: 'Advanced DeFi and On-Chain Analysis',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function truncateWallet(addr: string): string {
  if (!addr || addr === 'anonymous') return 'anonymous';
  if (addr.length > 12) return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  return addr;
}

const EVENT_COLOR: Record<string, string> = {
  wallet_connected: 'text-cyan-400',
  wallet_disconnected: 'text-slate-500',
  lesson_completed: 'text-emerald-400',
  module_completed: 'text-indigo-400',
  quiz_passed: 'text-green-400',
  quiz_failed: 'text-rose-400',
  credential_earned: 'text-amber-400',
  token_earned: 'text-yellow-400',
  onboarding_completed: 'text-purple-400',
  onboarding_skipped: 'text-slate-500',
  referral_link_copied: 'text-blue-400',
  referral_converted: 'text-cyan-300',
};

// ── AdminPage ─────────────────────────────────────────────────────────────────

const AdminPage: React.FC = () => {
  const [unlocked, setUnlocked] = useState(
    !ADMIN_KEY ||
    sessionStorage.getItem(SESSION_KEY) === '1' ||
    isAdminWallet()
  );
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [wallets, setWallets] = useState<WalletReg[]>([]);
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [users, setUsers] = useState<UserDoc[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'modules' | 'users'>('overview');
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  const handleUnlock = () => {
    if (pin === ADMIN_KEY || ADMIN_WALLETS.includes(pin.toLowerCase())) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ── Overview stats ────────────────────────────────────────────────────
      const [regSnap, credSnap] = await Promise.all([
        getCountFromServer(collection(db, 'wallet_registrations')),
        getCountFromServer(collection(db, 'public_credentials')),
      ]);

      const weekAgo = Timestamp.fromMillis(Date.now() - 7 * 86_400_000);
      const oneDayAgo = Timestamp.fromMillis(Date.now() - 86_400_000);

      const [newSnap, activeTodaySnap] = await Promise.all([
        getCountFromServer(query(collection(db, 'wallet_registrations'), where('connectedAt', '>=', weekAgo))),
        getCountFromServer(query(collection(db, 'events'), where('timestamp', '>=', oneDayAgo))),
      ]);

      // Leaderboard
      const [lbTop10Snap, allLbSnap] = await Promise.all([
        getDocs(query(collection(db, 'leaderboard'), orderBy('completedLessons', 'desc'), limit(10))),
        getDocs(query(collection(db, 'leaderboard'), orderBy('completedLessons', 'desc'))),
      ]);

      const topUsers: LeaderEntry[] = lbTop10Snap.docs.map(d => ({
        uid: d.id,
        username: d.data().username ?? 'Unknown',
        xp: d.data().xp ?? 0,
        completedLessons: d.data().completedLessons ?? 0,
        guild: d.data().guild ?? '—',
        streak: d.data().streak ?? 0,
      }));

      const totalLessons = allLbSnap.docs.reduce((s, d) => s + (d.data().completedLessons ?? 0), 0);
      const totalPathDistributed = allLbSnap.docs.reduce((s, d) => s + (d.data().completedLessons ?? 0) * 3, 0);

      // Onboarding rate: % of event users who fired onboarding_completed
      const [obStartSnap, obDoneSnap] = await Promise.all([
        getCountFromServer(query(collection(db, 'events'), where('eventName', '==', 'onboarding_started'))),
        getCountFromServer(query(collection(db, 'events'), where('eventName', '==', 'onboarding_completed'))),
      ]);
      const onboardingRate = obStartSnap.data().count > 0
        ? Math.round((obDoneSnap.data().count / obStartSnap.data().count) * 100)
        : 0;

      setOverview({
        totalWallets: regSnap.data().count,
        activeToday: activeTodaySnap.data().count,
        totalLessons,
        totalCredentials: credSnap.data().count,
        onboardingRate,
        totalPathDistributed,
        activeUsers: allLbSnap.docs.length,
        topUsers,
      });

      // ── Wallet list ───────────────────────────────────────────────────────
      const recentQ = query(collection(db, 'wallet_registrations'), orderBy('connectedAt', 'desc'), limit(100));
      const recentSnap = await getDocs(recentQ);
      setWallets(recentSnap.docs.map(d => ({
        address: d.data().address ?? d.id,
        connectedAt: d.data().connectedAt?.toMillis?.() ?? d.data().connectedAt ?? 0,
        username: d.data().username ?? 'Web3User',
      })));

      // ── Recent events ─────────────────────────────────────────────────────
      const eventsQ = query(collection(db, 'events'), orderBy('timestamp', 'desc'), limit(20));
      const eventsSnap = await getDocs(eventsQ);
      setEvents(eventsSnap.docs.map(d => ({
        id: d.id,
        eventName: d.data().eventName ?? '?',
        walletAddress: d.data().walletAddress ?? 'anonymous',
        timestamp: d.data().timestamp?.toMillis?.() ?? Date.now(),
        data: d.data().data,
      })));

      // ── Module engagement ─────────────────────────────────────────────────
      const [lessonStartsSnap, lessonComplSnap, modComplSnap] = await Promise.all([
        getDocs(query(collection(db, 'events'), where('eventName', '==', 'lesson_started'))),
        getDocs(query(collection(db, 'events'), where('eventName', '==', 'lesson_completed'))),
        getDocs(query(collection(db, 'events'), where('eventName', '==', 'module_completed'))),
      ]);

      const startsByModule: Record<string, number> = {};
      lessonStartsSnap.docs.forEach(d => {
        const mid = (d.data().data as any)?.moduleId ?? 'unknown';
        startsByModule[mid] = (startsByModule[mid] ?? 0) + 1;
      });

      const complsByModule: Record<string, number> = {};
      lessonComplSnap.docs.forEach(d => {
        const mid = (d.data().data as any)?.moduleId ?? 'unknown';
        complsByModule[mid] = (complsByModule[mid] ?? 0) + 1;
      });

      const modComplByModule: Record<string, number> = {};
      modComplSnap.docs.forEach(d => {
        const mid = (d.data().data as any)?.moduleId ?? 'unknown';
        modComplByModule[mid] = (modComplByModule[mid] ?? 0) + 1;
      });

      const moduleRows: ModuleRow[] = Object.entries(MODULE_NAMES).map(([id, title]) => {
        const starts = startsByModule[id] ?? 0;
        const completions = modComplByModule[id] ?? 0;
        const dropOff = starts > 0 ? Math.round((1 - completions / starts) * 100) : 0;
        return { id, title, starts, completions, dropOff };
      });
      setModules(moduleRows);

      // ── User list from leaderboard ────────────────────────────────────────
      setUsers(allLbSnap.docs.map(d => ({
        uid: d.id,
        username: d.data().username ?? 'Unknown',
        walletAddress: d.data().walletAddress,
        tokenBalance: d.data().tokenBalance,
        completedLessons: d.data().completedLessons ?? 0,
        createdAt: d.data().updatedAt?.toMillis?.() ?? 0,
      })));

      setLastRefresh(Date.now());
    } catch (e: any) {
      setError(e.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    load();
    // Auto-refresh events every 60 seconds
    const interval = setInterval(() => {
      getDocs(query(collection(db, 'events'), orderBy('timestamp', 'desc'), limit(20))).then(snap => {
        setEvents(snap.docs.map(d => ({
          id: d.id,
          eventName: d.data().eventName ?? '?',
          walletAddress: d.data().walletAddress ?? 'anonymous',
          timestamp: d.data().timestamp?.toMillis?.() ?? Date.now(),
          data: d.data().data,
        })));
      }).catch(() => {});
    }, 60_000);
    return () => clearInterval(interval);
  }, [unlocked, load]);

  // ── Password gate ──────────────────────────────────────────────────────────
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
            className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'overview', label: 'Overview', icon: 'fa-gauge-high' },
    { id: 'modules', label: 'Modules', icon: 'fa-graduation-cap' },
    { id: 'events', label: 'Live Feed', icon: 'fa-bolt' },
    { id: 'users', label: 'Users', icon: 'fa-users' },
  ] as const;

  return (
    <div className="min-h-screen bg-void text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1">Internal</p>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Clarix Admin</h1>
            {lastRefresh > 0 && (
              <p className="text-[10px] text-slate-600 mt-0.5">Last updated {timeAgo(lastRefresh)}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40"
            >
              <i className={`fa-solid fa-arrows-rotate mr-1.5 ${loading ? 'fa-spin' : ''}`}></i>Refresh
            </button>
            <button
              onClick={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
            >
              <i className="fa-solid fa-arrow-left mr-1.5"></i>App
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>{error}
          </div>
        )}

        {loading && !overview && (
          <div className="flex items-center justify-center h-64">
            <i className="fa-solid fa-circle-notch fa-spin text-cyan-400 text-3xl"></i>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] p-1 rounded-xl border border-white/5 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white/[0.07] text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview tab ─────────────────────────────────────────────────── */}
        {activeTab === 'overview' && overview && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
              {[
                { label: 'Total Wallets', value: overview.totalWallets.toLocaleString(), icon: 'fa-wallet', color: 'text-cyan-400' },
                { label: 'Active Today', value: overview.activeToday.toLocaleString(), icon: 'fa-fire', color: 'text-orange-400' },
                { label: 'Lessons Done', value: overview.totalLessons.toLocaleString(), icon: 'fa-graduation-cap', color: 'text-indigo-400' },
                { label: 'Credentials', value: overview.totalCredentials.toLocaleString(), icon: 'fa-certificate', color: 'text-amber-400' },
                { label: '$PATH Out', value: overview.totalPathDistributed.toLocaleString(), icon: 'fa-coins', color: 'text-emerald-400' },
                { label: 'Onboard Rate', value: `${overview.onboardingRate}%`, icon: 'fa-chart-pie', color: 'text-purple-400' },
              ].map(card => (
                <div key={card.label} className="p-4 rounded-2xl bg-surface border border-white/5">
                  <i className={`fa-solid ${card.icon} ${card.color} text-base mb-2`}></i>
                  <p className="text-xl font-black text-white mb-0.5">{card.value}</p>
                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Top 10 users */}
            <div className="mb-8">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Top 10 by Lessons</h2>
              <div className="rounded-2xl bg-surface border border-white/5 overflow-x-auto">
                <table className="w-full text-left min-w-[480px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      {['Rank', 'Username', 'Lessons', 'XP', 'Streak', 'Guild'].map(h => (
                        <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {overview.topUsers.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-600 text-sm">No data yet</td></tr>
                    ) : overview.topUsers.map((u, i) => (
                      <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <span className={`text-sm font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-600'}`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-white">{u.username}</td>
                        <td className="px-4 py-3 text-sm font-bold text-cyan-400">{u.completedLessons}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{u.xp.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-slate-400"><i className="fa-solid fa-fire text-orange-400 mr-1 text-xs"></i>{u.streak}d</td>
                        <td className="px-4 py-3 text-xs text-slate-500 uppercase tracking-wider">{u.guild}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent registrations */}
            <div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                Recent Wallet Registrations ({wallets.length} shown)
              </h2>
              <div className="rounded-2xl bg-surface border border-white/5 overflow-x-auto">
                <table className="w-full text-left min-w-[520px]">
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

        {/* ── Modules tab ──────────────────────────────────────────────────── */}
        {activeTab === 'modules' && (
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Module Engagement</h2>
            <div className="rounded-2xl bg-surface border border-white/5 overflow-x-auto">
              <table className="w-full text-left min-w-[560px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    {['Module', 'Lesson Starts', 'Completions', 'Drop-off'].map(h => (
                      <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {modules.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-600 text-sm">No event data yet — events are tracked after users complete lessons</td></tr>
                  ) : modules.map(m => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-white">{m.title}</p>
                        <p className="text-[9px] text-slate-600 font-mono">{m.id}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{m.starts.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-bold text-cyan-400">{m.completions.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${m.dropOff > 60 ? 'text-rose-400' : m.dropOff > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {m.starts > 0 ? `${m.dropOff}%` : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Live events tab ───────────────────────────────────────────────── */}
        {activeTab === 'events' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Recent Events <span className="text-slate-600 normal-case font-normal">(auto-refresh 60s)</span>
              </h2>
              <span className="text-[10px] text-slate-600">{events.length} shown</span>
            </div>
            <div className="rounded-2xl bg-surface border border-white/5 overflow-x-auto">
              <table className="w-full text-left min-w-[480px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    {['Event', 'Wallet', 'Data', 'When'].map(h => (
                      <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-600 text-sm">No events recorded yet</td></tr>
                  ) : events.map(ev => (
                    <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${EVENT_COLOR[ev.eventName] ?? 'text-slate-400'}`}>
                          {ev.eventName}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{truncateWallet(ev.walletAddress)}</td>
                      <td className="px-4 py-3 text-[10px] text-slate-600 font-mono max-w-[200px] truncate">
                        {ev.data ? JSON.stringify(ev.data) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{timeAgo(ev.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Users tab ────────────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">All Users</h2>
              <span className="text-[10px] text-slate-600">{users.length} total</span>
            </div>
            <div className="rounded-2xl bg-surface border border-white/5 overflow-x-auto">
              <table className="w-full text-left min-w-[560px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    {['Username', 'Lessons', 'XP', 'Guild', 'Last Seen'].map(h => (
                      <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-600 text-sm">No users yet</td></tr>
                  ) : users.map(u => (
                    <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-white">{u.username}</p>
                        <p className="font-mono text-[9px] text-slate-600">{u.uid.slice(0, 12)}…</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-cyan-400 font-bold">{(u.completedLessons ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{((u.completedLessons ?? 0) * 20).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 uppercase tracking-wider">{(u as any).guild ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{u.createdAt ? timeAgo(u.createdAt) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;
