# Availability Demo — Functionality Overview

This project is a small TypeScript demo illustrating the **Availability** pillar
of the CIA triad (Confidentiality, Integrity, Availability): *"systems and data
remain accessible to legitimate users when they need them."* It implements
three independent availability mechanisms as standalone classes, then wires
them together in a single script (`index.ts`) that runs a simulated demo of
each one.

There is no server, database, or UI — everything runs in-memory and prints
its output to the console via `console.log`.

## Files

| File | Role |
|---|---|
| `index.ts` | Entry point. Imports the three modules below and runs a scripted demo of each. |
| `loadBalancer.ts` | Load balancing + automatic failover across a pool of servers. |
| `backupManager.ts` | Rotating backups with restore, for disaster recovery. |
| `ddosProtection.ts` | Per-client rate limiting to block flooding/DDoS-style traffic. |

## 1. Load Balancing & Failover — `loadBalancer.ts`

Exports the `LoadBalancer` class, which models a pool of backend servers and
distributes traffic across the healthy ones.

- **Construction**: takes a list of server IDs (`string[]`) and initializes
  each as a `Server` object: `{ id, healthy: true, activeConnections: 0 }`.
- **`runHealthChecks(downServerIds)`**: simulates a health-check sweep. Any
  server whose ID is in `downServerIds` is marked `healthy = false`; all
  others are marked healthy. This models servers going down/recovering.
- **`routeRequest()`**: picks the next server to handle a request using
  **round-robin** selection, but only among servers currently marked healthy.
  - Filters `servers` down to the healthy subset.
  - Throws `"🚨 Outage: No healthy servers available!"` if none are healthy —
    modeling a total outage.
  - Otherwise wraps the round-robin index into range, selects that server,
    increments its `activeConnections`, and advances the index for next time.
- **`status()`**: returns a snapshot copy of all servers (healthy or not),
  useful for observability/monitoring.

**Availability angle**: if one server fails, `routeRequest()` transparently
skips it and keeps serving traffic from the remaining healthy servers —
no manual intervention needed, and clients never notice the failure.

## 2. Backups & Recovery — `backupManager.ts`

Exports the `BackupManager` class, which snapshots arbitrary application data
and can restore the most recent snapshot on demand.

- **Construction**: takes `maxBackups` (default `3`), the retention limit.
- **`createBackup(data)`**: deep-copies the given data (via
  `JSON.parse(JSON.stringify(data))`) and stores it with an ISO timestamp as
  a `Backup` object (`{ timestamp, data }`). If the number of stored backups
  exceeds `maxBackups`, the oldest one is evicted (`shift()`) — a simple
  **rotation policy** so storage doesn't grow unbounded.
- **`restoreLatest()`**: returns the most recent backup. Throws
  `"🚨 No backups available to restore!"` if none exist.
- **`listBackups()`**: returns a copy of all currently retained backups.

**Availability angle**: if live data is lost or corrupted, the system can
recover to the last known-good state instead of being permanently down or
losing all data.

## 3. DDoS Protection / Rate Limiting — `ddosProtection.ts`

Exports the `RateLimiter` class, which implements a **sliding time-window**
rate limiter keyed per client.

- **Construction**: takes `maxRequests` (default `5`) and `windowMs` (default
  `10_000` ms) — i.e. "allow at most N requests per client per window."
- **`allowRequest(clientId, now?)`**: looks up the client's past request
  timestamps, filters out any older than `windowMs` (sliding window, not a
  fixed bucket), and:
  - If the remaining recent count is already `>= maxRequests`, the request is
    **blocked** (returns `false`) and the pruned log is saved.
  - Otherwise the current timestamp is appended, the log is saved, and the
    request is **allowed** (returns `true`).
  - The optional `now` parameter (defaults to `Date.now()`) makes the class
    deterministic/testable without relying on real wall-clock time.

**Availability angle**: a single abusive or malfunctioning client can't flood
the system with requests and starve capacity away from legitimate users.

## How `index.ts` ties it together

The entry point runs a linear, three-part console demo:

1. **Load balancing**: creates a `LoadBalancer` with 3 servers, routes 5
   requests (round-robin across all three), then simulates `server-B` going
   down via `runHealthChecks(["server-B"])`, and routes 5 more requests to
   show traffic now skipping the downed server. Prints final server status.
2. **Backups**: creates a `BackupManager(3)`, takes two backups with sample
   `{ users, orders }` data, then simulates "data corruption" by calling
   `restoreLatest()` and printing the recovered data/timestamp.
3. **Rate limiting**: creates a `RateLimiter(3, 10_000)` (max 3 requests per
   10 seconds), then fires 5 rapid requests from a client called
   `"attacker-1"` — the first 3 are allowed, the last 2 are blocked, printed
   with ✅/❌ markers.

## Running it

```bash
npm install
npm run build   # tsc -> dist/
npm start        # node dist/index.js
```

or directly during development:

```bash
npm install
npm run dev       # ts-node index.ts
```

## Summary (interview-ready)

Availability ensures systems remain operational and accessible. This demo
covers three of the most common techniques for achieving it:
redundancy/failover (load balancer), disaster recovery (rotating backups),
and abuse mitigation (rate limiting) — each implemented as a minimal,
dependency-free TypeScript class with a scripted console demo.