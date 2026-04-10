import { yesterdayDateKeyInLosAngeles } from '../lib/archiveDate.js';
import { getRtdb } from '../lib/rtdb.js';

const ROUND_MS = 60_000;

export async function runDailyArchiveAndReset(): Promise<void> {
  const db = getRtdb();
  const yesterday = yesterdayDateKeyInLosAngeles();

  const lastSnap = await db.ref('meta/lastArchivedDay').get();
  if (lastSnap.val() === yesterday) {
    return;
  }

  const root = await db.ref().get();
  const storyVal = (root.child('story').val() as string | null) ?? '';
  const proposals = root.child('proposals').val() as Record<string, unknown> | null;
  const roundId = (root.child('round/id').val() as number | null) ?? 0;

  const updates: Record<string, unknown> = {
    [`archive/${yesterday}`]: storyVal,
    story: '',
    'meta/lastArchivedDay': yesterday,
    'round/id': roundId + 1,
    'round/endsAt': Date.now() + ROUND_MS,
  };

  if (proposals) {
    for (const key of Object.keys(proposals)) {
      updates[`proposals/${key}`] = null;
    }
  }

  await db.ref().update(updates);
}
