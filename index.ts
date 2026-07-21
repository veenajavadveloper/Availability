// index.ts
// Demo: CIA Triad - AVAILABILITY pillar
// "Systems and data are accessible when needed"

import { LoadBalancer } from "./loadBalancer";
import { BackupManager } from "./backupManager";
import { RateLimiter } from "./ddosProtection";

function section(title: string) {
  console.log("\n" + "=".repeat(50));
  console.log(title);
  console.log("=".repeat(50));
}

// 1. LOAD BALANCING + FAILOVER
section("1. Load Balancing & Failover");
const lb = new LoadBalancer(["server-A", "server-B", "server-C"]);

console.log("All servers healthy. Routing 5 requests:");
for (let i = 0; i < 5; i++) {
  console.log(` -> routed to ${lb.routeRequest().id}`);
}

console.log("\nsever-B goes down (simulated failure)...");
lb.runHealthChecks(["server-B"]);
console.log("Routing 5 more requests (should skip server-B):");
for (let i = 0; i < 5; i++) {
  console.log(` -> routed to ${lb.routeRequest().id}`);
}
console.log("\nCurrent server status:", lb.status());

// 2. BACKUPS
section("2. Backups & Recovery");
const backupMgr = new BackupManager(3);

backupMgr.createBackup({ users: 100, orders: 20 });
backupMgr.createBackup({ users: 105, orders: 22 });
console.log("Backups taken. Total stored:", backupMgr.listBackups().length);

console.log("\nSimulating data corruption... restoring latest backup:");
const restored = backupMgr.restoreLatest();
console.log("Restored data:", restored.data, "from", restored.timestamp);

// 3. DDoS PROTECTION (RATE LIMITING)
section("3. DDoS Protection (Rate Limiting)");
const limiter = new RateLimiter(3, 10_000); // max 3 requests / 10s per client

console.log("Client 'attacker-1' sends 5 rapid requests:");
for (let i = 1; i <= 5; i++) {
  const allowed = limiter.allowRequest("attacker-1");
  console.log(` Request ${i}: ${allowed ? "✅ allowed" : "❌ blocked (rate limit)"}`);
}

console.log("\n✅ Availability demo complete.");
