import { defineSecret } from 'firebase-functions/params';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { runDailyArchiveAndReset } from './scheduled/dailyArchive.js';
import { runFinalizeWordRound } from './scheduled/finalizeRound.js';

setGlobalOptions({ region: 'us-central1' });

const openaiApiKey = defineSecret('OPENAI_API_KEY');

export const finalizeWordRound = onSchedule(
  {
    schedule: 'every 1 minutes',
    secrets: [openaiApiKey],
    timeoutSeconds: 120,
    memory: '512MiB',
  },
  async () => {
    await runFinalizeWordRound(() => {
      try {
        return openaiApiKey.value();
      } catch {
        return '';
      }
    });
  },
);

export const archiveDailyStory = onSchedule(
  {
    schedule: '0 0 * * *',
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    await runDailyArchiveAndReset();
  },
);
