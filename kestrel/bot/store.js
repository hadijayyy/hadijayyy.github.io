// Tiny JSON-file store: user wallets, language, pending launches, rate limits.

import { readFileSync, renameSync, writeFileSync } from 'node:fs';

export class Store {
  constructor(file) {
    this.file = file;
    try {
      this.data = JSON.parse(readFileSync(file, 'utf8'));
    } catch {
      this.data = {};
    }
    this.data.users ??= {};
    this.data.launches ??= []; // { userId, at, symbol, token }
    this.data.lastAlertBlock ??= null;
  }

  save() {
    const tmp = `${this.file}.tmp`;
    writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    renameSync(tmp, this.file);
  }

  user(id) {
    const key = String(id);
    this.data.users[key] ??= { lang: 'id', wallet: null, pending: null };
    return this.data.users[key];
  }

  /** Returns null if allowed, or seconds to wait. */
  launchWait(userId, { cooldownHours, maxPerHour }, nowMs = Date.now()) {
    const hour = 3_600_000;
    const recent = this.data.launches.filter((l) => nowMs - l.at < hour);
    if (recent.length >= maxPerHour) {
      const oldest = Math.min(...recent.map((l) => l.at));
      return Math.ceil((oldest + hour - nowMs) / 1000);
    }
    const mine = this.data.launches.filter((l) => l.userId === String(userId));
    if (mine.length) {
      const last = Math.max(...mine.map((l) => l.at));
      const until = last + cooldownHours * hour;
      if (until > nowMs) return Math.ceil((until - nowMs) / 1000);
    }
    return null;
  }

  recordLaunch(userId, symbol, token, nowMs = Date.now()) {
    this.data.launches.push({ userId: String(userId), at: nowMs, symbol, token });
    // keep the file small
    const keepAfter = nowMs - 7 * 24 * 3_600_000;
    this.data.launches = this.data.launches.filter((l) => l.at > keepAfter);
    this.save();
  }
}
