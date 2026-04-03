// AI Insights Generator
// Uses OpenRouter API — auto-loads insights for all domains on init with real mock data
import {
  generateStockData,
  generateSpendingData,
  generatePortfolioHistory,
  generateHealthData,
  generateCalendarEvents,
  mockWeatherData,
} from '../data/mockData'; // adjust path if your mockData file is elsewhere

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;


// ─── Internal OpenRouter caller ───────────────────────────────────────────────

const callOpenRouter = async (messages, systemPrompt, maxTokens = 150) => {
  const response = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-5',
      max_tokens: maxTokens,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages,
      ],
    }),
  });
  const result = await response.json();
  return result.choices?.[0]?.message?.content || null;
};

// ─── Domain data builders ──────────────────────────────────────────────────────
// Bundles all relevant mock data per domain into one context object for the AI

const buildDomainData = () => ({
  finance: {
    stocks: generateStockData(),
    spending: generateSpendingData(),
    portfolioHistory: generatePortfolioHistory(),
  },
  health: generateHealthData(),
  weather: mockWeatherData,
  calendar: generateCalendarEvents().map(e => ({
    title: e.title,
    time: e.time,
    duration: e.duration,
    type: e.type,
    date: e.date.toDateString(),
  })),
});

// ─── Prompt templates ──────────────────────────────────────────────────────────

const STRICT_SYSTEM_PROMPT = `You are a data analyst. Your job is to analyze ONLY the data provided to you in the user message.
RULES:
- Base your response STRICTLY on the numbers and values in the provided data.
- Do NOT use any external knowledge, general advice, or assumptions beyond what is in the data.
- Do NOT mention anything not present in the data.
- If a value is good or bad, say so only by comparing it to the goal/target present in the data.
- Give ONE insight, max 2 sentences.
- Be specific — reference actual numbers from the data.`;

const buildPrompt = (domain, data) => {
  const templates = {
    finance: `Analyze ONLY this data and give one specific insight referencing the actual numbers:

STOCKS: ${JSON.stringify(data.stocks)}
SPENDING THIS WEEK vs LAST WEEK: ${JSON.stringify(data.spending)}
PORTFOLIO: started at $${data.portfolioHistory[0]?.value}, currently at $${data.portfolioHistory.at(-1)?.value} over ${data.portfolioHistory.length} days.

Only use the above numbers. Do not add external market knowledge.`,

    health: `Analyze ONLY this data and give one specific insight referencing the actual numbers:

Steps today: ${data.steps} (goal: ${data.stepsGoal})
Sleep last night: ${data.sleep}h (goal: ${data.sleepGoal}h)
Calories: ${data.calories} (goal: ${data.caloriesGoal})
Heart rate: ${data.heartRate} bpm
Hydration: ${data.hydration} glasses (goal: ${data.hydrationGoal})

Only use the above numbers. Do not add external health advice.`,

    weather: `Analyze ONLY this data and give one practical tip in 1 sentence based strictly on the values below:

${JSON.stringify(data)}

Only reference the values in this data. Do not add general weather knowledge.`,

    calendar: `Analyze ONLY this schedule data and give one productivity observation in max 2 sentences based strictly on the events listed:

${JSON.stringify(data)}

Only reference the events and times in this data. Do not add general productivity advice.`,
  };

  return (
    templates[domain] ||
    `Analyze ONLY the following data and give ONE specific insight (max 2 sentences). Do not use any external knowledge:\n\n${JSON.stringify(data)}`
  );
};

// ─── Single domain insight ─────────────────────────────────────────────────────
// Still exported so individual components can call generateInsight(domain, data)
// with their own live data if needed

export const generateInsight = async (domain, data) => {
  try {
    const text = await callOpenRouter(
      [{ role: 'user', content: buildPrompt(domain, data) }],
      STRICT_SYSTEM_PROMPT,
      150
    );
    return text || getFallbackInsight(domain, data);
  } catch {
    return getFallbackInsight(domain, data);
  }
};

// ─── Fallbacks ─────────────────────────────────────────────────────────────────

const getFallbackInsight = (domain, data) => {
  const insights = {
    finance: [
      `Your portfolio shows ${data?.stocks?.[0]?.change > 0 ? 'positive' : 'negative'} momentum. Consider reviewing your allocation.`,
      'Diversification across sectors can help reduce risk in volatile markets.',
      'Your weekly spending patterns suggest opportunities to optimize in entertainment.',
    ],
    health: [
      `You've reached ${Math.round(((data?.steps ?? 0) / (data?.stepsGoal ?? 10000)) * 100)}% of your step goal. A short walk could complete it!`,
      `Your sleep of ${data?.sleep}h is ${data?.sleep >= 7 ? 'on track' : 'below the recommended 7-8 hours'}.`,
      'Consistent hydration throughout the day supports energy and focus.',
    ],
    weather: [
      'Great conditions for outdoor activities today — consider a walk or workout outside.',
      'Layering clothes is recommended given the temperature variability.',
    ],
    calendar: [
      'You have a busy morning — consider blocking focus time in the afternoon.',
      'Back-to-back meetings can reduce productivity. Try adding 5-minute breaks.',
    ],
  };
  const list = insights[domain] || ['Stay informed and keep tracking your progress!'];
  return list[Math.floor(Math.random() * list.length)];
};

// ─── Chat system prompt with live data injected ───────────────────────────────
// Builds a system prompt that embeds all current dashboard data so the AI
// answers ONLY from what's on the user's actual dashboard — no external knowledge.

export const buildChatSystemPrompt = () => {
  const d = buildDomainData();

  return `You are an AI assistant embedded in a personal dashboard. 
You have access to the user's LIVE dashboard data shown below. 
Answer questions ONLY using this data. Do not use external knowledge or invent numbers not present here.
Be concise (2-4 sentences), friendly, and always reference specific values from the data.

━━━ FINANCE ━━━
Stocks: ${JSON.stringify(d.finance.stocks)}
Spending (this week vs last): ${JSON.stringify(d.finance.spending)}
Portfolio: started $${d.finance.portfolioHistory[0]?.value} → now $${d.finance.portfolioHistory.at(-1)?.value} over ${d.finance.portfolioHistory.length} days

━━━ HEALTH ━━━
Steps: ${d.health.steps}/${d.health.stepsGoal}
Sleep: ${d.health.sleep}h / ${d.health.sleepGoal}h goal
Calories: ${d.health.calories} / ${d.health.caloriesGoal} goal
Heart rate: ${d.health.heartRate} bpm
Hydration: ${d.health.hydration} / ${d.health.hydrationGoal} glasses

━━━ WEATHER ━━━
${JSON.stringify(d.weather)}

━━━ CALENDAR ━━━
${JSON.stringify(d.calendar)}

RULES:
- Only answer based on the data above.
- If asked about something not in the data, say "That data isn't available on your dashboard."
- Never fabricate numbers or trends.
- Reference actual values when answering (e.g. "your steps are 7,200 out of 10,000").`;
};

// ─── Chat ──────────────────────────────────────────────────────────────────────

export const chatWithAI = async (messages) => {
  try {
    const text = await callOpenRouter(
      messages.map(m => ({ role: m.role, content: m.content })),
      buildChatSystemPrompt(),
      1000
    );
    return text || "I'm having trouble connecting right now. Please try again.";
  } catch {
    return "I'm temporarily unavailable. Please check your connection and try again.";
  }
};
