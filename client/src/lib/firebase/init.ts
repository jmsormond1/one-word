import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

function readConfig() {
  const {
    VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_DATABASE_URL,
    VITE_FIREBASE_PROJECT_ID,
  } = import.meta.env;

  if (
    !VITE_FIREBASE_API_KEY ||
    !VITE_FIREBASE_AUTH_DOMAIN ||
    !VITE_FIREBASE_DATABASE_URL ||
    !VITE_FIREBASE_PROJECT_ID
  ) {
    throw new Error(
      'Missing Firebase env vars. Copy .env.example to .env and set VITE_FIREBASE_* values.',
    );
  }

  return {
    apiKey: VITE_FIREBASE_API_KEY,
    authDomain: VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: VITE_FIREBASE_DATABASE_URL,
    projectId: VITE_FIREBASE_PROJECT_ID,
  };
}

let app: FirebaseApp | undefined;
let db: Database | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(readConfig());
  }
  return app;
}

export function getDb(): Database {
  if (!db) {
    db = getDatabase(getFirebaseApp());
  }
  return db;
}
