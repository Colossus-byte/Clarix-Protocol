
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import AIAssistant from './components/AIAssistant';
import Quiz from './components/Quiz';
import VideoGenerator from './components/VideoGenerator';
import NewsPulse from './components/NewsPulse';
import AudioNarrator from './components/AudioNarrator';
import ProtocolLab from './components/ProtocolLab';
import AuditLab from './components/AuditLab';
import RichContent from './components/RichContent';
import SkillSpider from './components/SkillSpider';
import MarketIntelligence from './components/MarketIntelligence';
import Onboarding from './components/Onboarding';
import PortfolioTracker from './components/PortfolioTracker';
import CertificationHub from './components/CertificationHub';
import GuildHub from './components/GuildHub';
import GovernanceForum from './components/GovernanceForum';
import PeerNexus from './components/PeerNexus';
import ProfileView from './components/ProfileView';
import InstitutionalPortal from './components/InstitutionalPortal';
import NeuralRoadmap from './components/NeuralRoadmap';
import DeFiSimulator from './components/DeFiSimulator';
import NetworkCongestion from './components/NetworkCongestion';
import NotificationSystem from './components/NotificationSystem';
import Manifesto from './components/Manifesto';
import ZkPrivacyCloak from './components/ZkPrivacyCloak';
import AiSentimentOracle from './components/AiSentimentOracle';
import ClarixAtlas from './components/ClarixAtlas';
import ClarixHero from './components/ClarixHero';
import InvestorsPage from './components/InvestorsPage';
import MarketDemo from './components/MarketDemo';
import SignupPage from './components/SignupPage';
import WalletSummaryCard from './components/WalletSummaryCard';
import CrossChainPortfolio from './components/CrossChainPortfolio';
import { NewbieModeProvider } from './contexts/NewbieModeContext';
import NewbieToggle from './components/NewbieToggle';
import LearningModeBanner from './components/LearningModeBanner';
import { useTerminology } from './hooks/useTerminology';
import { TOPICS, UI_TRANSLATIONS, DEFAULT_AVATARS, PROPOSALS, CREDENTIAL_DEFS, CredentialDef } from './constants';
import { UserProgress, QuizQuestion, Language, Guild, P2PMessage, P2PTransaction, ProtocolNotification, Recommendation } from './types';
import { generateQuiz, generatePathRecommendation } from './services/claudeService';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import { WalletState, watchWalletChanges, checkExistingConnection, connectWalletConnect } from './services/walletService';
import { addDoc, collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import LevelCompletionCelebration from './components/LevelCompletionCelebration';
import LessonTutor from './components/LessonTutor';
import ActivityFeed from './components/ActivityFeed';
import GuildLeaderboard from './components/GuildLeaderboard';
import StreakBadge from './components/StreakBadge';
import AdminPage from './components/AdminPage';
import CredentialCelebration from './components/CredentialCelebration';
import VerifyPage from './components/VerifyPage';
import OnboardingTour, { TOUR_STORAGE_KEY, TourButton } from './components/OnboardingTour';
import IncentiveBanner from './components/IncentiveBanner';
import {
  captureRefParam, getPendingRef, clearPendingRef,
  ensureReferralCode, saveReferredBy,
  triggerReferralRewards, claimReferrerRewards,
  generateReferralCode, walletToRefCode,
} from './services/referralService';
import { trackEvent, setAnalyticsWallet } from './services/analyticsService';

// ── Landing page with auto-triggered tour for first-time visitors ─────────────
const LandingWithTour: React.FC = () => {
  const [showLandingTour, setShowLandingTour] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(TOUR_STORAGE_KEY)) return;
    const t = setTimeout(() => {
      trackEvent('onboarding_started');
      setShowLandingTour(true);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  const goToSignup = () => {
    window.history.pushState({}, '', '/signup');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex items-center gap-4">
        <NewbieToggle />
        <button
          onClick={goToSignup}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-bold text-xs uppercase tracking-widest transition-all backdrop-blur-sm"
        >
          Launch App
        </button>
      </div>
      <ClarixHero />
      <div data-tour="market-overview">
        <MarketDemo />
      </div>
      <TourButton onClick={() => setShowLandingTour(true)} />
      <OnboardingTour
        isVisible={showLandingTour}
        onComplete={() => setShowLandingTour(false)}
        onSkip={(step) => { trackEvent('onboarding_skipped', { stepNumber: step }); setShowLandingTour(false); }}
      />
    </div>
  );
};

// Default progress factory — used when creating a brand-new Firestore profile
function makeDefaultProgress(displayName?: string | null, photoURL?: string | null): UserProgress {
  return {
    completedSubtopics: [],
    completedTopics: [],
    tokenBalance: 0,
    currentTopicId: 'b1',
    currentSubtopicIndex: 0,
    discoveredFactIds: [],
    quizHistory: [],
    onboarded: false,
    achievements: [],
    metrics: { cryptography: 5, defi: 0, security: 0, economics: 10 },
    language: Language.EN,
    guild: Guild.NONE,
    votedProposalIds: [],
    p2pTransactions: [],
    p2pMessages: [],
    username: displayName || 'Learner',
    bio: '',
    avatarUrl: photoURL || DEFAULT_AVATARS[0],
    notifications: [],
    vantaRank: 1,
    isPro: false,
    isPrivate: false,
    aiSentinelAccess: true,
    xp: 0,
    streak: 0,
    lastActiveDate: '',
    longestStreak: 0,
    earnedCredentialIds: [],
  };
}

const AppContent: React.FC = () => {
  const { t: tTerm, Term } = useTerminology();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { user, isAuthReady, progress: firebaseProgress, updateProgress } = useFirebase();
  const [walletState, setWalletState] = useState<WalletState | null>(null);

  // Refs for mobile scroll
  const lessonAreaRef = useRef<HTMLDivElement>(null);
  const atlasRef = useRef<HTMLDivElement>(null);
  const [mobileAtlasVisible, setMobileAtlasVisible] = useState(true);

  // Lesson integrity state
  const [lessonTimerSec, setLessonTimerSec] = useState(60);
  const [lessonTimerDone, setLessonTimerDone] = useState(false);
  const [lessonMiniQuiz, setLessonMiniQuiz] = useState<QuizQuestion | null>(null);
  const [lessonMiniQuizSelected, setLessonMiniQuizSelected] = useState<number | null>(null);
  const [lessonMiniQuizAnswered, setLessonMiniQuizAnswered] = useState(false);
  const [isGeneratingMiniQuiz, setIsGeneratingMiniQuiz] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Capture ?ref= from URL on first load
  useEffect(() => { captureRefParam(); }, []);

  const [localProgress, setLocalProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('clarix_v1_state');
      if (saved) return JSON.parse(saved);
    } catch {
      // corrupted localStorage — start fresh
    }
    return {
      completedSubtopics: [],
      completedTopics: [],
      tokenBalance: 0,
      currentTopicId: 'b1',
      currentSubtopicIndex: 0,
      discoveredFactIds: [],
      quizHistory: [],
      onboarded: false,
      achievements: [],
      metrics: { cryptography: 5, defi: 0, security: 0, economics: 10 },
      language: Language.EN,
      guild: Guild.NONE,
      votedProposalIds: [],
      p2pTransactions: [],
      p2pMessages: [],
      username: 'UnknownEntity',
      bio: '',
      avatarUrl: DEFAULT_AVATARS[0],
      notifications: [],
      vantaRank: 1,
      isPro: false,
      isPrivate: false,
      aiSentinelAccess: true,
      xp: 0,
      streak: 0,
      lastActiveDate: '',
      longestStreak: 0,
      earnedCredentialIds: [],
    };
  });

  const progress = (user && firebaseProgress) ? firebaseProgress : localProgress;

  const setProgress = (updater: Partial<UserProgress> | ((prev: UserProgress) => UserProgress)) => {
    if (user) {
      const baseProgress = firebaseProgress || localProgress;
      const newProgress = typeof updater === 'function' ? updater(baseProgress) : { ...baseProgress, ...updater };
      updateProgress(newProgress);
    } else {
      setLocalProgress(prev => {
        const newProgress = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
        return newProgress;
      });
    }
  };

  const addNotification = (title: string, message: string, type: ProtocolNotification['type'] = 'info') => {
    const newNotif: ProtocolNotification = {
      id: crypto.randomUUID(),
      title,
      message,
      type,
      timestamp: Date.now()
    };
    setProgress(p => ({ ...p, notifications: [newNotif, ...p.notifications] }));
  };

  const dismissNotification = (id: string) => {
    setProgress(p => ({ ...p, notifications: p.notifications.filter(n => n.id !== id) }));
  };

const connectWallet = async () => {
  try {
    const wallet = await connectWalletConnect();
    handleWalletConnected(wallet);
  } catch {
    // user cancelled or modal error — no-op
  }
};

const handleWalletConnected = (wallet: WalletState) => {
  const did = `did:ethr:${wallet.address}`;
  setWalletState(wallet);
  setAnalyticsWallet(wallet.address);

  // Generate a referral code for wallet-only users (Firebase users get one via ensureReferralCode)
  const referralCode = !user && !progress.referralCode
    ? generateReferralCode(wallet.address)
    : progress.referralCode;

  // Check if this user arrived via a referral link
  const pendingRef = getPendingRef();
  const isNewReferral = !!pendingRef && !progress.referredBy && !progress.referralRewardClaimed;

  setProgress(p => ({
    ...p,
    walletAddress: wallet.address,
    did,
    ...(referralCode && !p.referralCode ? { referralCode } : {}),
    ...(isNewReferral ? {
      referredBy: pendingRef!,
      tokenBalance: p.tokenBalance + 5,
      referralRewardClaimed: true,
    } : {}),
  }));

  if (isNewReferral && pendingRef) {
    clearPendingRef();
    addNotification('Welcome Bonus', '+5 $PATH — joined via referral link!', 'success');
    // pendingRef is the referrer's short code (e.g. "0xa1778c") captured from the URL.
    // Store it as referrerCode so the referrer's claimReferrerRewards() query matches.
    triggerReferralRewards(
      `wallet_${wallet.address.toLowerCase()}`,
      wallet.address,
      pendingRef, // already the short wallet code from captureRefParam
    ).catch(() => {});
  }

  registerWallet(wallet.address, progress.username);
  trackEvent('wallet_connected', { chainName: wallet.chainName });
  addNotification(
    'Wallet Connected',
    `${wallet.chainName} · ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
    'success'
  );
};

const handleWalletDisconnected = () => {
  trackEvent('wallet_disconnected');
  setAnalyticsWallet(undefined);
  setWalletState(null);
  setProgress(p => ({ ...p, walletAddress: undefined, did: undefined }));
  addNotification('Wallet Disconnected', 'Your wallet has been disconnected.', 'info');
};
  
  const [activeView, setActiveView] = useState<'academy' | 'certification' | 'institutional' | 'guilds' | 'governance' | 'peers' | 'profile' | 'market' | 'portfolio'>('academy');
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isGeneratingRecommendation, setIsGeneratingRecommendation] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ topicTitle: string; xpEarned: number; tokensEarned: number; nextTopicTitle?: string } | null>(null);
  const [showCredentialCelebration, setShowCredentialCelebration] = useState(false);
  const [credentialCelebrationData, setCredentialCelebrationData] = useState<{
    def: CredentialDef; earnedAt: number; verificationHash: string;
  } | null>(null);
  // Credential queued to show AFTER the level celebration dismisses
  const [pendingCredentialId, setPendingCredentialId] = useState<string | null>(null);
  // Onboarding tour
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const storageKey = progress.did ? `clarix_v1_state_${progress.did}` : 'clarix_v1_state';
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress]);

  // Reset atlas to visible whenever user navigates away from academy
  useEffect(() => {
    setMobileAtlasVisible(true);
  }, [activeView]);

  // Referral: when a Firebase user is authenticated, ensure they have a referral
  // code and check for unclaimed referrer rewards.
  useEffect(() => {
    if (!user) return;
    const identifier = progress.walletAddress || user.uid;

    // Ensure this user has a referral code stored in Firestore
    ensureReferralCode(user.uid, identifier).then(code => {
      if (code && code !== progress.referralCode) {
        setProgress(p => ({ ...p, referralCode: code }));
      }
    }).catch(() => {});

    // Save referredBy if we have a pending ref from the URL
    const pendingRef = getPendingRef();
    if (pendingRef && !progress.referredBy) {
      saveReferredBy(user.uid, pendingRef).then(() => {
        setProgress(p => ({ ...p, referredBy: pendingRef }));
        clearPendingRef();
      }).catch(() => {});
    }

    // Claim any unclaimed referrer rewards (15 tokens per new conversion).
    // Use the short wallet code (preferred, matches the link format) or CLX code as fallback.
    const claimCode = progress.walletAddress
      ? walletToRefCode(progress.walletAddress)
      : progress.referralCode;
    if (claimCode) {
      claimReferrerRewards(claimCode).then(newCount => {
        if (newCount > 0) {
          const earned = newCount * 15;
          setProgress(p => ({
            ...p,
            tokenBalance: p.tokenBalance + earned,
            referralCount: (p.referralCount ?? 0) + newCount,
            referralTokensEarned: (p.referralTokensEarned ?? 0) + earned,
          }));
          addNotification(
            'Referral Reward',
            `+${earned} $PATH — ${newCount} friend${newCount > 1 ? 's' : ''} joined via your link`,
            'success'
          );
        }
      }).catch(() => {});
    }
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Claim referrer rewards for wallet-only users (Firebase users handled above)
  useEffect(() => {
    if (user) return; // Firebase users have their own effect
    if (!progress.walletAddress) return;
    // Use the same short code format as the referral link so the query matches
    const walletCode = walletToRefCode(progress.walletAddress);
    claimReferrerRewards(walletCode).then(newCount => {
      if (newCount > 0) {
        const earned = newCount * 15;
        setProgress(p => ({
          ...p,
          tokenBalance: p.tokenBalance + earned,
          referralCount: (p.referralCount ?? 0) + newCount,
          referralTokensEarned: (p.referralTokensEarned ?? 0) + earned,
        }));
        addNotification(
          'Referral Reward',
          `+${earned} $PATH — ${newCount} friend${newCount > 1 ? 's' : ''} joined via your link`,
          'success'
        );
      }
    }).catch(() => {});
  }, [progress.walletAddress, user]); // eslint-disable-line react-hooks/exhaustive-deps

useEffect(() => {
  // Auto-detect if user already has MetaMask connected
  checkExistingConnection().then(address => {
    if (address && !progress.walletAddress) {
      // Silently restore connection
      setProgress(p => ({
        ...p,
        walletAddress: address,
        did: `did:ethr:${address}`,
      }));
    }
  });

  // Watch for MetaMask account/chain changes
  const cleanup = watchWalletChanges(
    (newAddress) => {
      setProgress(p => ({ ...p, walletAddress: newAddress, did: `did:ethr:${newAddress}` }));
      addNotification('Account Changed', `Switched to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`, 'info');
    },
    (newChainId) => {
      addNotification('Network Changed', `Switched to chain ${newChainId}`, 'info');
    },
    handleWalletDisconnected
  );

  return cleanup;
}, []);

  const currentTopic = useMemo(() =>
    TOPICS.find(t => t.id === progress.currentTopicId) || TOPICS[0]
  , [progress.currentTopicId]);

  const currentSubtopic = currentTopic.subtopics[progress.currentSubtopicIndex];

  // ── Lesson started tracking ───────────────────────────────────────────────
  const lastTrackedLessonRef = useRef<string>('');
  useEffect(() => {
    if (!progress.onboarded) return;
    const lessonKey = `${progress.currentTopicId}::${progress.currentSubtopicIndex}`;
    if (lastTrackedLessonRef.current === lessonKey) return;
    lastTrackedLessonRef.current = lessonKey;
    if (!progress.completedSubtopics.includes(currentSubtopic?.id ?? '')) {
      trackEvent('lesson_started', { moduleId: currentTopic.id, lessonId: currentSubtopic.id });
    }
  }, [progress.currentTopicId, progress.currentSubtopicIndex, progress.onboarded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Lesson integrity: reset timer/quiz when lesson changes ────────────────
  useEffect(() => {
    if (!progress.onboarded) return;
    // Skip timer for already-completed lessons
    if (progress.completedSubtopics.includes(currentSubtopic?.id ?? '')) {
      setLessonTimerDone(true);
      setLessonMiniQuizAnswered(true);
      return;
    }
    setLessonTimerSec(60);
    setLessonTimerDone(false);
    setLessonMiniQuiz(null);
    setLessonMiniQuizSelected(null);
    setLessonMiniQuizAnswered(false);
    setIsGeneratingMiniQuiz(false);
  }, [progress.currentTopicId, progress.currentSubtopicIndex, progress.onboarded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (lessonTimerDone || !progress.onboarded || isQuizMode) return;
    if (lessonTimerSec <= 0) { setLessonTimerDone(true); return; }
    const t = setTimeout(() => setLessonTimerSec(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [lessonTimerSec, lessonTimerDone, progress.onboarded, isQuizMode]);

  // ── Generate mini-quiz when timer expires ─────────────────────────────────
  useEffect(() => {
    if (!lessonTimerDone || lessonMiniQuiz || lessonMiniQuizAnswered || isGeneratingMiniQuiz) return;
    if (!currentSubtopic) { setLessonMiniQuizAnswered(true); return; }
    setIsGeneratingMiniQuiz(true);
    generateQuiz(currentSubtopic.content, progress.language)
      .then(qs => {
        setIsGeneratingMiniQuiz(false);
        if (qs.length > 0) setLessonMiniQuiz(qs[0]);
        else setLessonMiniQuizAnswered(true);
      })
      .catch(() => {
        setIsGeneratingMiniQuiz(false);
        setLessonMiniQuizAnswered(true);
      });
  }, [lessonTimerDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMiniQuizSelect = (idx: number) => {
    if (lessonMiniQuizAnswered) return;
    setLessonMiniQuizSelected(idx);
    setLessonMiniQuizAnswered(true);
  };

  // ── Gamification helpers ──────────────────────────────────────────────────
  const computeStreakUpdates = (base: UserProgress) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
    const last = base.lastActiveDate || '';
    let newStreak = base.streak || 0;
    if (last !== today) {
      newStreak = last === yesterday ? newStreak + 1 : 1;
    }
    return {
      streak: newStreak,
      lastActiveDate: today,
      longestStreak: Math.max(base.longestStreak || 0, newStreak),
    };
  };

  const writeActivityEvent = async (lessonTitle: string, topicTitle: string) => {
    try {
      const rawId = progress.walletAddress || progress.username || 'Learner';
      const displayId = progress.walletAddress
        ? `${progress.walletAddress.slice(0, 6)}...${progress.walletAddress.slice(-4)}`
        : `${rawId.slice(0, 8)}`;
      console.log('[App] WRITE → activity_feed (addDoc)', { displayId, lessonTitle, topicTitle });
      await addDoc(collection(db, 'activity_feed'), {
        displayId,
        lessonTitle,
        topicTitle,
        timestamp: serverTimestamp(),
      });
      console.log('[App] WRITE ✓ activity_feed success');
    } catch (e) {
      console.error('[App] WRITE ✗ activity_feed failed', e);
    }
  };

  const writeLeaderboard = async (newXP: number) => {
    if (!user) {
      console.log('[App] writeLeaderboard skipped — no authenticated user');
      return;
    }
    try {
      console.log(`[App] WRITE → leaderboard/${user.uid}`, { username: progress.username, xp: newXP });
      await setDoc(doc(db, 'leaderboard', user.uid), {
        username: progress.username,
        xp: newXP,
        guild: progress.guild,
        streak: progress.streak,
        completedLessons: progress.completedSubtopics.length,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      console.log(`[App] WRITE ✓ leaderboard/${user.uid} success`);
    } catch (e) {
      console.error(`[App] WRITE ✗ leaderboard/${user.uid} failed`, e);
    }
  };

  const registerWallet = async (address: string, username: string) => {
    try {
      const docRef = doc(db, 'wallet_registrations', address.toLowerCase());
      console.log(`[App] WRITE → wallet_registrations/${address.toLowerCase()} (checking first)`);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        console.log(`[App] WRITE → wallet_registrations/${address.toLowerCase()} (new entry)`);
        await setDoc(docRef, {
          address: address.toLowerCase(),
          connectedAt: serverTimestamp(),
          username,
        });
        console.log(`[App] WRITE ✓ wallet_registrations/${address.toLowerCase()} success`);
      } else {
        console.log(`[App] wallet_registrations/${address.toLowerCase()} already exists — skipped`);
      }
    } catch (e) {
      console.error(`[App] WRITE ✗ wallet_registrations failed`, e);
    }
  };

  const awardCredential = async (credentialId: string, showImmediately = true) => {
    // Don't re-award
    if ((progress.earnedCredentialIds || []).includes(credentialId)) return;
    const def = CREDENTIAL_DEFS.find(c => c.id === credentialId);
    if (!def) return;

    const earnedAt = Date.now();
    let verificationHash = 'unverified';
    try {
      const raw = `${progress.walletAddress || user?.uid || 'anon'}-${credentialId}-${earnedAt}`;
      const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
      verificationHash = Array.from(new Uint8Array(hashBuf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 32);
    } catch { /* crypto not available */ }

    // Update local progress immediately (award 25 tokens per credential)
    setProgress(p => ({
      ...p,
      earnedCredentialIds: [...(p.earnedCredentialIds || []), credentialId],
      tokenBalance: p.tokenBalance + 25,
    }));

    // Write to Firestore user subcollection
    if (user) {
      try {
        console.log(`[App] WRITE → users/${user.uid}/credentials/${credentialId}`);
        await setDoc(doc(db, 'users', user.uid, 'credentials', credentialId), {
          id: credentialId,
          earnedAt,
          verificationHash,
          walletAddress: progress.walletAddress ?? null,
          username: progress.username,
          credentialName: def.name,
        });
        console.log(`[App] WRITE ✓ users/${user.uid}/credentials/${credentialId} success`);
      } catch (e) {
        console.error(`[App] WRITE ✗ users/${user.uid}/credentials/${credentialId} failed`, e);
      }
    } else {
      console.warn(`[App] Credential "${credentialId}" earned but no authenticated user — Firestore write skipped`);
    }

    // Write to public_credentials for verification page
    if (progress.walletAddress) {
      const pubDocId = `${progress.walletAddress.toLowerCase()}_${credentialId}`;
      try {
        console.log(`[App] WRITE → public_credentials/${pubDocId}`);
        await setDoc(
          doc(db, 'public_credentials', pubDocId),
          {
            walletAddress: progress.walletAddress.toLowerCase(),
            credentialName: def.name,
            username: progress.username,
            earnedAt,
            verificationHash,
            uid: user?.uid ?? null,
          }
        );
        console.log(`[App] WRITE ✓ public_credentials/${pubDocId} success`);
      } catch (e) {
        console.error(`[App] WRITE ✗ public_credentials/${pubDocId} failed`, e);
      }
    }

    trackEvent('credential_earned', { credentialType: credentialId });
    trackEvent('token_earned', { amount: 25, reason: 'credential_earned' });
    addNotification('Credential Earned!', `You've earned the "${def.name}" credential!`, 'success');

    if (showImmediately) {
      setCredentialCelebrationData({ def, earnedAt, verificationHash });
      setShowCredentialCelebration(true);
    } else {
      setPendingCredentialId(credentialId);
    }
  };

  const handleNext = () => {
    if (progress.onboardingSkipped) {
      addNotification('Complete Setup First', 'Finish your profile to save progress and earn XP.', 'info');
      return;
    }
    // Lesson integrity guard — must have read (timer done) and answered quiz
    if (!lessonTimerDone || !lessonMiniQuizAnswered) return;
    const isLastSubtopic = progress.currentSubtopicIndex === currentTopic.subtopics.length - 1;
    // Prevent re-farming: check completion state before awarding
    const alreadyCompleted = progress.completedSubtopics.includes(currentSubtopic.id);
    const alreadyCompletedTopic = progress.completedTopics.includes(currentTopic.id);

    if (!alreadyCompleted) {
      trackEvent('lesson_completed', { moduleId: currentTopic.id, lessonId: currentSubtopic.id });
    }

    const XP_PER_LESSON = 20;
    const TOKENS_PER_LESSON = 3;
    setProgress(prev => {
      const alreadyDone = prev.completedSubtopics.includes(currentSubtopic.id);
      const newCompleted = [...new Set([...prev.completedSubtopics, currentSubtopic.id])];

      // Already completed — navigate forward without awarding anything
      if (alreadyDone) {
        return isLastSubtopic
          ? { ...prev, completedSubtopics: newCompleted }
          : { ...prev, completedSubtopics: newCompleted, currentSubtopicIndex: prev.currentSubtopicIndex + 1 };
      }

      // First completion — award XP, tokens, streak
      const streakUpdates = computeStreakUpdates(prev);
      const newXP = (prev.xp || 0) + XP_PER_LESSON;
      const streakBonus = streakUpdates.streak > prev.streak ? 1 : 0;
      const newTokens = prev.tokenBalance + TOKENS_PER_LESSON + streakBonus;
      const updates = { ...streakUpdates, xp: newXP, completedSubtopics: newCompleted, tokenBalance: newTokens };
      writeLeaderboard(newXP);
      trackEvent('token_earned', { amount: TOKENS_PER_LESSON + streakBonus, reason: 'lesson_completed' });

      const newStreak = streakUpdates.streak;
      const earned = prev.earnedCredentialIds || [];
      if (newStreak >= 7 && !earned.includes('streak-7')) {
        setTimeout(() => awardCredential('streak-7'), 500);
      } else if (newStreak >= 30 && !earned.includes('streak-30')) {
        setTimeout(() => awardCredential('streak-30'), 500);
      }

      return isLastSubtopic
        ? { ...prev, ...updates }
        : { ...prev, ...updates, currentSubtopicIndex: prev.currentSubtopicIndex + 1 };
    });

    if (!alreadyCompleted) {
      writeActivityEvent(currentSubtopic.title, currentTopic.title);
    }

    // Referral reward on first-ever lesson only
    const isFirstEverLesson = progress.completedSubtopics.length === 0;
    if (!alreadyCompleted && isFirstEverLesson && progress.referredBy && !progress.referralRewardClaimed) {
      setProgress(p => ({ ...p, tokenBalance: p.tokenBalance + 5, referralRewardClaimed: true }));
      addNotification('Welcome Bonus', '+5 $PATH from your referral', 'success');
      triggerReferralRewards(
        user?.uid ?? `wallet_${progress.walletAddress?.toLowerCase() ?? 'anon'}`,
        progress.walletAddress,
        progress.referredBy,
      ).catch(() => {});
    }

    // Only trigger topic quiz if the topic hasn't already been completed
    if (isLastSubtopic && !alreadyCompletedTopic) {
      handleStartQuiz();
    }
  };

  const handleStartQuiz = async () => {
    setIsGeneratingQuiz(true);
    const questions = await generateQuiz(currentTopic.subtopics.map(s => s.content).join(' '), progress.language);
    setQuizQuestions(questions);
    setIsQuizMode(true);
    setIsGeneratingQuiz(false);
  };

  const handleQuizComplete = (score: number, total: number) => {
    if (score >= total * 0.7) {
      trackEvent('quiz_passed', { moduleId: currentTopic.id, score, total });
      const alreadyCompletedTopic = progress.completedTopics.includes(currentTopic.id);
      const currentIndex = TOPICS.findIndex(t => t.id === currentTopic.id);
      const nextTopic = TOPICS[currentIndex + 1];
      const newCompletedTopics = [...new Set([...progress.completedTopics, currentTopic.id])];
      // Only award XP/tokens on first completion
      const XP_LEVEL_BONUS = alreadyCompletedTopic ? 0 : 50;
      const PERFECT_SCORE_BONUS = (!alreadyCompletedTopic && score === total) ? 5 : 0;
      const tokenReward = alreadyCompletedTopic ? 0 : (currentTopic.rewardTokens + PERFECT_SCORE_BONUS);
      const newXP = (progress.xp || 0) + XP_LEVEL_BONUS;

      const updatedProgress = {
        ...progress,
        completedTopics: newCompletedTopics,
        tokenBalance: progress.tokenBalance + tokenReward,
        currentTopicId: nextTopic?.id || progress.currentTopicId,
        currentSubtopicIndex: 0,
        vantaRank: alreadyCompletedTopic ? progress.vantaRank : progress.vantaRank + 1,
        xp: newXP,
      };

      setProgress(updatedProgress);

      if (!alreadyCompletedTopic) {
        writeLeaderboard(newXP);
        trackEvent('module_completed', { moduleId: currentTopic.id });
        trackEvent('token_earned', { amount: tokenReward, reason: 'module_completed' });

        const credDef = CREDENTIAL_DEFS.find(c => c.levelTopicId === currentTopic.id);
        if (credDef && !(progress.earnedCredentialIds || []).includes(credDef.id)) {
          awardCredential(credDef.id, false);
        }

        setCelebrationData({
          topicTitle: currentTopic.title,
          xpEarned: XP_LEVEL_BONUS,
          tokensEarned: tokenReward,
          nextTopicTitle: nextTopic?.title,
        });
        setShowCelebration(true);

        const perfectMsg = PERFECT_SCORE_BONUS > 0 ? `  ·  +5 perfect score bonus` : '';
        addNotification('Level Complete!', `+${XP_LEVEL_BONUS} XP  ·  +${tokenReward} $PATH tokens${perfectMsg}`, 'success');
        generateNewRecommendation(updatedProgress);
      }
    } else {
      trackEvent('quiz_failed', { moduleId: currentTopic.id, score, total });
    }
    setIsQuizMode(false);
  };

  const generateNewRecommendation = async (currentProgress: UserProgress) => {
    setIsGeneratingRecommendation(true);
    try {
      const rec = await generatePathRecommendation(currentProgress);
      setRecommendation(rec);
    } catch (error) {
      console.error("Failed to generate recommendation:", error);
    } finally {
      setIsGeneratingRecommendation(false);
    }
  };

  const finishOnboarding = (username: string, guild: Guild) => {
    trackEvent('onboarding_completed', { guild });
    setProgress(p => ({ ...p, onboarded: true, onboardingSkipped: false, username, guild, xp: (p.xp || 0) + 50, tokenBalance: p.tokenBalance + 1 }));
    addNotification('Setup Complete!', '+50 XP · +1 $PATH · Credentials unlocked!', 'success');
    setShowManifesto(true);
    if (!localStorage.getItem(TOUR_STORAGE_KEY)) {
      setTimeout(() => setShowTour(true), 800);
    }
  };

  const handleSkipOnboarding = () => {
    trackEvent('onboarding_skipped', { reason: 'user_skipped' });
    setProgress(p => ({ ...p, onboarded: true, onboardingSkipped: true }));
  };

  const togglePrivacy = () => {
    setProgress(p => {
      const newState = !p.isPrivate;
      addNotification('ZK-Shield Update', newState ? 'Privacy Cloaking Active' : 'Identity De-masked', 'info');
      return { ...p, isPrivate: newState };
    });
  };


  if (currentPath === '/investors') {
    return <InvestorsPage />;
  }

  if (currentPath === '/admin') {
    return <AdminPage />;
  }

  if (currentPath.startsWith('/verify/')) {
    const parts = currentPath.split('/').filter(Boolean);
    // parts: ['verify', walletAddress, credentialSlug]
    const walletAddr = parts[1] ?? '';
    const credSlug = parts[2] ?? '';
    return <VerifyPage walletAddress={walletAddr} credentialSlug={credSlug} />;
  }

  if (currentPath === '/signup') {
    return <SignupPage
      onConnected={(wallet) => {
        handleWalletConnected(wallet);
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }}
    />;
  }

  const isLanding = currentPath === '/' || currentPath === '';

  if (isLanding && !progress.onboarded) {
    return (
      <LandingWithTour />
    );
  }

  if (!progress.onboarded) return <Onboarding onComplete={finishOnboarding} onRemindLater={handleSkipOnboarding} />;

  const t = UI_TRANSLATIONS[progress.language] || UI_TRANSLATIONS[Language.EN];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-void text-slate-200 relative" style={{ maxWidth: '100vw' }}>

      {showManifesto && <Manifesto onClose={() => setShowManifesto(false)} />}

      {celebrationData && (
        <LevelCompletionCelebration
          isVisible={showCelebration}
          topicTitle={celebrationData.topicTitle}
          xpEarned={celebrationData.xpEarned}
          tokensEarned={celebrationData.tokensEarned}
          nextTopicTitle={celebrationData.nextTopicTitle}
          onDismiss={() => {
            setShowCelebration(false);
            // After level celebration, show queued credential celebration if any
            if (pendingCredentialId) {
              const def = CREDENTIAL_DEFS.find(c => c.id === pendingCredentialId);
              if (def) {
                setTimeout(() => {
                  setCredentialCelebrationData({
                    def,
                    earnedAt: Date.now(),
                    verificationHash: '—',
                  });
                  setShowCredentialCelebration(true);
                  setPendingCredentialId(null);
                }, 400);
              } else {
                setPendingCredentialId(null);
              }
            }
          }}
        />
      )}

      <CredentialCelebration
        isVisible={showCredentialCelebration}
        credentialDef={credentialCelebrationData?.def ?? null}
        username={progress.username}
        walletAddress={progress.walletAddress}
        earnedAt={credentialCelebrationData?.earnedAt ?? Date.now()}
        verificationHash={credentialCelebrationData?.verificationHash ?? ''}
        onDismiss={() => {
          setShowCredentialCelebration(false);
          setCredentialCelebrationData(null);
        }}
      />
      
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>

      <div className={`fixed inset-y-0 left-0 z-[60] transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          progress={progress} 
          onSelectTopic={(id) => {
            setProgress(p => ({ ...p, currentTopicId: id, currentSubtopicIndex: 0 }));
            setIsSidebarOpen(false);
            if (window.innerWidth < 1024) setMobileAtlasVisible(false);
          }}
          onSelectView={(v) => {
            setActiveView(v as any);
            setIsSidebarOpen(false);
          }}
          onLanguageChange={(l) => setProgress(p => ({ ...p, language: l }))}
          activeTopicId={currentTopic.id}
          activeView={activeView}
        />
      </div>

      <NotificationSystem notifications={progress.notifications} onDismiss={dismissNotification} />

      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar relative flex flex-col">
        <header className="h-14 md:h-16 border-b border-white/[0.04] flex items-center justify-between px-4 md:px-8 bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-bars text-sm"></i>
            </button>

            <div onClick={() => setActiveView('profile')} className="flex items-center gap-2.5 cursor-pointer group">
              <div className={`w-8 h-8 rounded-full overflow-hidden ring-1 transition-all duration-300 flex items-center justify-center bg-indigo-500/20 text-indigo-300 font-bold text-sm ${progress.isPrivate ? 'ring-indigo-500/50 blur-sm' : 'ring-white/10 group-hover:ring-indigo-500/40'}`}>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <img src={progress.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors leading-none">
                  {progress.isPrivate ? 'Anonymous' : (progress.username || user?.displayName || user?.email?.split('@')[0] || 'Learner')}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {user && (
                    <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                      <i className={`fa-solid ${user.providerData[0]?.providerId === 'google.com' ? 'fa-g' : 'fa-envelope'} text-[8px]`}></i>
                      {user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'}
                    </span>
                  )}
                  {progress.walletAddress && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {progress.walletAddress.slice(0, 6)}…{progress.walletAddress.slice(-4)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:block h-5 w-px bg-white/[0.06]"></div>
            <button
              onClick={() => setShowManifesto(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] text-xs text-slate-500 hover:text-slate-300 hover:border-white/10 transition-all"
            >
              <i className="fa-solid fa-scroll text-[10px]"></i>
              Manifesto
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:block">
              <NewbieToggle />
            </div>
            <div className="hidden md:block">
              <StreakBadge streak={progress.streak || 0} lastActiveDate={progress.lastActiveDate || ''} xp={progress.xp || 0} />
            </div>
            <div data-tour="token-balance" className="flex items-center gap-1.5 md:gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
              <i className="fa-solid fa-coins text-indigo-400 text-xs"></i>
              <span className="text-sm font-semibold text-white">{progress.tokenBalance.toLocaleString()}</span>
              <span className="text-[10px] text-indigo-400/70 font-medium">$PATH</span>
            </div>
          </div>
        </header>


        <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-12 py-6 md:py-16">
          {progress.onboardingSkipped && (
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 pr-10 mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <i className="fa-solid fa-circle-exclamation text-amber-400 text-lg shrink-0 hidden sm:block"></i>
              <div className="flex-1 min-w-0">
                {progress.walletAddress ? (
                  <>
                    <p className="text-sm font-bold text-white">You're 2 steps from 50 XP — complete your profile</p>
                    <p className="text-xs text-slate-400 mt-0.5">Finish setup to save progress, earn XP, and unlock your Clarix Credential.</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-white">Connect wallet to save progress and earn XP</p>
                    <p className="text-xs text-slate-400 mt-0.5">You're previewing in guest mode. Connect a wallet to keep your progress.</p>
                  </>
                )}
              </div>
              {progress.walletAddress ? (
                <button
                  onClick={() => setProgress(p => ({ ...p, onboarded: false, onboardingSkipped: false }))}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shrink-0 self-start sm:self-auto"
                >
                  Complete Profile
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shrink-0 self-start sm:self-auto"
                >
                  Connect Wallet
                </button>
              )}
              <button
                onClick={() => setProgress(p => ({ ...p, onboardingSkipped: false }))}
                className="absolute top-3 right-3 w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
          )}
          {activeView === 'academy' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
              {/* Top panel: hidden on mobile when lesson is in focus so lesson fills screen */}
              <div className={`lg:col-span-12 space-y-12 ${!mobileAtlasVisible ? 'hidden lg:block' : ''}`}>
                <WalletSummaryCard address={progress.walletAddress} onConnect={connectWallet} />
                <IncentiveBanner
                  uid={user?.uid}
                  walletAddress={progress.walletAddress}
                  completedSubtopics={progress.completedSubtopics}
                  onStartLesson={() => {
                    // Scroll the lesson content into view
                    document.querySelector('.animate-in')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                />
                {!isQuizMode && (recommendation || isGeneratingRecommendation) && (
                  <NeuralRoadmap
                    recommendation={recommendation}
                    onNavigate={(id) => {
                      setProgress(p => ({ ...p, currentTopicId: id, currentSubtopicIndex: 0 }));
                      if (window.innerWidth < 1024) setMobileAtlasVisible(false);
                    }}
                    isLoading={isGeneratingRecommendation}
                  />
                )}
                {!isQuizMode && (
                  <div ref={atlasRef} className={mobileAtlasVisible ? '' : 'hidden lg:block'}>
                    <ClarixAtlas
                      progress={progress}
                      onSelectTopic={(id) => {
                        setProgress(p => ({ ...p, currentTopicId: id, currentSubtopicIndex: 0 }));
                        if (window.innerWidth < 1024) {
                          setMobileAtlasVisible(false);
                        }
                      }}
                      isGuest={!!progress.onboardingSkipped}
                    />
                  </div>
                )}
              </div>
              
              <div ref={lessonAreaRef} className="lg:col-span-8">
                {isQuizMode ? (
                  <Quiz questions={quizQuestions} onComplete={handleQuizComplete} onCancel={() => setIsQuizMode(false)} />
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Mobile back-to-map button */}
                    <button
                      className="lg:hidden mb-4 flex items-center gap-2 text-slate-500 text-sm hover:text-white transition-colors"
                      onClick={() => {
                        setMobileAtlasVisible(true);
                        setTimeout(() => atlasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                      }}
                    >
                      <i className="fa-solid fa-arrow-left text-xs"></i> Back to modules
                    </button>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.07] rounded-md text-[11px] font-medium text-slate-400">
                        {currentTopic.difficulty}
                      </span>
                      <span className="text-[11px] font-medium text-indigo-400">{currentTopic.category}</span>
                    </div>

                    {/* Lesson progress indicator with lock icons */}
                    <div className="flex items-center gap-1.5 mb-6 md:mb-8 flex-wrap">
                      {currentTopic.subtopics.map((s, i) => {
                        const isDone = progress.completedSubtopics.includes(s.id);
                        const isCurr = i === progress.currentSubtopicIndex;
                        return (
                          <div
                            key={s.id}
                            title={s.title}
                            className={`flex items-center justify-center w-7 h-7 rounded-full text-[9px] font-bold border transition-all ${
                              isDone ? 'bg-cyber-lime/20 border-cyber-lime/50 text-cyber-lime' :
                              isCurr ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-400' :
                                       'bg-white/5 border-white/10 text-slate-600'
                            }`}
                          >
                            {isDone ? <i className="fa-solid fa-check text-[8px]"></i> :
                             !isCurr ? <i className="fa-solid fa-lock text-[8px]"></i> : i + 1}
                          </div>
                        );
                      })}
                      <span className="text-[10px] text-slate-600 ml-1">
                        Lesson {progress.currentSubtopicIndex + 1} of {currentTopic.subtopics.length}
                      </span>
                    </div>

                    <h1 className="text-3xl md:text-7xl font-bold text-white mb-8 md:mb-12 tracking-tighter leading-none">{currentSubtopic.title}</h1>

                    <div className="mb-8 md:mb-10"><RichContent content={currentSubtopic.content} /></div>

                    {/* AI Tutor */}
                    <LessonTutor lessonTitle={currentSubtopic.title} lessonContent={currentSubtopic.content} />

                    {/* Lesson mini-quiz (appears after 60s timer) */}
                    {lessonTimerDone && !lessonMiniQuizAnswered && isGeneratingMiniQuiz && (
                      <div className="mt-6 p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex items-center gap-3">
                        <i className="fa-solid fa-circle-notch fa-spin text-indigo-400"></i>
                        <p className="text-sm text-slate-400">Preparing your quick check…</p>
                      </div>
                    )}
                    {lessonTimerDone && lessonMiniQuiz && (
                      <div className="mt-6 p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">
                          <i className="fa-solid fa-brain text-[8px] mr-1"></i> Quick Check — answer to continue
                        </p>
                        <p className="text-sm font-semibold text-white mb-4 leading-relaxed">{lessonMiniQuiz.question}</p>
                        <div className="space-y-2">
                          {lessonMiniQuiz.options.map((opt, i) => {
                            const isSelected = lessonMiniQuizSelected === i;
                            const isCorrect = i === lessonMiniQuiz.correctAnswerIndex;
                            const answered = lessonMiniQuizAnswered;
                            let cls = 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 cursor-pointer';
                            if (answered) {
                              cls = isCorrect
                                ? 'border-cyber-lime/60 bg-cyber-lime/10 text-cyber-lime cursor-default'
                                : isSelected
                                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-400 cursor-default'
                                  : 'opacity-30 border-white/5 text-slate-600 cursor-default';
                            }
                            return (
                              <button
                                key={i}
                                onClick={() => handleMiniQuizSelect(i)}
                                disabled={answered}
                                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center justify-between gap-3 ${cls}`}
                              >
                                <span>{opt}</span>
                                {answered && isCorrect && <i className="fa-solid fa-circle-check text-cyber-lime shrink-0 text-sm"></i>}
                                {answered && isSelected && !isCorrect && <i className="fa-solid fa-circle-xmark text-rose-400 shrink-0 text-sm"></i>}
                              </button>
                            );
                          })}
                        </div>
                        {lessonMiniQuizAnswered && (
                          <p className="text-xs text-slate-400 mt-3 leading-relaxed">{lessonMiniQuiz.explanation}</p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-8 md:py-12 border-t border-white/5 mt-10">
                      <AudioNarrator text={currentSubtopic.content} language={progress.language} />
                      <button
                        onClick={handleNext}
                        disabled={isGeneratingQuiz || !lessonTimerDone || !lessonMiniQuizAnswered}
                        className="w-full sm:w-auto px-8 md:px-12 py-3.5 md:py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                      >
                        {isGeneratingQuiz ? (
                          <><i className="fa-solid fa-circle-notch fa-spin"></i> Generating Quiz…</>
                        ) : !lessonTimerDone ? (
                          <><i className="fa-solid fa-clock text-xs"></i> Continue in {lessonTimerSec}s</>
                        ) : !lessonMiniQuizAnswered ? (
                          isGeneratingMiniQuiz ? 'Loading question…' : 'Answer question to continue'
                        ) : progress.currentSubtopicIndex === currentTopic.subtopics.length - 1 ? (
                          <>Take the Quiz <i className="fa-solid fa-chevron-right text-[8px]"></i></>
                        ) : (
                          <>Next Lesson <i className="fa-solid fa-chevron-right text-[8px] md:text-[10px]"></i></>
                        )}
                      </button>
                    </div>

                    {currentTopic.id === 'f1' && <NetworkCongestion />}
                    {currentTopic.id === 'm1' && <DeFiSimulator />}
                    {currentTopic.id === 'p1' && <AuditLab />}
                    <ProtocolLab />
                    <NewsPulse topicTitle={currentTopic.title} language={progress.language} />
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 space-y-8 md:space-y-10 lg:sticky lg:top-36 h-fit">
                {!isQuizMode && (
                  <>
                    {/* Mobile streak badge */}
                    <div className="md:hidden">
                      <StreakBadge streak={progress.streak || 0} lastActiveDate={progress.lastActiveDate || ''} xp={progress.xp || 0} />
                    </div>
                    <ActivityFeed />
                    <GuildLeaderboard progress={progress} />
                    <ZkPrivacyCloak isActive={progress.isPrivate} onToggle={togglePrivacy} />
                    <AiSentimentOracle
                      userRole={progress.guild !== 'NONE' ? progress.guild : 'Investor'}
                      completedTopics={progress.completedTopics}
                    />
                    <PortfolioTracker progress={progress} onUpdate={(u) => setProgress(p => ({ ...p, ...u }))} />
                    <SkillSpider metrics={progress.metrics} />
                  </>
                )}
              </div>
            </div>
          )}

          {activeView === 'market' && (
            <MarketDemo progress={progress} onUpdate={(u) => setProgress(p => ({ ...p, ...u }))} />
          )}
          {activeView === 'portfolio' && (
            <CrossChainPortfolio
              walletAddress={progress.walletAddress}
              onConnectWallet={connectWallet}
              onFirstAnalysis={() => awardCredential('portfolio-analyst')}
              completedTopics={progress.completedTopics}
              username={progress.username}
            />
          )}
          {activeView === 'peers' && <PeerNexus progress={progress} onSendMessage={() => {}} onSendTokens={() => {}} />}
          {activeView === 'institutional' && (
            <InstitutionalPortal />
          )}
          {activeView === 'guilds' && <GuildHub progress={progress} onJoinGuild={(g) => setProgress(p => ({ ...p, guild: g }))} />}
          {activeView === 'governance' && (
            <GovernanceForum
              progress={progress}
              onVote={(proposalId, _support) => {
                const isFirstVote = progress.votedProposalIds.length === 0;
                const proposal = PROPOSALS.find(p => p.id === proposalId);
                const cost = proposal?.pathCost ?? 100;
                setProgress(p => ({
                  ...p,
                  votedProposalIds: [...p.votedProposalIds, proposalId],
                  tokenBalance: Math.max(0, p.tokenBalance - cost),
                }));
                if (isFirstVote) awardCredential('governance-pioneer');
              }}
            />
          )}
          {activeView === 'certification' && <CertificationHub progress={progress} />}
          {activeView === 'profile' && <ProfileView progress={progress} onUpdate={(u) => setProgress(p => ({ ...p, ...u }))} onReplayTour={() => { localStorage.removeItem(TOUR_STORAGE_KEY); setShowTour(true); }} onConnectWallet={connectWallet} />}
        </div>

        {/* IPFS Footer Badge */}
        <div className="w-full py-4 flex justify-center items-center border-t border-white/5 bg-black/20 mt-auto shrink-0">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <i className="fa-solid fa-cube text-blue-500 text-[10px]"></i>
            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Powered by IPFS · Decentralized Storage
            </span>
          </div>
        </div>
      </main>

      <div
        onClick={() => setIsAiOpen(!isAiOpen)}
        className={`fixed right-5 md:right-6 bottom-5 md:bottom-8 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 z-[8001] shadow-lg ${
          isAiOpen ? 'bg-white/10 text-white border border-white/20 scale-95' : 'bg-indigo-500 text-white shadow-indigo-500/30 hover:bg-indigo-400 hover:scale-105'
        }`}
      >
        <i className={`fa-solid ${isAiOpen ? 'fa-xmark' : 'fa-brain-circuit'} text-lg md:text-xl`}></i>
      </div>

      <AIAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        currentContext={currentSubtopic.content}
        language={progress.language}
        holdingsSummary={
          progress.walletAddress
            ? `Wallet: ${progress.walletAddress.slice(0, 6)}...${progress.walletAddress.slice(-4)} (connect to Portfolio tab to see balances)`
            : 'No portfolio connected'
        }
        credentialLevel={
          (progress.earnedCredentialIds || []).includes('protocol-architect') ? 'Level 4 — Protocol Architect' :
          (progress.earnedCredentialIds || []).includes('defi-practitioner') ? 'Level 3 — DeFi Practitioner' :
          (progress.earnedCredentialIds || []).includes('market-navigator') ? 'Level 2 — Market Navigator' :
          (progress.earnedCredentialIds || []).includes('crypto-foundations') ? 'Level 1 — Crypto Foundations' :
          'Beginner (no credentials yet)'
        }
        topCoinsSummary={undefined}
      />

      <TourButton onClick={() => { localStorage.removeItem(TOUR_STORAGE_KEY); setShowTour(true); }} />

      <OnboardingTour
        isVisible={showTour}
        onComplete={() => setShowTour(false)}
        onSkip={(step) => trackEvent('onboarding_skipped', { stepNumber: step })}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FirebaseProvider>
      <NewbieModeProvider>
        <AppContent />
        <LearningModeBanner />
      </NewbieModeProvider>
    </FirebaseProvider>
  );
};

export default App;
