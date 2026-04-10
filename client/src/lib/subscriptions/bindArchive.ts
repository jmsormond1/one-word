import { onValue, ref } from 'firebase/database';
import type { Database } from 'firebase/database';
import { RTDB_PATHS } from '../firebase/paths';

export function bindArchive(
  db: Database,
  onData: (entries: Record<string, string>) => void,
): () => void {
  const r = ref(db, RTDB_PATHS.archive);
  return onValue(r, (snap) => {
    onData((snap.val() as Record<string, string> | null) ?? {});
  });
}
