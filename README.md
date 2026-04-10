# One Word

Crowd-sourced story: every minute the highest-voted proposed word is appended to today’s story. At midnight **America/Los_Angeles**, the live story is archived under that calendar day and the board resets.

- **Client:** Vite + TypeScript, deployed on **Netlify**
- **Backend:** Firebase **Realtime Database** + **Cloud Functions** (scheduled)

## Repository layout

- [`client/`](client/) — web UI (split story / voting panes, archive browser)
- [`functions/`](functions/) — `finalizeWordRound` (every 1 minute), `archiveDailyStory` (cron midnight LA)
- [`database.rules.json`](database.rules.json) — RTDB security rules
- [`firebase.json`](firebase.json) — deploy rules + functions (no Firebase Hosting)
- [`netlify.toml`](netlify.toml) — Netlify build from `client/`

## Firebase setup

1. Create a Firebase project and enable **Realtime Database** (start in locked mode, then deploy rules).
2. The repo’s [`.firebaserc`](.firebaserc) default project is **`oneword-f9a91`**. Change it with `firebase use --add` if you use another project.
3. Install CLI: `npm install -g firebase-tools` and `firebase login`.
4. Deploy rules and functions:

   ```bash
   firebase deploy --only database,functions
   ```

5. **Billing:** Cloud Functions with scheduled triggers require a **Blaze** plan.

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

Point `VITE_FIREBASE_DATABASE_URL` at the emulator when testing (see Firebase docs for `connectDatabaseEmulator` if you wire that in later).

## Initial database state

The first client load works with empty `story` and missing `round` nodes; scheduled functions create/update `round/id` and `round/endsAt` on their first run.
