import { onValue, ref } from 'firebase/database';
import type { Database } from 'firebase/database';
import { RTDB_PATHS } from '../firebase/paths';

export function bindLiveStory(db: Database, onData: (text: string) => void): () => void {
  const r = ref(db, RTDB_PATHS.story);
  return onValue(r, (snap) => {
    onData(snap.val() ?? '');
  });
}
