import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config read exclusively from environment variables.
// Set these in .env.local (never commit that file).
// See .env.example for the full list of required variables.
const firebaseConfig = {
  apiKey:            (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain:        (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             (import.meta as any).env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error(
    '[Firebase] VITE_FIREBASE_PROJECT_ID is not set. ' +
    'Copy .env.example → .env.local and fill in your Firebase project values.'
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

console.log('%c[Firebase] Initialised', 'color:#00D4FF;font-weight:bold', {
  projectId: firebaseConfig.projectId ?? '(missing)',
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
