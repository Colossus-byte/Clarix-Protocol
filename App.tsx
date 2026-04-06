
import React, { useState, useEffect, useMemo } from 'react';
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
import WalletConnectModal from './components/WalletConnectModal';
import { WalletState, watchWalletChanges, checkExistingConnection } from './services/walletService';
import { addDoc, collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import LevelCompletionCelebration from './components/LevelCompletionCelebration';
import LessonTutor from './components/LessonTutor';
import ActivityFeed from './components/ActivityFeed';
import GuildLeaderboard from './components/GuildLeaderboard';
import StreakBadge from './components/StreakBadge';
import AdminPage from './components/AdminPage';
import CredentialCelebration from './components/CredentialCelebration';
import VerifyPage from './components/VerifyPage';
import OnboardingTour, { TOUR_STORAGE_KEY } from './components/OnboardingTour';
import {
  captureRefParam, getPendingRef, clearPendingRef,
  ensureReferralCode, saveReferredBy,
  triggerReferralRewards, claimReferrerRewards,
} from './services/referralService';

const AppContent: React.FC = () => {
  const { t: tTerm, Term } = useTerminology();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { user, isAuthReady, progress: firebaseProgress, updateProgress } = useFirebase();
const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
const [walletState, setWalletState] = useState<WalletState | null>(null);

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

const connectWallet = () => {
  setIsWalletModalOpen(true);
};

const handleWalletConnected = (wallet: WalletState) => {
  const did = `did:ethr:${wallet.address}`;
  setWalletState(wallet);
  setProgress(p => ({
    ...p,
    walletAddress: wallet.address,
    did,
  }));
  registerWallet(wallet.address, progress.username);
  addNotification(
    'Wallet Connected',
    `${wallet.chainName} · ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
    'success'
  );
};

const handleWalletDisconnected = () => {
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

    // Claim any unclaimed referrer rewards (15 tokens per new conversion)
    if (progress.referralCode) {
      claimReferrerRewards(progress.referralCode).then(newCount => {
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
            `+${earned} $PATH — ${newCount} friend${newCount > 1 ? 's' : ''} completed their first lesson`,
            'success'
          );
        }
      }).catch(() => {});
    }
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps
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

    addNotification('Credential Earned!', `You've earned the "${def.name}" credential!`, 'success');

    if (showImmediately) {
      setCredentialCelebrationData({ def, earnedAt, verificationHash });
      setShowCredentialCelebration(true);
    } else {
      setPendingCredentialId(credentialId);
    }
  };

  const handleNext = () => {
    const isLastSubtopic = progress.currentSubtopicIndex === currentTopic.subtopics.length - 1;

    // Award XP + tokens + update streak for this lesson
    const XP_PER_LESSON = 20;
    const TOKENS_PER_LESSON = 3;
    setProgress(prev => {
      const streakUpdates = computeStreakUpdates(prev);
      const newXP = (prev.xp || 0) + XP_PER_LESSON;
      const newCompleted = [...new Set([...prev.completedSubtopics, currentSubtopic.id])];
      // Award 1 bonus token when streak increments (new day)
      const streakBonus = streakUpdates.streak > prev.streak ? 1 : 0;
      const newTokens = prev.tokenBalance + TOKENS_PER_LESSON + streakBonus;
      const updates = { ...streakUpdates, xp: newXP, completedSubtopics: newCompleted, tokenBalance: newTokens };
      writeLeaderboard(newXP);

      // Check streak credentials based on the NEW streak value
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

    writeActivityEvent(currentSubtopic.title, currentTopic.title);

    // Referral reward: fire when user completes their very first lesson
    const isFirstEverLesson = progress.completedSubtopics.length === 0;
    if (isFirstEverLesson && progress.referredBy) {
      // Award new user their 5-token welcome bonus
      if (!progress.referralRewardClaimed) {
        setProgress(p => ({ ...p, tokenBalance: p.tokenBalance + 5, referralRewardClaimed: true }));
        addNotification('Welcome Bonus', '+5 $PATH from your referral', 'success');
      }
      // Notify referrer (async, non-blocking)
      triggerReferralRewards(
        user?.uid ?? 'anon',
        progress.walletAddress,
        progress.referredBy,
      ).catch(() => {});
    }

    if (isLastSubtopic) {
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
      const currentIndex = TOPICS.findIndex(t => t.id === currentTopic.id);
      const nextTopic = TOPICS[currentIndex + 1];
      const newCompletedTopics = [...new Set([...progress.completedTopics, currentTopic.id])];
      const XP_LEVEL_BONUS = 50;
      const PERFECT_SCORE_BONUS = score === total ? 5 : 0;
      const newXP = (progress.xp || 0) + XP_LEVEL_BONUS;

      const updatedProgress = {
        ...progress,
        completedTopics: newCompletedTopics,
        tokenBalance: progress.tokenBalance + currentTopic.rewardTokens + PERFECT_SCORE_BONUS,
        currentTopicId: nextTopic?.id || progress.currentTopicId,
        currentSubtopicIndex: 0,
        vantaRank: progress.vantaRank + 1,
        xp: newXP,
      };

      setProgress(updatedProgress);
      writeLeaderboard(newXP);

      // Check if a credential is awarded for completing this level
      const credDef = CREDENTIAL_DEFS.find(c => c.levelTopicId === currentTopic.id);
      if (credDef && !(progress.earnedCredentialIds || []).includes(credDef.id)) {
        // Award it but show after the level celebration (queued)
        awardCredential(credDef.id, false);
      }

      const totalTokensEarned = currentTopic.rewardTokens + PERFECT_SCORE_BONUS;
      setCelebrationData({
        topicTitle: currentTopic.title,
        xpEarned: XP_LEVEL_BONUS,
        tokensEarned: totalTokensEarned,
        nextTopicTitle: nextTopic?.title,
      });
      setShowCelebration(true);

      const perfectMsg = PERFECT_SCORE_BONUS > 0 ? `  ·  +5 perfect score bonus` : '';
      addNotification('Level Complete!', `+${XP_LEVEL_BONUS} XP  ·  +${totalTokensEarned} $PATH tokens${perfectMsg}`, 'success');
      generateNewRecommendation(updatedProgress);
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

  const finishOnboarding = (username: string, avatarUrl: string, bio: string, role: string, guild: Guild) => {
    // Award 1 token for first login
    setProgress(p => ({ ...p, onboarded: true, username, avatarUrl, bio, guild, tokenBalance: p.tokenBalance + 1 }));
    setShowManifesto(true);
    // Show tour after manifesto for first-time users
    if (!localStorage.getItem(TOUR_STORAGE_KEY)) {
      setTimeout(() => setShowTour(true), 800);
    }
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
      onWalletConnect={(address) => {
        const did = `did:ethr:${address}`;
        registerWallet(address, 'Web3User');
        try {
          const saved = localStorage.getItem(`clarix_v1_state_${did}`);
          if (saved) {
            setProgress(JSON.parse(saved));
          } else {
            setProgress(p => ({
              ...p,
              onboarded: true,
              isPro: false,
              walletAddress: address,
              did,
              username: 'Web3User'
            }));
          }
        } catch {
          // corrupted localStorage — init fresh wallet session
          setProgress(p => ({
            ...p,
            onboarded: true,
            isPro: false,
            walletAddress: address,
            did,
            username: 'Web3User'
          }));
        }
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }}
    />;
  }

  const isLanding = currentPath === '/' || currentPath === '';

  if (isLanding && !progress.onboarded) {
    return (
      <div className="min-h-screen bg-surface flex flex-col relative">
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex items-center gap-4">
          <NewbieToggle />
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/signup');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-bold text-xs uppercase tracking-widest transition-all backdrop-blur-sm"
          >
            Launch App
          </button>
        </div>
        <ClarixHero />
        <MarketDemo />
      </div>
    );
  }

  if (!progress.onboarded) return <Onboarding onComplete={finishOnboarding} />;

  const t = UI_TRANSLATIONS[progress.language] || UI_TRANSLATIONS[Language.EN];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-void text-slate-200 relative">
      <WalletConnectModal
  isOpen={isWalletModalOpen}
  onClose={() => setIsWalletModalOpen(false)}
  onConnected={handleWalletConnected}
/>

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

      <main className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
        <header className="h-14 md:h-16 border-b border-white/[0.04] flex items-center justify-between px-4 md:px-8 bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-bars text-sm"></i>
            </button>

            <div onClick={() => setActiveView('profile')} className="flex items-center gap-2.5 cursor-pointer group">
              <div className={`w-8 h-8 rounded-full overflow-hidden ring-1 transition-all duration-300 ${progress.isPrivate ? 'ring-indigo-500/50 blur-sm' : 'ring-white/10 group-hover:ring-indigo-500/40'}`}>
                <img src={progress.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors leading-none">
                  {progress.isPrivate ? 'Anonymous' : progress.username}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {progress.did && (
                    <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                      <i className="fa-solid fa-circle-check text-[8px]"></i> Verified
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
          {activeView === 'academy' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
              <div className="lg:col-span-12 space-y-12">
                <WalletSummaryCard address={progress.walletAddress} onConnect={connectWallet} />
                {!isQuizMode && (recommendation || isGeneratingRecommendation) && (
                  <NeuralRoadmap 
                    recommendation={recommendation} 
                    onNavigate={(id) => setProgress(p => ({ ...p, currentTopicId: id, currentSubtopicIndex: 0 }))} 
                    isLoading={isGeneratingRecommendation}
                  />
                )}
                {!isQuizMode && <ClarixAtlas progress={progress} onSelectTopic={(id) => setProgress(p => ({ ...p, currentTopicId: id, currentSubtopicIndex: 0 }))} />}
              </div>
              
              <div className="lg:col-span-8">
                {isQuizMode ? (
                  <Quiz questions={quizQuestions} onComplete={handleQuizComplete} onCancel={() => setIsQuizMode(false)} />
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-2 mb-6 md:mb-8">
                      <span className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.07] rounded-md text-[11px] font-medium text-slate-400">
                        {currentTopic.difficulty}
                      </span>
                      <span className="text-[11px] font-medium text-indigo-400">{currentTopic.category}</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-bold text-white mb-8 md:mb-12 tracking-tighter leading-none">{currentSubtopic.title}</h1>

                    <div className="mb-8 md:mb-10"><RichContent content={currentSubtopic.content} /></div>

                    {/* AI Tutor */}
                    <LessonTutor lessonTitle={currentSubtopic.title} lessonContent={currentSubtopic.content} />

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 py-8 md:py-12 border-t border-white/5 mt-10">
                      <AudioNarrator text={currentSubtopic.content} language={progress.language} />
                      <button
                        onClick={handleNext}
                        disabled={isGeneratingQuiz}
                        className="w-full sm:w-auto px-8 md:px-12 py-3.5 md:py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                      >
                        {isGeneratingQuiz ? (
                          <><i className="fa-solid fa-circle-notch fa-spin"></i> Generating Quiz...</>
                        ) : progress.currentSubtopicIndex === currentTopic.subtopics.length - 1 ? (
                          'Take the Quiz'
                        ) : (
                          'Next Lesson'
                        )}
                        {!isGeneratingQuiz && <i className="fa-solid fa-chevron-right text-[8px] md:text-[10px]"></i>}
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
          {activeView === 'profile' && <ProfileView progress={progress} onUpdate={(u) => setProgress(p => ({ ...p, ...u }))} onReplayTour={() => { localStorage.removeItem(TOUR_STORAGE_KEY); setShowTour(true); }} />}
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
        className={`fixed right-5 md:right-6 bottom-5 md:bottom-8 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 z-[50] shadow-lg ${
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

      <OnboardingTour
        isVisible={showTour}
        onComplete={() => setShowTour(false)}
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
