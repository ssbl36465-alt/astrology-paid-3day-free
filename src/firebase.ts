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
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue,
  get,
  child,
  type Database
} from 'firebase/database';
import config from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  databaseURL: config.projectId ? `https://${config.projectId}-default-rtdb.firebaseio.com` : undefined,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Realtime Database setup
const defaultRtdbUrl = config.projectId ? `https://${config.projectId}-default-rtdb.firebaseio.com` : '';
let rtdbInstance: Database | null = null;
try {
  rtdbInstance = defaultRtdbUrl ? getDatabase(app, defaultRtdbUrl) : getDatabase(app);
} catch (e) {
  try {
    rtdbInstance = getDatabase(app);
  } catch (err2) {
    console.warn('Realtime Database initialization note:', err2);
  }
}
export const rtdb = rtdbInstance;
export { ref, push, set, update, remove, onValue, get, child };

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

// -------------------------------------------------------------
// FIREBASE REALTIME DATABASE & FIRESTORE GURU LOGIC (ZERO LOCALSTORAGE)
// -------------------------------------------------------------

// 1. When a Guru registers, immediately write to Firebase Cloud Firestore /guru_applications
export async function registerGuruApplication(applicationData: any): Promise<string> {
  const timestamp = new Date().toISOString();
  const appId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const finalRecord = {
    ...applicationData,
    id: appId,
    createdAt: timestamp,
    createdAtIso: timestamp,
    status: 'pending',
  };

  // 1. PRIMARY: Write directly to Google Cloud Firestore (guarantees cross-device sync across all phones/tablets/PCs)
  try {
    await setDoc(doc(db, GURU_APPLICATIONS_COLLECTION, appId), finalRecord, { merge: true });
  } catch (fsErr) {
    console.warn('Firestore app write warning:', fsErr);
  }

  // 2. SECONDARY: Broadcast to RTDB if available (non-blocking)
  if (rtdb) {
    try {
      set(ref(rtdb, `guru_applications/${appId}`), finalRecord).catch(() => {});
    } catch (rtdbErr) {}
  }

  // 3. SECONDARY: Sync to local server API (non-blocking)
  try {
    fetch('/api/guru_applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalRecord),
    }).catch(() => {});
  } catch (apiErr) {}

  return appId;
}

// 2. Admin Panel MUST read /guru_applications directly using live Cloud Firestore listener
export function listenToGuruApplications(callback: (apps: any[]) => void): () => void {
  const unsubs: (() => void)[] = [];
  const appsMap = new Map<string, any>();

  const notify = () => {
    const list = Array.from(appsMap.values()).sort((a, b) => {
      const tA = new Date(a.createdAt || a.createdAtIso || 0).getTime();
      const tB = new Date(b.createdAt || b.createdAtIso || 0).getTime();
      return tB - tA;
    });
    callback(list);
  };

  // 1. PRIMARY: Real-time Cloud Firestore listener (delivers updates instantly to all devices)
  try {
    const fsUnsub = onSnapshot(collection(db, GURU_APPLICATIONS_COLLECTION), (snap) => {
      snap.forEach((d) => {
        const data = d.data();
        appsMap.set(d.id, { ...data, id: d.id });
      });
      notify();
    }, (err) => {
      console.warn('Firestore onSnapshot guru_applications warning:', err);
    });
    unsubs.push(fsUnsub);
  } catch (e) {
    console.warn('Firestore attach error:', e);
  }

  // 2. Immediate direct fetch from Firestore
  getDocs(collection(db, GURU_APPLICATIONS_COLLECTION))
    .then((snap) => {
      if (!snap.empty) {
        snap.forEach((d) => {
          appsMap.set(d.id, { ...d.data(), id: d.id });
        });
        notify();
      }
    })
    .catch((err) => console.warn('Direct getDocs apps error:', err));

  // 3. Optional RTDB listener if connected
  if (rtdb) {
    try {
      const appsRef = ref(rtdb, 'guru_applications');
      const rtdbUnsub = onValue(appsRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            Object.keys(val).forEach((key) => {
              const item = val[key];
              const id = item.id || key;
              appsMap.set(id, { ...item, id });
            });
            notify();
          }
        }
      }, () => {});
      unsubs.push(() => rtdbUnsub());
    } catch (e) {}
  }

  return () => {
    unsubs.forEach((u) => {
      try { u(); } catch (e) {}
    });
  };
}

// 3. When Admin approves, update status in Firebase /guru_applications and write profile to /gurus
export async function approveGuruApplication(appId: string, guruProfile: any): Promise<void> {
  const guruId = guruProfile.id || appId.replace('app-', 'guru-');
  const updatedGuru = {
    ...guruProfile,
    id: guruId,
    status: 'approved',
    adminStatus: guruProfile.adminStatus || 'active',
    updatedAt: new Date().toISOString(),
  };

  // 1. PRIMARY: Write directly to Cloud Firestore
  try {
    await setDoc(doc(db, GURU_APPLICATIONS_COLLECTION, appId), { status: 'approved' }, { merge: true });
    await setDoc(doc(db, GURUS_COLLECTION, guruId), updatedGuru, { merge: true });
    await setUserRole(guruId, 'guru', { guruId, name: guruProfile.name, status: 'approved' });
  } catch (fsErr) {
    console.warn('Firestore approve sync warning:', fsErr);
  }

  // 2. SECONDARY: Update in RTDB
  if (rtdb) {
    try {
      update(ref(rtdb, `guru_applications/${appId}`), { status: 'approved' }).catch(() => {});
      set(ref(rtdb, `gurus/${guruId}`), updatedGuru).catch(() => {});
    } catch (rtdbErr) {}
  }

  // 3. SECONDARY: Update in backend API
  try {
    fetch('/api/guru_applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: appId, status: 'approved' }),
    }).catch(() => {});
    fetch('/api/gurus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([updatedGuru]),
    }).catch(() => {});
  } catch (apiErr) {}
}

// 4. Client Guru List MUST read directly from Firebase Cloud Firestore /gurus
export function listenToGurus(callback: (gurus: any[]) => void): () => void {
  const unsubs: (() => void)[] = [];
  const gurusMap = new Map<string, any>();

  const notify = () => {
    callback(Array.from(gurusMap.values()));
  };

  // 1. PRIMARY: Live listener on Cloud Firestore /gurus
  try {
    const fsUnsub = onSnapshot(collection(db, GURUS_COLLECTION), (snap) => {
      snap.forEach((d) => {
        const data = d.data();
        gurusMap.set(d.id, { ...data, id: d.id });
      });
      notify();
    }, (err) => {
      console.warn('Firestore onSnapshot gurus warning:', err);
    });
    unsubs.push(fsUnsub);
  } catch (e) {
    console.warn('Firestore attach error:', e);
  }

  // 2. Immediate direct fetch from Firestore
  getDocs(collection(db, GURUS_COLLECTION))
    .then((snap) => {
      if (!snap.empty) {
        snap.forEach((d) => {
          gurusMap.set(d.id, { ...d.data(), id: d.id });
        });
        notify();
      }
    })
    .catch((err) => console.warn('Direct getDocs gurus error:', err));

  // 3. Optional RTDB listener if connected
  if (rtdb) {
    try {
      const gurusRef = ref(rtdb, 'gurus');
      const rtdbUnsub = onValue(gurusRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            Object.keys(val).forEach((key) => {
              const item = val[key];
              const id = item.id || key;
              gurusMap.set(id, { ...item, id });
            });
            notify();
          }
        }
      }, () => {});
      unsubs.push(() => rtdbUnsub());
    } catch (e) {}
  }

  return () => {
    unsubs.forEach((u) => {
      try { u(); } catch (e) {}
    });
  };
}

export async function deleteGuruApplicationFromFirebase(appId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, GURU_APPLICATIONS_COLLECTION, appId));
  } catch (e) {
    console.warn('Firestore delete error:', e);
  }
  if (rtdb) {
    try {
      remove(ref(rtdb, `guru_applications/${appId}`)).catch(() => {});
    } catch (e) {}
  }
  try {
    fetch(`/api/guru_applications/${appId}`, { method: 'DELETE' }).catch(() => {});
  } catch (e) {}
}

export async function saveGuruToFirebase(guru: any): Promise<void> {
  if (!guru.id) return;
  try {
    await setDoc(doc(db, GURUS_COLLECTION, guru.id), guru, { merge: true });
  } catch (e) {
    console.warn('Firestore save guru error:', e);
  }
  if (rtdb) {
    try {
      set(ref(rtdb, `gurus/${guru.id}`), guru).catch(() => {});
    } catch (e) {}
  }
  try {
    fetch('/api/gurus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([guru]),
    }).catch(() => {});
  } catch (e) {}
}

export async function deleteGuruFromFirebase(guruId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, GURUS_COLLECTION, guruId));
  } catch (e) {}
  if (rtdb) {
    try {
      remove(ref(rtdb, `gurus/${guruId}`)).catch(() => {});
    } catch (e) {}
  }
}

// Backward compatible aliases
export const saveGuruToFirestore = saveGuruToFirebase;
export const saveApplicationToFirestore = registerGuruApplication;
export const deleteApplicationFromFirestore = deleteGuruApplicationFromFirebase;

export const syncGurusFromFirestore = async (): Promise<any[]> => {
  try {
    const snap = await getDocs(collection(db, GURUS_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
    }
  } catch (err) {
    console.warn('syncGurusFromFirestore error:', err);
  }
  try {
    const res = await fetch('/api/gurus');
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
};

export const syncApplicationsFromFirestore = async (): Promise<any[]> => {
  try {
    const snap = await getDocs(collection(db, GURU_APPLICATIONS_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
    }
  } catch (err) {
    console.warn('syncApplicationsFromFirestore error:', err);
  }
  try {
    const res = await fetch('/api/guru_applications');
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
};

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
