// In-memory rate limiter (free tier: 15 RPM)
const userRequests = new Map<string, number[]>();

export const checkRateLimit = (userId: string, limit = 10): boolean => {
  const now = Date.now();
  const minute = 60 * 1000;
  
  const timestamps = userRequests.get(userId) || [];
  const recent = timestamps.filter(t => now - t < minute);
  
  if (recent.length >= limit) return false;
  
  recent.push(now);
  userRequests.set(userId, recent);
  return true;
};
