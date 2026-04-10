import { setGlobalOptions } from 'firebase-functions/v2/options';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { runDailyArchiveAndReset } from './scheduled/dailyArchive.js';
import { runFinalizeWordRound } from './scheduled/finalizeRound.js';

setGlobalOptions({ region: 'us-central1' });

export const finalizeWordRound = onSchedule('every 1 minutes', async () => {
  await runFinalizeWordRound();
});

export const archiveDailyStory = onSchedule(
  {
    schedule: '0 0 * * *',
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    await runDailyArchiveAndReset();
  },
);
