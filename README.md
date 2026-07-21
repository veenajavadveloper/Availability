# Availability Demo (CIA Triad)

A short TypeScript project demonstrating the **Availability** pillar of the CIA
triad: *"Systems and data are accessible when needed."*

## Modules

| File | Availability mechanism |
|---|---|
| `src/loadBalancer.ts` | Load balancing + automatic failover when a server goes down |
| `src/backupManager.ts` | Rotating backups + restore for disaster recovery |
| `src/ddosProtection.ts` | Rate limiting to block flooding/DDoS-style traffic |
| `src/index.ts` | Demo script that runs all three scenarios |

## Run it

```bash
npm install
npm run build
npm start
```

Or run directly with ts-node:

```bash
npm install
npx ts-node src/index.ts
```

## Interview-ready summary

> Availability ensures systems remain operational and accessible. It's
> commonly achieved through redundancy (load balancing, failover), backups
> (so data can be restored after loss/corruption), and protective measures
> like rate limiting or DDoS mitigation (so attackers can't overwhelm the
> system and deny service to legitimate users).
