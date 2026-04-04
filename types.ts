
export enum Difficulty {
  BASIC = 'BASIC',
  FUNDAMENTAL = 'FUNDAMENTAL',
  MID = 'MID',
  PRO = 'PRO'
}

export enum Language {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  ZH = 'zh'
}

export enum Guild {
  SENTINELS = 'SENTINELS',
  ARCHITECTS = 'ARCHITECTS',
  LIQUIDATORS = 'LIQUIDATORS',
  NONE = 'NONE'
}

export interface Peer {
  id: string;
  address: string;
  guild: Guild;
  status: 'online' | 'away' | 'offline';
  latency: number;
}

export interface P2PMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

export interface P2PTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  status: 'confirmed' | 'pending';
}

export interface FeedEvent {
  id: string;
  type: 'achievement' | 'transaction' | 'certification' | 'guild_join';
  user: string;
  guild: Guild;
  detail: string;
  timestamp: number;
}

export interface ProtocolNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'signal';
  timestamp: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  status: 'active' | 'passed' | 'failed';
  pathCost: number;
}

export interface MasteryMetrics {
  cryptography: number;
  defi: number;
  security: number;
  economics: number;
}

export interface Subtopic {
  id: string;
  title: string;
  content: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  estimatedMinutes: number;
  subtopics: Subtopic[];
  rewardTokens: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface EarnedCredential {
  id: string;
  earnedAt: number; // ms timestamp
  verificationHash: string;
  walletAddress?: string;
}

export interface UserProgress {
  completedSubtopics: string[];
  completedTopics: string[];
  tokenBalance: number;
  currentTopicId: string;
  currentSubtopicIndex: number;
  discoveredFactIds: string[];
  quizHistory?: { topicId: string; score: number; total: number }[];
  metrics: MasteryMetrics;
  onboarded: boolean;
  achievements: string[];
  language: Language;
  guild: Guild;
  votedProposalIds: string[];
  p2pTransactions: P2PTransaction[];
  p2pMessages: P2PMessage[];
  avatarUrl: string;
  bio: string;
  username: string;
  notifications: ProtocolNotification[];
  vantaRank: number;
  isPro: boolean;
  // Privacy & AI narrative fields
  isPrivate: boolean;
  aiSentinelAccess: boolean;
  walletAddress?: string;
  did?: string;
  ipfsWatchlistCid?: string;
  ipfsPortfolioCid?: string;
  // Gamification
  xp: number;
  streak: number;
  lastActiveDate: string; // 'YYYY-MM-DD'
  longestStreak: number;
  // Credentials
  earnedCredentialIds: string[];
  learningBannerDismissed?: boolean;
}

export interface Recommendation {
  title: string;
  rationale: string;
  targetTopicId: string;
  estimatedPathLength: string;
  specializationRole: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface DidYouKnow {
  id: string;
  fact: string;
  rarity: 'common' | 'rare' | 'legendary';
}
