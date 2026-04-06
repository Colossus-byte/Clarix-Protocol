// services/claudeService.ts
// Clarix — Claude API Service (replaces geminiService.ts)
// All AI features are now powered by Claude claude-sonnet-4-20250514

import { QuizQuestion, UserProgress, Recommendation, Language } from '../types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

// ─── Core fetch helper ────────────────────────────────────────────────────────
// ⚠️  SECURITY NOTE: This service makes direct browser-to-API calls to api.anthropic.com.
// VITE_CLAUDE_API_KEY is a client-side env var (VITE_ prefix) and IS exposed in the
// compiled JS bundle — it is visible to anyone who inspects the page source.
// This is the current architecture (uses anthropic-dangerous-direct-browser-access header).
// Do not refactor to server-side without explicit instruction.

async function callClaude(systemPrompt: string, userMessage: string, maxTokens = 1000): Promise<string> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    // ERR_NETWORK_IO_SUSPENDED is often caused by a missing key (empty fetch) or a
    // browser extension (uBlock, Privacy Badger) blocking api.anthropic.com.
    // Check: (1) .env.local exists and contains VITE_CLAUDE_API_KEY=sk-ant-...
    //        (2) Dev server was restarted after adding the env var
    //        (3) No browser extension is blocking the request
    console.error(
      '[Claude] VITE_CLAUDE_API_KEY is not set.\n' +
      '  1. Create .env.local in the project root\n' +
      '  2. Add: VITE_CLAUDE_API_KEY=sk-ant-api03-...\n' +
      '  3. Restart the dev server (npm run dev)'
    );
    throw new Error('VITE_CLAUDE_API_KEY is not set. Add it to your .env.local file.');
  }

  console.debug('[Claude] API call →', CLAUDE_API_URL, '| key prefix:', apiKey.slice(0, 12) + '...');

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
    const msg = `Claude API error ${response.status}: ${errorData?.error?.message || response.statusText}`;
    console.error('[Claude] Request failed:', msg, { status: response.status });
    throw new Error(msg);
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

// ─── 6. Lesson Tutor — one-question AI clarification after each lesson ────────
export async function askTutor(lessonTitle: string, lessonContent: string, question: string): Promise<string> {
  const system = `You are a knowledgeable crypto educator inside the Clarix learning app. A student just finished a lesson and has a follow-up question.

Lesson they just read: "${lessonTitle}"
Lesson summary: "${lessonContent.replace(/\n+/g, ' ').slice(0, 900)}"

Answer in plain, clear English. Maximum 3 short paragraphs. Use concrete analogies where helpful. Write in a calm, professional mentor tone. Avoid excessive punctuation, em-dashes, exclamation marks, and hype language. Do not start sentences with "Amazing" or similar filler.`;

  try {
    return await callClaude(system, question, 500);
  } catch {
    return "I couldn't process that right now — please try again in a moment.";
  }
}

// ─── 7. Portfolio Analysis ────────────────────────────────────────────────────
export interface PortfolioAnalysis {
  healthScore: number;          // 0–100
  healthLabel: string;          // e.g. "Well-diversified"
  summary: string;              // 2-sentence overall take
  concentrationRisk: string;    // plain-English risk note
  marketConditions: string;     // what current prices mean for their specific holdings
  recommendation: string;       // one actionable step tailored to knowledge level
  watchOut: string;             // one key risk to watch
}

export async function analyzePortfolio(
  holdings: { symbol: string; chain: string; valueUsd: number; change24h: number; signal: string }[],
  totalValueUsd: number,
  completedLevels: string[],  // e.g. ['b1', 'f1']
  username: string
): Promise<PortfolioAnalysis> {
  const levelLabel =
    completedLevels.includes('p1') ? 'advanced (Level 4)' :
    completedLevels.includes('m1') ? 'intermediate (Level 3)' :
    completedLevels.includes('f1') ? 'developing (Level 2)' :
    'beginner (Level 1)';

  const holdingsSummary = holdings
    .map(h => `${h.symbol} on ${h.chain}: $${h.valueUsd.toFixed(0)} (${h.change24h >= 0 ? '+' : ''}${h.change24h.toFixed(1)}% 24h, signal: ${h.signal})`)
    .join('\n');

  const system = `You are Clarix AI, a friendly and practical crypto portfolio advisor. Your job is to give honest, plain-English analysis that a real person can act on.
Never use unexplained jargon. Always be encouraging but honest about risks. Tailor complexity to the user's knowledge level.
Respond ONLY with valid JSON. No markdown fences, no preamble.`;

  const user = `Analyze this crypto portfolio and give personalized advice.

User: ${username}
Knowledge level: ${levelLabel}
Total portfolio value: $${totalValueUsd.toFixed(2)}

Holdings:
${holdingsSummary}

Return this exact JSON (all fields required, plain English, no jargon):
{
  "healthScore": 0-100,
  "healthLabel": "Short label like 'Healthy & Growing' or 'High Concentration Risk'",
  "summary": "2 sentences: what the portfolio looks like overall",
  "concentrationRisk": "Plain English: is too much in one coin or chain? Is that a problem?",
  "marketConditions": "What do today's 24h price moves mean specifically for these holdings? Be concrete.",
  "recommendation": "${levelLabel.includes('beginner') || levelLabel.includes('developing') ? 'Simple, beginner-friendly action — avoid technical terms' : 'More specific action — can mention on-chain mechanics or protocol names'}",
  "watchOut": "One key risk they should watch in the next 24-48 hours"
}`;

  try {
    const raw = await callClaude(system, user, 900);
    const parsed = JSON.parse(stripJsonFences(raw));
    if (parsed.healthScore !== undefined && parsed.recommendation) return parsed;
    throw new Error('Invalid portfolio analysis format');
  } catch (err) {
    console.error('Portfolio analysis failed:', err);
    const topHolding = holdings.sort((a, b) => b.valueUsd - a.valueUsd)[0];
    return {
      healthScore: 55,
      healthLabel: 'Analysis Unavailable',
      summary: `Your portfolio holds ${holdings.length} asset${holdings.length !== 1 ? 's' : ''} across multiple chains with a total value of $${totalValueUsd.toFixed(2)}. Analysis service is temporarily unavailable.`,
      concentrationRisk: topHolding
        ? `${topHolding.symbol} makes up the largest portion of your holdings. Diversification across multiple assets can reduce risk.`
        : 'Unable to assess concentration at this time.',
      marketConditions: 'Market data analysis is temporarily unavailable. Check back shortly.',
      recommendation: 'Review your portfolio allocation and ensure you are not over-exposed to any single asset.',
      watchOut: 'Monitor your largest holdings for significant price movements.',
    };
  }
}

// ─── 8. Daily Market Brief ────────────────────────────────────────────────────
export interface MarketBrief {
  headline: string;          // punchy 1-line summary of today
  paragraph1: string;        // what is happening in the market today
  paragraph2: string;        // what is driving the moves
  paragraph3: string;        // what a retail investor should be aware of
  generatedAt: number;       // timestamp
}

export async function generateMarketBrief(
  coins: { name: string; symbol: string; priceUsd: number; change24h: number }[]
): Promise<MarketBrief> {
  const coinData = coins
    .slice(0, 10)
    .map(c => `${c.name} (${c.symbol.toUpperCase()}): $${c.priceUsd.toLocaleString()} | 24h: ${c.change24h >= 0 ? '+' : ''}${c.change24h.toFixed(2)}%`)
    .join('\n');

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const system = `You are Clarix Market Intelligence — a sharp, plain-English crypto market analyst writing a daily briefing for everyday investors.
Write like a knowledgeable friend explaining the market over coffee. No hype, no jargon without explanation, no financial advice disclaimers.
Respond ONLY with valid JSON. No markdown fences.`;

  const user = `Write a daily market brief for ${today} based on these top 10 cryptocurrency prices and 24-hour movements:

${coinData}

Return this exact JSON:
{
  "headline": "One punchy sentence summarising the market mood today (max 12 words)",
  "paragraph1": "2-3 sentences: what is happening in the market right now — plain English, reference specific coins from the data",
  "paragraph2": "2-3 sentences: what is most likely driving these moves — mention macro factors, sentiment, or on-chain reasons in plain terms",
  "paragraph3": "2-3 sentences: what a regular retail investor should be aware of or think about given today's data — practical and grounded"
}`;

  try {
    const raw = await callClaude(system, user, 700);
    const parsed = JSON.parse(stripJsonFences(raw));
    if (parsed.headline && parsed.paragraph1) {
      return { ...parsed, generatedAt: Date.now() };
    }
    throw new Error('Invalid market brief format');
  } catch (err) {
    console.error('Market brief generation failed:', err);
    const gainers = coins.filter(c => c.change24h > 0).length;
    const losers = coins.filter(c => c.change24h < 0).length;
    return {
      headline: gainers > losers ? 'More green than red across major crypto markets today.' : 'Markets trading cautiously with mixed signals.',
      paragraph1: `Of the top 10 cryptocurrencies tracked today, ${gainers} are trading higher and ${losers} are lower in the past 24 hours. Bitcoin and Ethereum remain the bellwethers for market direction.`,
      paragraph2: 'Price movements in crypto are often driven by a mix of broader market sentiment, news flow, and on-chain activity. Without a clear macro catalyst, price action tends to follow technical levels and trading patterns.',
      paragraph3: 'For retail investors, days like today are a reminder to focus on your long-term thesis rather than short-term swings. Avoid making decisions based on single-day price moves alone.',
      generatedAt: Date.now(),
    };
  }
}

// ─── 9. Context-Aware AI Chat ─────────────────────────────────────────────────
export async function generatePortfolioAwareResponse(
  userMessage: string,
  context: {
    holdingsSummary: string;
    credentialLevel: string;
    topCoinsSummary: string;
    language: Language;
  },
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  const langLabel =
    context.language === Language.EN ? 'English' :
    context.language === Language.ES ? 'Spanish' :
    context.language === Language.FR ? 'French' : 'Chinese';

  const system = `You are Clarix AI, a professional crypto intelligence assistant.

User context:
- Knowledge level: ${context.credentialLevel}
- Portfolio: ${context.holdingsSummary || 'No portfolio connected yet'}
- Current top coin prices (24h change): ${context.topCoinsSummary || 'Not available'}

Rules:
1. Always respond in ${langLabel}.
2. Never use unexplained jargon. If you use a technical term, define it in plain language immediately after.
3. Always end your response with "**Takeaway:** [one clear, specific action or key point]".
4. Tailor complexity to the user's knowledge level (${context.credentialLevel}).
5. Keep responses to 3 paragraphs or fewer unless explicitly asked for more.
6. Write in a calm, clear, professional tone. Avoid em-dashes, excessive exclamation marks, and hype language. Do not use phrases like "Amazing!", "Incredible!", or "You're crushing it!".
7. Be direct and practical. Reference the user's actual portfolio or market data when relevant.`;

  const messages = [
    ...chatHistory.map(m => ({ role: m.role, content: m.content })),
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
    body: JSON.stringify({ model: MODEL, max_tokens: 1000, system, messages }),
  });

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
  const data = await response.json();
  const textBlock = data.content?.find((block: any) => block.type === 'text');
  return textBlock?.text || 'I encountered an issue. Please try again.';
}

// ─── 10. Smart Contract Audit Summary ─────────────────────────────────────────
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
