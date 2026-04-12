interface UsageTracker {
  dailyCount: number;
  improvementCount: number;
  lastResetDate: string;
  cachedResponses: Map<string, { response: string; timestamp: number }>;
}

const STORAGE_KEY = "practicum-ai-usage";
const DAILY_LIMIT = 10;
const IMPROVEMENT_LIMIT = 5;
const CACHE_TTL = 5 * 60 * 1000;

function getTracker(): UsageTracker {
  if (typeof window === "undefined") {
    return {
      dailyCount: 0,
      improvementCount: 0,
      lastResetDate: new Date().toDateString(),
      cachedResponses: new Map(),
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        dailyCount: 0,
        improvementCount: 0,
        lastResetDate: new Date().toDateString(),
        cachedResponses: new Map(),
      };
    }

    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      cachedResponses: new Map(Object.entries(parsed.cachedResponses || {})),
    };
  } catch {
    return {
      dailyCount: 0,
      improvementCount: 0,
      lastResetDate: new Date().toDateString(),
      cachedResponses: new Map(),
    };
  }
}

function saveTracker(tracker: UsageTracker) {
  if (typeof window === "undefined") return;

  try {
    const serializable = {
      ...tracker,
      cachedResponses: Object.fromEntries(tracker.cachedResponses),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (e) {
    console.error("Failed to save tracker:", e);
  }
}

function checkAndResetDaily(tracker: UsageTracker): UsageTracker {
  const today = new Date().toDateString();
  if (tracker.lastResetDate !== today) {
    return {
      dailyCount: 0,
      improvementCount: 0,
      lastResetDate: today,
      cachedResponses: new Map(),
    };
  }
  return tracker;
}

export function canUseAI(): { allowed: boolean; remaining: number; message: string } {
  const tracker = getTracker();
  const resetTracker = checkAndResetDaily(tracker);
  
  if (resetTracker !== tracker) {
    saveTracker(resetTracker);
  }

  if (resetTracker.dailyCount >= DAILY_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      message: `Daily limit reached (${DAILY_LIMIT}/${DAILY_LIMIT}). Try again tomorrow.`,
    };
  }

  return {
    allowed: true,
    remaining: DAILY_LIMIT - resetTracker.dailyCount,
    message: `${DAILY_LIMIT - resetTracker.dailyCount} AI generations left today`,
  };
}

export function canImprove(): { allowed: boolean; remaining: number; message: string } {
  const tracker = getTracker();
  const resetTracker = checkAndResetDaily(tracker);
  
  if (resetTracker !== tracker) {
    saveTracker(resetTracker);
  }

  if (resetTracker.improvementCount >= IMPROVEMENT_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      message: `Daily improvement limit reached (${IMPROVEMENT_LIMIT}/${IMPROVEMENT_LIMIT}). Try again tomorrow.`,
    };
  }

  return {
    allowed: true,
    remaining: IMPROVEMENT_LIMIT - resetTracker.improvementCount,
    message: `${IMPROVEMENT_LIMIT - resetTracker.improvementCount} improvements left today`,
  };
}

export function recordAIUsage(prompt: string, response: string) {
  const tracker = getTracker();
  const resetTracker = checkAndResetDaily(tracker);

  resetTracker.dailyCount += 1;

  const cacheKey = prompt.substring(0, 100).toLowerCase();
  resetTracker.cachedResponses.set(cacheKey, {
    response,
    timestamp: Date.now(),
  });

  const expiredKeys: string[] = [];
  resetTracker.cachedResponses.forEach((value, key) => {
    if (Date.now() - value.timestamp > CACHE_TTL) {
      expiredKeys.push(key);
    }
  });
  expiredKeys.forEach((key) => resetTracker.cachedResponses.delete(key));

  saveTracker(resetTracker);
}

export function recordImprovement() {
  const tracker = getTracker();
  const resetTracker = checkAndResetDaily(tracker);

  resetTracker.improvementCount += 1;
  saveTracker(resetTracker);
}

export function getCachedResponse(prompt: string): string | null {
  const tracker = getTracker();
  const cacheKey = prompt.substring(0, 100).toLowerCase();
  const cached = tracker.cachedResponses.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.response;
  }

  return null;
}

export function getUsageStats() {
  const tracker = getTracker();
  const resetTracker = checkAndResetDaily(tracker);
  
  return {
    dailyUsed: resetTracker.dailyCount,
    dailyLimit: DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - resetTracker.dailyCount),
    improvementUsed: resetTracker.improvementCount,
    improvementLimit: IMPROVEMENT_LIMIT,
    improvementRemaining: Math.max(0, IMPROVEMENT_LIMIT - resetTracker.improvementCount),
  };
}
