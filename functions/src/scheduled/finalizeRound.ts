import { getRtdb } from '../lib/rtdb.js';
import { appendWordToStory, pickWinner } from '../lib/pickWinner.js';

const ROUND_MS = 60_000;

export async function runFinalizeWordRound(): Promise<void> {
  const db = getRtdb();
  const root = await db.ref().get();

  const storyVal = root.child('story').val() as string | null;
  const roundId = (root.child('round/id').val() as number | null) ?? 0;
  const proposals = root.child('proposals').val() as
    | Record<string, { text: string; votes: number }>
    | null;

  const keys = proposals ? Object.keys(proposals) : [];
  if (keys.length === 0) {
    await db.ref().update({
      'round/id': roundId + 1,
      'round/endsAt': Date.now() + ROUND_MS,
    });
    return;
  }

  const winner = pickWinner(proposals!);
  if (!winner) {
    return;
  }

  const newStory = appendWordToStory(storyVal, winner.text);
  const updates: Record<string, unknown> = {
    story: newStory,
    'round/id': roundId + 1,
    'round/endsAt': Date.now() + ROUND_MS,
  };

  for (const key of keys) {
    updates[`proposals/${key}`] = null;
  }

  await db.ref().update(updates);
}
