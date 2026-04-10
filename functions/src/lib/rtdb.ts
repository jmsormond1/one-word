import { getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

export function ensureAdminApp(): void {
  if (getApps().length === 0) {
    initializeApp();
  }
}

export function getRtdb() {
  ensureAdminApp();
  return getDatabase();
}
