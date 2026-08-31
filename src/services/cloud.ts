import { initializeApp } from 'firebase/app';
import { getAuth, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseWebConfig } from './firebaseWebConfig';

// Public web identifiers. Authorization is enforced by Firestore security rules.
const app = initializeApp(firebaseWebConfig);
export const auth = getAuth(app);
auth.languageCode = 'es';
export const authReady = setPersistence(auth, browserSessionPersistence);
export const db = getFirestore(app);
