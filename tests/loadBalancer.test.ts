import { LoadBalancer } from "../loadBalancer";

describe("LoadBalancer", () => {
  it("initializes all servers as healthy with zero active connections", () => {
    const lb = new LoadBalancer(["A", "B", "C"]);
    expect(lb.status()).toEqual([
      { id: "A", healthy: true, activeConnections: 0 },
      { id: "B", healthy: true, activeConnections: 0 },
      { id: "C", healthy: true, activeConnections: 0 },
    ]);
  });

  it("routes requests round-robin across healthy servers", () => {
    const lb = new LoadBalancer(["A", "B", "C"]);
    const order = [lb.routeRequest().id, lb.routeRequest().id, lb.routeRequest().id, lb.routeRequest().id];
    expect(order).toEqual(["A", "B", "C", "A"]);
  });

  it("increments activeConnections on the routed server", () => {
    const lb = new LoadBalancer(["A", "B"]);
    lb.routeRequest();
    lb.routeRequest();
    lb.routeRequest();
    const status = lb.status();
    expect(status.find((s) => s.id === "A")?.activeConnections).toBe(2);
    expect(status.find((s) => s.id === "B")?.activeConnections).toBe(1);
  });

  it("skips servers marked unhealthy by runHealthChecks", () => {
    const lb = new LoadBalancer(["A", "B", "C"]);
    lb.runHealthChecks(["B"]);
    const ids = [lb.routeRequest().id, lb.routeRequest().id, lb.routeRequest().id];
    expect(ids).not.toContain("B");
    expect(ids).toEqual(["A", "C", "A"]);
  });

  it("marks a previously down server healthy again once it's not in the down list", () => {
    const lb = new LoadBalancer(["A", "B"]);
    lb.runHealthChecks(["B"]);
    lb.runHealthChecks([]);
    expect(lb.status().every((s) => s.healthy)).toBe(true);
  });

  it("throws an outage error when no servers are healthy", () => {
    const lb = new LoadBalancer(["A", "B"]);
    lb.runHealthChecks(["A", "B"]);
    expect(() => lb.routeRequest()).toThrow("🚨 Outage: No healthy servers available!");
  });

  it("status() returns a defensive copy, not a live reference", () => {
    const lb = new LoadBalancer(["A"]);
    const status = lb.status();
    status[0].healthy = false;
    expect(lb.status()[0].healthy).toBe(true);
  });
});