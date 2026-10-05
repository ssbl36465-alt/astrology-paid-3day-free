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
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
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

// Firebase Auth setup with forced account picker
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
export { signInWithPopup, signOut, onAuthStateChanged };

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

export interface VerifiedUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin' | 'guru';
}

// Synchronize verified Google user profile to Firebase path /users/{uid}
export async function syncUserProfileData(data: {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}): Promise<VerifiedUserProfile> {
  const userRef = doc(db, USERS_COLLECTION, data.uid);
  let existingData: any = null;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingData = snap.data();
    }
  } catch (e) {
    console.warn('Could not read existing user profile:', e);
  }

  // Explicit admin check (e.g. ssbl36465@gmail.com)
  const isAdminEmail = data.email?.toLowerCase().trim() === 'ssbl36465@gmail.com';
  const role: 'user' | 'admin' | 'guru' = existingData?.role === 'guru' 
    ? 'guru' 
    : (existingData?.role === 'admin' || isAdminEmail ? 'admin' : 'user');

  const profileData: VerifiedUserProfile = {
    uid: data.uid,
    email: data.email || '',
    displayName: data.displayName || existingData?.displayName || data.email?.split('@')[0] || 'User',
    photoURL: data.photoURL || existingData?.photoURL || '',
    role,
  };

  try {
    await setDoc(userRef, {
      provider: 'google',
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(existingData || {}),
      uid: data.uid,
      email: data.email || '',
      displayName: profileData.displayName,
      photoURL: profileData.photoURL,
      role: profileData.role,
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to save user profile to Firebase /users/{uid}:', err);
  }

  return profileData;
}

export async function syncUserProfile(user: FirebaseUser): Promise<VerifiedUserProfile> {
  return syncUserProfileData({
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL || '',
  });
}

// Authenticate using Google Identity Services (Direct accounts.google.com popup)
function authenticateWithGoogleIdentityServices(): Promise<VerifiedUserProfile> {
  return new Promise((resolve, reject) => {
    const oAuthClientId = config.oAuthClientId;
    const google = typeof window !== 'undefined' ? (window as any).google : null;

    if (!google?.accounts?.oauth2 || !oAuthClientId) {
      reject(new Error('Google Authentication failed. Please select a valid Google Account.'));
      return;
    }

    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: oAuthClientId,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: async (tokenResponse: any) => {
          if (!tokenResponse || tokenResponse.error || !tokenResponse.access_token) {
            // User closed popup or cancelled
            reject(new Error('Google Authentication failed. Please select a valid Google Account.'));
            return;
          }

          try {
            // Fetch verified user profile directly from Google OAuth API
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });

            if (!userInfoRes.ok) {
              reject(new Error('Google Authentication failed. Please select a valid Google Account.'));
              return;
            }

            const userInfo = await userInfoRes.json();
            if (!userInfo || !userInfo.sub) {
              reject(new Error('Google Authentication failed. Please select a valid Google Account.'));
              return;
            }

            // Sync with Firebase Auth credential if available
            try {
              const credential = GoogleAuthProvider.credential(null, tokenResponse.access_token);
              await signInWithCredential(auth, credential);
            } catch (credErr) {
              console.warn('Firebase signInWithCredential note:', credErr);
            }

            // Sync verified profile to Firebase Firestore /users/{uid}
            const profile = await syncUserProfileData({
              uid: userInfo.sub,
              email: userInfo.email || '',
              displayName: userInfo.name || userInfo.email?.split('@')[0] || 'User',
              photoURL: userInfo.picture || '',
            });

            resolve(profile);
          } catch (fetchErr) {
            reject(new Error('Google Authentication failed. Please select a valid Google Account.'));
          }
        },
        error_callback: () => {
          reject(new Error('Google Authentication failed. Please select a valid Google Account.'));
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      reject(new Error('Google Authentication failed. Please select a valid Google Account.'));
    }
  });
}

// STRICT GOOGLE POP-UP AUTHENTICATION:
// Attempts Firebase signInWithPopup; if cross-origin iframe network fails,
// seamlessly opens Google Identity Services popup on accounts.google.com!
// If user cancels or closes, rejects immediately without any mock fallback.
export async function authenticateGoogleWithPopup(): Promise<VerifiedUserProfile> {
  try {
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
    const result = await signInWithPopup(auth, googleProvider);
    if (result && result.user) {
      return await syncUserProfile(result.user);
    }
  } catch (firebaseErr: any) {
    console.warn('Firebase signInWithPopup error code:', firebaseErr?.code || firebaseErr);

    // If user explicitly closed or cancelled the popup: DO NOT FALL BACK, REJECT IMMEDIATELY!
    if (
      firebaseErr?.code === 'auth/popup-closed-by-user' ||
      firebaseErr?.code === 'auth/cancelled-popup-request' ||
      firebaseErr?.code === 'auth/user-cancelled'
    ) {
      throw new Error('Google Authentication failed. Please select a valid Google Account.');
    }

    // If network-request-failed happened due to iframe cross-origin restrictions on firebaseapp.com:
    // Execute direct Google Account OAuth popup on accounts.google.com
    return await authenticateWithGoogleIdentityServices();
  }

  throw new Error('Google Authentication failed. Please select a valid Google Account.');
}

// Helper functions for Gurus
export async function syncGurusFromFirestore(): Promise<any[]> {
  const map = new Map<string, any>();
  try {
    const snap = await getDocs(collection(db, GURUS_COLLECTION));
    snap.forEach((d) => map.set(d.id, { ...d.data(), id: d.id }));
  } catch (err) {
    console.warn('Failed to fetch gurus from Firestore, trying API fallback:', err);
  }

  // Also query API store to ensure no device is left behind
  try {
    const res = await fetch('/api/gurus');
    if (res.ok) {
      const serverGurus = await res.json();
      if (Array.isArray(serverGurus)) {
        serverGurus.forEach((g: any) => {
          if (!map.has(g.id)) map.set(g.id, g);
        });
      }
    }
  } catch (e) {}

  return Array.from(map.values());
}

export async function saveGuruToFirestore(guru: any): Promise<void> {
  if (!guru.id) return;
  try {
    await setDoc(doc(db, GURUS_COLLECTION, guru.id), guru, { merge: true });
  } catch (err) {
    console.warn('Firestore guru write warning:', err);
  }

  // Mirror to server API
  try {
    const current = await syncGurusFromFirestore();
    const updated = [guru, ...current.filter((g) => g.id !== guru.id)];
    await fetch('/api/gurus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  } catch (e) {}
}

// Helper functions for Guru Applications
export async function syncApplicationsFromFirestore(): Promise<any[]> {
  const map = new Map<string, any>();

  // 1. Fetch live from Firestore collection /guru_applications
  try {
    const snap = await getDocs(collection(db, GURU_APPLICATIONS_COLLECTION));
    snap.forEach((d) => map.set(d.id, { ...d.data(), id: d.id }));
  } catch (err) {
    console.warn('Failed to fetch applications from Firestore:', err);
  }

  // 2. Also check backend API store to guarantee cross-device sync
  try {
    const res = await fetch('/api/guru_applications');
    if (res.ok) {
      const serverApps = await res.json();
      if (Array.isArray(serverApps)) {
        serverApps.forEach((a: any) => {
          if (!map.has(a.id)) {
            map.set(a.id, a);
            // Sync forward into Firestore so it stays in both
            setDoc(doc(db, GURU_APPLICATIONS_COLLECTION, a.id), a, { merge: true }).catch(() => {});
          }
        });
      }
    }
  } catch (e) {}

  return Array.from(map.values());
}

export async function saveApplicationToFirestore(appData: any): Promise<void> {
  if (!appData.id) return;

  // 1. Write directly to Firestore /guru_applications
  try {
    await setDoc(doc(db, GURU_APPLICATIONS_COLLECTION, appData.id), appData, { merge: true });
  } catch (err) {
    console.warn('Failed to save application to Firestore:', err);
  }

  // 2. Also save to server backend API immediately
  try {
    await fetch('/api/guru_applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData),
    });
  } catch (e) {}
}

export async function deleteApplicationFromFirestore(appId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, GURU_APPLICATIONS_COLLECTION, appId));
  } catch (err) {
    console.warn('Failed to delete application from Firestore:', err);
  }

  try {
    await fetch(`/api/guru_applications/${appId}`, { method: 'DELETE' });
  } catch (e) {}
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
