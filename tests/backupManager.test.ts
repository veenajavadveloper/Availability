import { BackupManager } from "../backupManager";

describe("BackupManager", () => {
  it("stores a backup with a timestamp and a deep-copied data snapshot", () => {
    const mgr = new BackupManager();
    const data = { users: 1 };
    const backup = mgr.createBackup(data);

    expect(backup.data).toEqual({ users: 1 });
    expect(typeof backup.timestamp).toBe("string");

    // mutating the original object must not affect the stored snapshot
    data.users = 999;
    expect(mgr.listBackups()[0].data).toEqual({ users: 1 });
  });

  it("lists backups in the order they were created", () => {
    const mgr = new BackupManager(5);
    mgr.createBackup({ v: 1 });
    mgr.createBackup({ v: 2 });
    mgr.createBackup({ v: 3 });
    expect(mgr.listBackups().map((b) => b.data)).toEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
  });

  it("restores the most recently created backup", () => {
    const mgr = new BackupManager();
    mgr.createBackup({ v: 1 });
    mgr.createBackup({ v: 2 });
    expect(mgr.restoreLatest().data).toEqual({ v: 2 });
  });

  it("evicts the oldest backup once maxBackups is exceeded", () => {
    const mgr = new BackupManager(2);
    mgr.createBackup({ v: 1 });
    mgr.createBackup({ v: 2 });
    mgr.createBackup({ v: 3 });
    expect(mgr.listBackups().map((b) => b.data)).toEqual([{ v: 2 }, { v: 3 }]);
  });

  it("throws when restoring with no backups available", () => {
    const mgr = new BackupManager();
    expect(() => mgr.restoreLatest()).toThrow("🚨 No backups available to restore!");
  });

  it("listBackups() returns a defensive copy, not a live reference", () => {
    const mgr = new BackupManager();
    mgr.createBackup({ v: 1 });
    const list = mgr.listBackups();
    list.pop();
    expect(mgr.listBackups().length).toBe(1);
  });
});
