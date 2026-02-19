import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ─── Auth helpers ────────────────────────────────────────────────────────────
export async function signUp(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  // Initialize user document in Firestore
  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    displayName,
    createdAt: Date.now(),
    checks: {},
    accounts: [],
    threats: [],
    monitors: [],
    scanLog: [],
    irChecks: {},
    settings: { notifs: true, autoScan: false },
  });
  return cred.user;
}

export async function logIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logOut() {
  await signOut(auth);
}

export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ─── Firestore helpers ───────────────────────────────────────────────────────
export async function loadUserData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveUserData(uid, field, value) {
  try {
    await updateDoc(doc(db, "users", uid), { [field]: value });
  } catch (e) {
    // If doc doesn't exist yet, create it
    if (e.code === "not-found") {
      await setDoc(doc(db, "users", uid), { [field]: value }, { merge: true });
    }
  }
}

// ─── Subscription helpers ───────────────────────────────────────────────────
export async function saveSubscription(uid, subscriptionData) {
  await setDoc(doc(db, "users", uid), { subscription: subscriptionData }, { merge: true });
}

export async function loadSubscription(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) {
    return snap.data().subscription || null;
  }
  return null;
}
