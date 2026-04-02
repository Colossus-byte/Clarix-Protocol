// services/claudeService.ts
// Clarix — Claude API Service (replaces geminiService.ts)
// All AI features are now powered by Claude claude-sonnet-4-20250514

import { QuizQuestion, UserProgress, Recommendation, Language } from '../types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

// ─── Core fetch helper ────────────────────────────────────────────────────────
async function callClaude(systemPrompt: string, userMessage: string, maxTokens = 1000): Promise<string> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_CLAUDE_API_KEY is not set. Add it to your .env.local file.');
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Claude API error ${response.status}: ${errorData?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((block: any) => block.type === 'text');
  return textBlock?.text || '';
}

// ─── Strip JSON fences helper ─────────────────────────────────────────────────
function stripJsonFences(text: string): string {
  return text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}

// ─── 1. Quiz Generation ───────────────────────────────────────────────────────
export async function generateQuiz(
  topicContent: string,
  language: Language = Language.EN
): Promise<QuizQuestion[]> {
  const langLabel = language === Language.EN ? 'English' : language === Language.ES ? 'Spanish' : language === Language.FR ? 'French' : 'Chinese';

  const system = `You are a crypto education expert for Clarix, an AI-powered crypto intelligence platform.
Generate quiz questions that test genuine understanding, not just memory.
Respond ONLY with valid JSON. No markdown, no explanation, no preamble.`;

  const user = `Generate 5 multiple-choice quiz questions in ${langLabel} based on this crypto content:

"${topicContent.slice(0, 2000)}"

Return a JSON array with exactly this structure:
[
  {
    "question": "Clear question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Brief explanation of why this answer is correct"
  }
]

Rules:
- Questions should test understanding, not trivia
- Make wrong answers plausible, not obviously wrong
- Explanations should teach, not just confirm
- Keep questions concise and clear`;

  try {
    const raw = await callClaude(system, user, 1500);
    const parsed = JSON.parse(stripJsonFences(raw));
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    throw new Error('Invalid quiz format');
  } catch (err) {
    console.error('Quiz generation failed:', err);
    // Fallback questions so the app never breaks
    return [
      {
        question: 'What is blockchain technology primarily used for?',
        options: ['Secure, transparent record-keeping', 'Video streaming', 'Email encryption', 'Social networking'],
        correctAnswerIndex: 0,
        explanation: 'Blockchain is a distributed ledger that records transactions securely and transparently across many nodes.',
      },
      {
        question: 'What does DeFi stand for?',
        options: ['Decentralized Finance', 'Digital Finance', 'Distributed Framework', 'Defense Finance'],
        correctAnswerIndex: 0,
        explanation: 'DeFi (Decentralized Finance) refers to financial services built on blockchain networks without central intermediaries.',
      },
    ];
  }
}

// ─── 2. Path Recommendation ───────────────────────────────────────────────────
export async function generatePathRecommendation(progress: UserProgress): Promise<Recommendation> {
  const system = `You are Clarix's AI learning advisor. You analyze user progress in crypto education and recommend personalized learning paths.
Respond ONLY with valid JSON. No markdown, no explanation.`;

  const user = `Analyze this user's crypto learning progress and recommend their next learning path:

User stats:
- Completed topics: ${progress.completedTopics.join(', ') || 'None yet'}
- Token balance: ${progress.tokenBalance} $PATH
- Mastery metrics: Cryptography ${progress.metrics.cryptography}%, DeFi ${progress.metrics.defi}%, Security ${progress.metrics.security}%, Economics ${progress.metrics.economics}%
- Rank: ${progress.vantaRank}
- Guild: ${progress.guild}
- Is Pro: ${progress.isPro}

Return exactly this JSON structure:
{
  "title": "Personalized recommendation title (max 8 words)",
  "rationale": "Why this path suits them (2-3 sentences, motivating and specific)",
  "targetTopicId": "One of: b1, b2, b3, f1, f2, m1, m2, p1, p2",
  "estimatedPathLength": "e.g. 2-3 hours",
  "specializationRole": "One of: DeFi Strategist, Security Auditor, Crypto Economist, Protocol Architect"
}`;

  try {
    const raw = await callClaude(system, user, 600);
    const parsed = JSON.parse(stripJsonFences(raw));
    if (parsed.title && parsed.rationale) return parsed;
    throw new Error('Invalid recommendation format');
  } catch (err) {
    console.error('Recommendation generation failed:', err);
    return {
      title: 'Start Your DeFi Mastery Path',
      rationale: 'Based on your profile, diving into DeFi protocols will accelerate your understanding of how decentralized finance reshapes traditional banking. This path aligns with high-growth opportunities in the African crypto ecosystem.',
      targetTopicId: 'f1',
      estimatedPathLength: '3-4 hours',
      specializationRole: 'DeFi Strategist',
    };
  }
}

// ─── 3. AI Assistant Chat ─────────────────────────────────────────────────────
export async function generateAIResponse(
  userMessage: string,
  contextContent: string,
  language: Language = Language.EN,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  const langLabel = language === Language.EN ? 'English' : language === Language.ES ? 'Spanish' : language === Language.FR ? 'French' : 'Chinese';

  const system = `You are Clarix AI, an expert crypto intelligence assistant built into the Clarix platform — Africa's leading crypto education and portfolio intelligence app.

Your personality: Sharp, knowledgeable, encouraging. You simplify complex crypto concepts without dumbing them down. You're aware of the African crypto context (mobile money, financial inclusion, local exchanges like Binance P2P).

Current learning context the user is studying:
"${contextContent.slice(0, 1000)}"

Always respond in ${langLabel}.
Keep responses focused and practical — max 3 paragraphs unless asked for more detail.
Use concrete examples. Reference real protocols, tokens, and market dynamics when relevant.`;

  // Build conversation history for multi-turn
  const messages = [
    ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user' as const, content: userMessage },
  ];

  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  if (!apiKey) throw new Error('VITE_CLAUDE_API_KEY not set');

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system,
      messages,
    }),
  });

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
  const data = await response.json();
  const textBlock = data.content?.find((block: any) => block.type === 'text');
  return textBlock?.text || 'I encountered an issue. Please try again.';
}

// ─── 4. AI Sentiment Oracle ───────────────────────────────────────────────────
export interface SentimentAnalysis {
  overallSentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Volatile';
  sentimentScore: number; // 0-100
  signals: {
    asset: string;
    signal: 'Buy' | 'Hold' | 'Watch' | 'Caution';
    rationale: string;
    confidence: number; // 0-100
  }[];
  marketNarrative: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  africanMarketNote: string;
}

export async function generateSentimentAnalysis(
  userRole: string = 'Investor',
  completedTopics: string[] = []
): Promise<SentimentAnalysis> {
  const system = `You are Clarix's AI Sentiment Oracle — an expert crypto market analyst.
You provide actionable market intelligence, with specific awareness of African crypto markets (mobile money integration, local exchange liquidity, regulatory landscape in Kenya, Nigeria, South Africa).
Respond ONLY with valid JSON. No markdown, no preamble.`;

  const today = new Date().toISOString().split('T')[0];

  const user = `Generate a current crypto market sentiment analysis for a ${userRole} user as of ${today}.
The user has studied: ${completedTopics.join(', ') || 'just getting started'}.

Return this exact JSON:
{
  "overallSentiment": "Bullish|Bearish|Neutral|Volatile",
  "sentimentScore": 0-100,
  "signals": [
    {
      "asset": "Asset name (e.g. Bitcoin, Ethereum, USDC)",
      "signal": "Buy|Hold|Watch|Caution",
      "rationale": "1-2 sentence rationale",
      "confidence": 0-100
    }
  ],
  "marketNarrative": "2-3 sentence current market narrative",
  "riskLevel": "Low|Medium|High|Extreme",
  "africanMarketNote": "1-2 sentences specific to African crypto users (liquidity, mobile money, local context)"
}

Include 3-4 assets in signals. Base analysis on realistic current market conditions.`;

  try {
    const raw = await callClaude(system, user, 800);
    const parsed = JSON.parse(stripJsonFences(raw));
    if (parsed.overallSentiment && parsed.signals) return parsed;
    throw new Error('Invalid sentiment format');
  } catch (err) {
    console.error('Sentiment analysis failed:', err);
    return {
      overallSentiment: 'Neutral',
      sentimentScore: 50,
      signals: [
        { asset: 'Bitcoin', signal: 'Hold', rationale: 'Consolidating near key support levels. Monitor macro conditions.', confidence: 65 },
        { asset: 'Ethereum', signal: 'Watch', rationale: 'DeFi activity recovering. Key resistance ahead.', confidence: 58 },
        { asset: 'USDC', signal: 'Hold', rationale: 'Stable asset for risk-off positioning in volatile conditions.', confidence: 90 },
      ],
      marketNarrative: 'Markets are in a period of consolidation as macro uncertainty persists. On-chain data shows accumulation by long-term holders.',
      riskLevel: 'Medium',
      africanMarketNote: 'Binance P2P volumes remain strong in KES and NGN. Consider stablecoin positions to hedge against local currency volatility.',
    };
  }
}

// ─── 5. Neural Feed — Personalized Crypto Insights ───────────────────────────
export interface NeuralFeedItem {
  id: string;
  title: string;
  summary: string;
  category: 'DeFi' | 'Security' | 'Market' | 'Education' | 'Africa';
  relevanceScore: number;
  actionable: string;
}

export async function generateNeuralFeed(
  userRole: string,
  completedTopics: string[],
  guild: string
): Promise<NeuralFeedItem[]> {
  const system = `You are Clarix's Neural Feed generator. You create personalized, actionable crypto intelligence cards for users.
Respond ONLY with valid JSON. No markdown, no preamble.`;

  const user = `Generate 4 personalized crypto intelligence feed items for:
- User role: ${userRole}
- Completed learning: ${completedTopics.join(', ') || 'beginner'}
- Guild: ${guild}

Return a JSON array:
[
  {
    "id": "unique-id-1",
    "title": "Compelling headline (max 10 words)",
    "summary": "2-3 sentence insight that is genuinely useful",
    "category": "DeFi|Security|Market|Education|Africa",
    "relevanceScore": 0-100,
    "actionable": "One specific action the user can take right now"
  }
]

Make items genuinely insightful and specific. Not generic crypto news summaries.`;

  try {
    const raw = await callClaude(system, user, 1000);
    const parsed = JSON.parse(stripJsonFences(raw));
    if (Array.isArray(parsed)) return parsed;
    throw new Error('Invalid feed format');
  } catch (err) {
    console.error('Neural feed generation failed:', err);
    return [
      {
        id: 'feed-1',
        title: 'DeFi Yield Opportunities Shifting to L2s',
        summary: 'Liquidity is migrating from Ethereum mainnet to Arbitrum and Base as gas costs remain high. Yield opportunities on established protocols are increasingly found on Layer 2 networks.',
        category: 'DeFi',
        relevanceScore: 85,
        actionable: 'Explore Aave V3 on Arbitrum for stablecoin yield with lower fees.',
      },
      {
        id: 'feed-2',
        title: 'Africa Crypto Regulation Update: Kenya',
        summary: 'Kenya\'s Capital Markets Authority continues developing a regulatory framework for digital assets. Operating within compliant exchanges reduces long-term risk for African crypto users.',
        category: 'Africa',
        relevanceScore: 92,
        actionable: 'Ensure your exchange accounts are KYC-verified ahead of incoming regulation.',
      },
    ];
  }
}

// ─── 6. Smart Contract Audit Summary ─────────────────────────────────────────
export async function generateAuditSummary(contractCode: string): Promise<string> {
  const system = `You are a smart contract security expert on the Clarix platform.
Analyze smart contract code and provide a clear, educational security assessment.
Be specific about vulnerabilities but explain them in terms a learner can understand.`;

  const user = `Analyze this smart contract for security issues and provide an educational summary:

\`\`\`solidity
${contractCode.slice(0, 3000)}
\`\`\`

Provide:
1. Overall risk rating (Low/Medium/High/Critical)
2. Top 3 findings (if any)
3. What a developer should fix first
4. Educational note about the most important security concept this code demonstrates

Keep it practical and educational.`;

  try {
    return await callClaude(system, user, 800);
  } catch (err) {
    return 'Audit service temporarily unavailable. Please try again shortly.';
  }
}
