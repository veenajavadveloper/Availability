// loadBalancer.ts
// Availability mechanism #1: Load Balancing + Failover
// If one server goes down, traffic is automatically routed to healthy servers.

export interface Server {
  id: string;
  healthy: boolean;
  activeConnections: number;
}

export class LoadBalancer {
  private servers: Server[];
  private roundRobinIndex = 0;

  constructor(serverIds: string[]) {
    this.servers = serverIds.map((id) => ({
      id,
      healthy: true,
      activeConnections: 0,
    }));
  }

  /** Simulates a periodic health check ping to each server */
  runHealthChecks(downServerIds: string[] = []): void {
    for (const server of this.servers) {
      server.healthy = !downServerIds.includes(server.id);
    }
  }

  /** Routes a request to the next healthy server (round-robin) */
  routeRequest(): Server {
    const healthyServers = this.servers.filter((s) => s.healthy);

    if (healthyServers.length === 0) {
      throw new Error("🚨 Outage: No healthy servers available!");
    }

    this.roundRobinIndex = this.roundRobinIndex % healthyServers.length;
    const chosen = healthyServers[this.roundRobinIndex];
    this.roundRobinIndex++;
    chosen.activeConnections++;

    return chosen;
  }

  status(): Server[] {
    return this.servers.map((s) => ({ ...s }));
  }
}
