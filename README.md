# What Happens Next?

Crowd-sourced story: each round, users submit short ideas (up to 100 characters) and vote. The **highest-voted idea** is sent to **OpenAI** (`gpt-4o-mini`), which writes the **next paragraph** of the story. That paragraph is appended to today’s live story (not the raw vote text). At midnight **America/Los_Angeles**, the live story is archived under that calendar day and the board resets.

- **Client:** Vite + TypeScript, deployed on **Netlify**
- **Backend:** Firebase **Realtime Database** + **Cloud Functions** (scheduled)

## Repository layout

- [`client/`](client/) — web UI (split story / voting panes, archive browser)
- [`functions/`](functions/) — `finalizeWordRound` (every 1 minute: pick winner → LLM paragraph → update story), `archiveDailyStory` (cron midnight LA)
- [`database.rules.json`](database.rules.json) — RTDB security rules
- [`firebase.json`](firebase.json) — deploy rules + functions (no Firebase Hosting)
- [`netlify.toml`](netlify.toml) — Netlify build from `client/`

## Firebase setup

1. Create a Firebase project and enable **Realtime Database** (start in locked mode, then deploy rules).
2. The repo’s [`.firebaserc`](.firebaserc) default project is **`oneword-f9a91`**. Change it with `firebase use --add` if you use another project.
3. Install CLI: `npm install -g firebase-tools` and `firebase login`.
4. **LLM (required for generated paragraphs):** create an [OpenAI API key](https://platform.openai.com/api-keys) and store it as a function secret named **`OPENAI_API_KEY`**:

   ```bash
   firebase functions:secrets:set OPENAI_API_KEY
   ```

   Paste the key when prompted. After changing secrets, redeploy functions so new instances pick up the value:

   ```bash
   firebase deploy --only functions
   ```

   If the secret is missing or the API fails twice (with a 20s timeout per attempt), the function **appends the raw winning suggestion** as a fallback so the round still completes.

5. Deploy rules and functions:

   ```bash
   firebase deploy --only database,functions
   ```

6. **Billing:** Cloud Functions with scheduled triggers require a **Blaze** plan.

### Authorized domains

In Firebase Console → **Authentication** → **Settings** → **Authorized domains**, add your **Netlify** site hostname (and `localhost` for dev).

## Client environment (local + Netlify)

1. Local dev uses [`client/.env`](client/.env) (gitignored). Copy from [`.env.example`](client/.env.example) if you need a fresh file.
2. Map the Firebase **web app** snippet to these variables (this app does **not** use Analytics, Storage, or FCM, so `storageBucket`, `appId`, `measurementId`, etc. are omitted):

   - `VITE_FIREBASE_API_KEY` → `apiKey`
   - `VITE_FIREBASE_AUTH_DOMAIN` → `authDomain`
   - `VITE_FIREBASE_PROJECT_ID` → `projectId`
   - `VITE_FIREBASE_DATABASE_URL` → **not** in the web snippet: open **Realtime Database** in the console and copy the database URL exactly (often `https://<project>-default-rtdb.firebaseio.com` or a `*.firebasedatabase.app` URL). If the client cannot connect, fix this value first.

3. Run locally:

   ```bash
   cd client && npm install && npm run dev
   ```

## Netlify setup

1. New site from this repo.
2. Netlify reads [`netlify.toml`](netlify.toml): **base directory** `client`, **build command** `npm run build`, **publish** `dist`.
3. In **Site settings → Environment variables**, add the same `VITE_*` values as in `.env`.
4. Trigger a deploy.

## Local emulators (optional)

```bash
cd functions && npm run build
firebase emulators:start --only functions,database
```

For scheduled functions with secrets, configure emulator access per [Firebase docs](https://firebase.google.com/docs/functions/config-env#emulator) (or rely on the fallback path when `OPENAI_API_KEY` is unavailable). Point `VITE_FIREBASE_DATABASE_URL` at the emulator when testing (see Firebase docs for `connectDatabaseEmulator` if you wire that in later).

## Initial database state

The first client load works with empty `story` and missing `round` nodes; scheduled functions create/update `round/id` and `round/endsAt` on their first run.
