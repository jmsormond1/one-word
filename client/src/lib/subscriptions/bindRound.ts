import { onValue, ref } from 'firebase/database';
import type { Database } from 'firebase/database';
import { RTDB_PATHS } from '../firebase/paths';

export type RoundState = { id: number; endsAt: number };

export function bindRound(
  db: Database,
  onData: (round: RoundState) => void,
): () => void {
  const idRef = ref(db, `${RTDB_PATHS.round}/id`);
  const endsRef = ref(db, `${RTDB_PATHS.round}/endsAt`);

  let id = 0;
  let endsAt = Date.now() + 60_000;

  const emit = () => onData({ id, endsAt });

  const offId = onValue(idRef, (snap) => {
    id = snap.val() ?? 0;
    emit();
  });

  const offEnds = onValue(endsRef, (snap) => {
    endsAt = snap.val() ?? Date.now() + 60_000;
    emit();
  });

  return () => {
    offId();
    offEnds();
  };
}
