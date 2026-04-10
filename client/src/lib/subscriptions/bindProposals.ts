import { onValue, ref } from 'firebase/database';
import type { Database } from 'firebase/database';
import { RTDB_PATHS } from '../firebase/paths';

export type ProposalRow = { id: string; text: string; votes: number };

export function bindProposals(
  db: Database,
  onData: (rows: ProposalRow[]) => void,
): () => void {
  const r = ref(db, RTDB_PATHS.proposals);
  return onValue(
    r,
    (snap) => {
      const val = snap.val() as Record<string, { text: string; votes: number }> | null;
      if (!val) {
        onData([]);
        return;
      }
      const rows = Object.entries(val).map(([id, p]) => ({
        id,
        text: String(p.text ?? ''),
        votes: Number(p.votes) || 0,
      }));
      rows.sort((a, b) => b.votes - a.votes || a.id.localeCompare(b.id));
      onData(rows);
    },
    (err) => {
      console.error('[WhatHappensNext] proposals listener failed:', err);
      onData([]);
    },
  );
}
