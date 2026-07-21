import { RateLimiter } from "../ddosProtection";

describe("RateLimiter", () => {
  it("allows requests up to maxRequests within the window", () => {
    const limiter = new RateLimiter(3, 10_000);
    const now = 1_000;
    expect(limiter.allowRequest("client-1", now)).toBe(true);
    expect(limiter.allowRequest("client-1", now)).toBe(true);
    expect(limiter.allowRequest("client-1", now)).toBe(true);
  });

  it("blocks requests beyond maxRequests within the window", () => {
    const limiter = new RateLimiter(3, 10_000);
    const now = 1_000;
    limiter.allowRequest("client-1", now);
    limiter.allowRequest("client-1", now);
    limiter.allowRequest("client-1", now);
    expect(limiter.allowRequest("client-1", now)).toBe(false);
  });

  it("allows requests again once old timestamps fall outside the window", () => {
    const limiter = new RateLimiter(2, 10_000);
    limiter.allowRequest("client-1", 0);
    limiter.allowRequest("client-1", 0);
    expect(limiter.allowRequest("client-1", 0)).toBe(false);

    // advance past the 10s window
    expect(limiter.allowRequest("client-1", 10_001)).toBe(true);
  });

  it("tracks each client independently", () => {
    const limiter = new RateLimiter(1, 10_000);
    expect(limiter.allowRequest("client-1", 0)).toBe(true);
    expect(limiter.allowRequest("client-1", 0)).toBe(false);
    expect(limiter.allowRequest("client-2", 0)).toBe(true);
  });

  it("uses defaults of 5 requests per 10s window when not specified", () => {
    const limiter = new RateLimiter();
    const now = 0;
    for (let i = 0; i < 5; i++) {
      expect(limiter.allowRequest("client-1", now)).toBe(true);
    }
    expect(limiter.allowRequest("client-1", now)).toBe(false);
  });
});