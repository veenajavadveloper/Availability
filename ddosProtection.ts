// ddosProtection.ts
// Availability mechanism #3: DDoS Protection (Rate Limiting)
// Blocks a client that sends too many requests in a short time window,
// protecting system availability from being overwhelmed.

export class RateLimiter {
  private requestLog: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(maxRequests = 5, windowMs = 10_000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /** Returns true if the request is allowed, false if it should be blocked */
  allowRequest(clientId: string, now: number = Date.now()): boolean {
    const timestamps = this.requestLog.get(clientId) ?? [];

    // Keep only requests within the current time window
    const recent = timestamps.filter((t) => now - t < this.windowMs);

    if (recent.length >= this.maxRequests) {
      this.requestLog.set(clientId, recent);
      return false; // blocked - likely abusive/flooding traffic
    }

    recent.push(now);
    this.requestLog.set(clientId, recent);
    return true;
  }
}
