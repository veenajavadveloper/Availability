// backupManager.ts
// Availability mechanism #2: Backups
// Ensures data can be restored quickly if the primary copy is lost or corrupted.

export interface Backup {
  timestamp: string;
  data: Record<string, unknown>;
}

export class BackupManager {
  private backups: Backup[] = [];
  private maxBackups: number;

  constructor(maxBackups = 3) {
    this.maxBackups = maxBackups;
  }

  /** Takes a snapshot of the current system data */
  createBackup(data: Record<string, unknown>): Backup {
    const backup: Backup = {
      timestamp: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(data)), // deep copy snapshot
    };

    this.backups.push(backup);

    // Keep only the most recent N backups (rotation policy)
    if (this.backups.length > this.maxBackups) {
      this.backups.shift();
    }

    return backup;
  }

  /** Restores the most recent backup (disaster recovery) */
  restoreLatest(): Backup {
    if (this.backups.length === 0) {
      throw new Error("🚨 No backups available to restore!");
    }
    return this.backups[this.backups.length - 1];
  }

  listBackups(): Backup[] {
    return [...this.backups];
  }
}
