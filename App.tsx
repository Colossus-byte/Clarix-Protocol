
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
import ProFeatureWrapper from './components/ProFeatureWrapper';
import InvestorsPage from './components/InvestorsPage';
import MarketDemo from './components/MarketDemo';
import SignupPage from './components/SignupPage';
import WalletSummaryCard from './components/WalletSummaryCard';
import CrossChainPortfolio from './components/CrossChainPortfolio';
import { NewbieModeProvider } from './contexts/NewbieModeContext';
import NewbieToggle from './components/NewbieToggle';
import LearningModeBanner from './components/LearningModeBanner';
import { useTerminology } from './hooks/useTerminology';
import { TOPICS, UI_TRANSLATIONS, DEFAULT_AVATARS } from './constants';
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

  useEffect(() => {
    const storageKey = progress.did ? `clarix_v1_state_${progress.did}` : 'clarix_v1_state';
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress]);
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
      await addDoc(collection(db, 'activity_feed'), {
        displayId,
        lessonTitle,
        topicTitle,
        timestamp: serverTimestamp(),
      });
    } catch { /* non-critical */ }
  };

  const writeLeaderboard = async (newXP: number) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'leaderboard', user.uid), {
        username: progress.username,
        xp: newXP,
        guild: progress.guild,
        streak: progress.streak,
        completedLessons: progress.completedSubtopics.length,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch { /* non-critical */ }
  };

  const registerWallet = async (address: string, username: string) => {
    try {
      const docRef = doc(db, 'wallet_registrations', address.toLowerCase());
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          address: address.toLowerCase(),
          connectedAt: serverTimestamp(),
          username,
        });
      }
    } catch { /* non-critical */ }
  };

  const handleNext = () => {
    const isLastSubtopic = progress.currentSubtopicIndex === currentTopic.subtopics.length - 1;

    // Award XP + update streak for this lesson
    const XP_PER_LESSON = 50;
    setProgress(prev => {
      const streakUpdates = computeStreakUpdates(prev);
      const newXP = (prev.xp || 0) + XP_PER_LESSON;
      const newCompleted = [...new Set([...prev.completedSubtopics, currentSubtopic.id])];
      const updates = { ...streakUpdates, xp: newXP, completedSubtopics: newCompleted };
      writeLeaderboard(newXP);
      return isLastSubtopic
        ? { ...prev, ...updates }
        : { ...prev, ...updates, currentSubtopicIndex: prev.currentSubtopicIndex + 1 };
    });

    writeActivityEvent(currentSubtopic.title, currentTopic.title);

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
      const XP_LEVEL_BONUS = 200;
      const newXP = (progress.xp || 0) + XP_LEVEL_BONUS;

      const updatedProgress = {
        ...progress,
        completedTopics: newCompletedTopics,
        tokenBalance: progress.tokenBalance + currentTopic.rewardTokens,
        currentTopicId: nextTopic?.id || progress.currentTopicId,
        currentSubtopicIndex: 0,
        vantaRank: progress.vantaRank + 1,
        xp: newXP,
      };

      setProgress(updatedProgress);
      writeLeaderboard(newXP);

      // Trigger celebration overlay
      setCelebrationData({
        topicTitle: currentTopic.title,
        xpEarned: XP_LEVEL_BONUS,
        tokensEarned: currentTopic.rewardTokens,
        nextTopicTitle: nextTopic?.title,
      });
      setShowCelebration(true);

      addNotification('Level Complete!', `+${XP_LEVEL_BONUS} XP  ·  +${currentTopic.rewardTokens} $PATH tokens earned!`, 'success');
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
    setProgress(p => ({ ...p, onboarded: true, username, avatarUrl, bio, guild }));
    setShowManifesto(true);
  };

  const togglePrivacy = () => {
    setProgress(p => {
      const newState = !p.isPrivate;
      addNotification('ZK-Shield Update', newState ? 'Privacy Cloaking Active' : 'Identity De-masked', 'info');
      return { ...p, isPrivate: newState };
    });
  };

  const togglePro = () => {
    setProgress(p => {
      const newState = !p.isPro;
      addNotification('Institutional Calibration', newState ? 'Clarix Pro Activated' : 'Standard Node Active', 'success');
      return { ...p, isPro: newState };
    });
  };

  if (currentPath === '/investors') {
    return <InvestorsPage />;
  }

  if (currentPath === '/admin') {
    return <AdminPage />;
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
          onDismiss={() => setShowCelebration(false)}
        />
      )}
      
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
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <NotificationSystem notifications={progress.notifications} onDismiss={dismissNotification} />

      <main className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
        <header className="h-16 md:h-24 border-b border-white/5 flex items-center justify-between px-4 md:px-12 bg-black/40 backdrop-blur-xl sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-3 md:gap-12">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
            >
              <i className="fa-solid fa-bars-staggered text-sm"></i>
            </button>

            <div onClick={() => setActiveView('profile')} className="flex items-center gap-2 md:gap-4 cursor-pointer group">
              <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full border-2 overflow-hidden transition-all duration-500 ${progress.isPrivate ? 'border-electric-violet blur-sm' : 'border-cyber-lime/30 group-hover:border-cyber-lime'}`}>
                <img src={progress.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <p className="terminal-text text-[8px] md:text-[10px] uppercase tracking-widest mb-0.5 md:mb-1 opacity-50">Identity Proxy</p>
                <h2 className="text-white font-bold tracking-tighter text-xs md:text-sm uppercase group-hover:text-cyber-lime transition-colors flex items-center gap-2">
                  {progress.isPrivate ? 'ZK_ENTITY_ANON' : progress.username}
                  {progress.did && (
                    <span className="bg-cyber-lime/20 text-cyber-lime px-1.5 py-0.5 rounded text-[8px] tracking-widest border border-cyber-lime/30 flex items-center gap-1">
                      <i className="fa-solid fa-check-circle"></i> Verified User
                    </span>
                  )}
                </h2>
                {progress.walletAddress && (
                  <p className="text-blue-500 text-[10px] font-mono mt-0.5 bg-blue-500/10 px-1.5 py-0.5 rounded w-fit border border-blue-500/20">
                    {progress.walletAddress.slice(0, 6)}...{progress.walletAddress.slice(-4)}
                  </p>
                )}
              </div>
            </div>
            <div className="hidden md:block h-8 w-px bg-white/10"></div>
            <button 
              onClick={() => setShowManifesto(true)}
              className="hidden lg:block px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
            >
              Protocol Manifesto
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-end">
            <div className="hidden sm:block">
              <NewbieToggle />
            </div>
            <div className="hidden md:block">
              <StreakBadge streak={progress.streak || 0} lastActiveDate={progress.lastActiveDate || ''} xp={progress.xp || 0} />
            </div>
            <div className="flex items-center gap-2 md:gap-3 bg-white/5 px-3 md:px-5 py-1.5 md:py-2.5 rounded-full border border-white/10">
              <i className="fa-solid fa-coins text-cyber-lime text-[10px] md:text-sm"></i>
              <span className="text-xs md:text-base font-bold text-white tracking-tighter">{progress.tokenBalance.toLocaleString()} <span className="text-[7px] md:text-[10px] text-slate-500">$PATH</span></span>
            </div>
          </div>
        </header>

        {!progress.isPro && (
          <div className="w-full bg-[#0f172a] border-b border-hyper-gold/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-4 text-center z-30 relative shrink-0">
            <p className="text-sm text-slate-300">
              <span className="font-bold text-white">You're on the Free Plan.</span> Upgrade to Pro for full AI signals and advanced analytics.
            </p>
            <button 
              onClick={togglePro}
              className="px-4 py-1.5 rounded-full bg-hyper-gold hover:bg-amber-400 text-[#0f172a] font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0"
            >
              Upgrade Now
            </button>
          </div>
        )}

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
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                      <span className="px-2 md:px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {currentTopic.difficulty}
                      </span>
                      <span className="text-[8px] md:text-[10px] font-bold text-electric-violet uppercase tracking-[0.2em]">{currentTopic.category}</span>
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
                        className="w-full sm:w-auto px-8 md:px-16 py-4 md:py-6 bg-cyber-lime text-black font-black uppercase tracking-widest text-[10px] md:text-xs rounded-2xl md:rounded-3xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
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
                    <ProFeatureWrapper isPro={progress.isPro} featureName={tTerm("Neural Network Analytics")} onUpgrade={togglePro}>
                      <AiSentimentOracle
  userRole={progress.guild !== 'NONE' ? progress.guild : 'Investor'}
  completedTopics={progress.completedTopics}
/>
                    </ProFeatureWrapper>
                    <PortfolioTracker progress={progress} onUpdate={(u) => setProgress(p => ({ ...p, ...u }))} />
                    <SkillSpider metrics={progress.metrics} />
                  </>
                )}
              </div>
            </div>
          )}

          {activeView === 'market' && (
            <ProFeatureWrapper isPro={progress.isPro} featureName={tTerm("Market Intelligence Feed")} onUpgrade={togglePro}>
              <MarketDemo progress={progress} onUpdate={(u) => setProgress(p => ({ ...p, ...u }))} />
            </ProFeatureWrapper>
          )}
          {activeView === 'portfolio' && (
            <CrossChainPortfolio 
              walletAddress={progress.walletAddress} 
              onConnectWallet={connectWallet} 
            />
          )}
          {activeView === 'peers' && <PeerNexus progress={progress} onSendMessage={() => {}} onSendTokens={() => {}} />}
          {activeView === 'institutional' && (
            <ProFeatureWrapper isPro={progress.isPro} featureName="Institutional Portal" onUpgrade={togglePro}>
              <InstitutionalPortal isPro={true} onTogglePro={togglePro} />
            </ProFeatureWrapper>
          )}
          {activeView === 'guilds' && <GuildHub progress={progress} onJoinGuild={(g) => setProgress(p => ({ ...p, guild: g }))} />}
          {activeView === 'governance' && <GovernanceForum progress={progress} onVote={() => {}} />}
          {activeView === 'certification' && <CertificationHub progress={progress} />}
          {activeView === 'profile' && <ProfileView progress={progress} onUpdate={(u) => setProgress(p => ({ ...p, ...u }))} />}
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
        className={`fixed right-6 md:left-12 bottom-6 md:bottom-12 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-500 z-[50] ${
          isAiOpen ? 'bg-white text-black scale-90' : 'bg-electric-violet text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-110'
        }`}
      >
        <i className={`fa-solid ${isAiOpen ? 'fa-xmark' : 'fa-brain-circuit'} text-lg md:text-xl`}></i>
      </div>

      <AIAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} currentContext={currentSubtopic.content} language={progress.language} />
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
