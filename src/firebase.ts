// File: src/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import config from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use the explicit firestore database ID provided in config
export const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

// Connection test as required by skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: client is offline or network restricted.");
    }
  }
}
testConnection();

// Collection references
export const GURUS_COLLECTION = 'gurus';
export const GURU_APPLICATIONS_COLLECTION = 'guru_applications';
export const CLIENT_BOOKINGS_COLLECTION = 'client_bookings';
export const CLIENT_RECHARGES_COLLECTION = 'client_recharges';
export const USERS_COLLECTION = 'users';

// Helper to set user role in /users/{uid}/role
export async function setUserRole(uid: string, role: string, extraData: any = {}): Promise<void> {
  try {
    if (!uid) return;
    await setDoc(doc(db, USERS_COLLECTION, uid), {
      uid,
      role,
      ...extraData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to set user role in Firebase:', err);
  }
}

// Helper functions for Gurus
export async function syncGurusFromFirestore(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, GURUS_COLLECTION));
    const items: any[] = [];
    snap.forEach((d) => items.push({ ...d.data(), id: d.id }));
    return items;
  } catch (err) {
    console.warn('Failed to fetch gurus from Firestore, falling back to local:', err);
    return [];
  }
}

export async function saveGuruToFirestore(guru: any): Promise<void> {
  try {
    if (!guru.id) return;
    await setDoc(doc(db, GURUS_COLLECTION, guru.id), guru, { merge: true });
  } catch (err) {
    console.warn('Failed to save guru to Firestore:', err);
  }
}

// Helper functions for Guru Applications
export async function syncApplicationsFromFirestore(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, GURU_APPLICATIONS_COLLECTION));
    const items: any[] = [];
    snap.forEach((d) => items.push({ ...d.data(), id: d.id }));
    return items;
  } catch (err) {
    console.warn('Failed to fetch applications from Firestore:', err);
    return [];
  }
}

export async function saveApplicationToFirestore(appData: any): Promise<void> {
  try {
    if (!appData.id) return;
    await setDoc(doc(db, GURU_APPLICATIONS_COLLECTION, appData.id), appData, { merge: true });
  } catch (err) {
    console.warn('Failed to save application to Firestore:', err);
  }
}

export async function deleteApplicationFromFirestore(appId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, GURU_APPLICATIONS_COLLECTION, appId));
  } catch (err) {
    console.warn('Failed to delete application from Firestore:', err);
  }
}

// Helper functions for Recharges & Bookings
export async function saveRechargeToFirestore(recharge: any): Promise<void> {
  try {
    if (!recharge.id) return;
    await setDoc(doc(db, CLIENT_RECHARGES_COLLECTION, recharge.id), recharge, { merge: true });
  } catch (err) {
    console.warn('Failed to save recharge to Firestore:', err);
  }
}

export async function saveBookingToFirestore(booking: any): Promise<void> {
  try {
    if (!booking.id) return;
    await setDoc(doc(db, CLIENT_BOOKINGS_COLLECTION, booking.id), booking, { merge: true });
  } catch (err) {
    console.warn('Failed to save booking to Firestore:', err);
  }
}

export { app };
export default db;
