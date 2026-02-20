import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase config is present (env vars set during build)
const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

// Initialize Firebase safely — if env vars are missing, the app still loads
let app = null;
let auth = null;
let db = null;
let firebaseError = null;

try {
  if (!hasConfig) {
    throw new Error("Firebase environment variables are not configured. Add VITE_FIREBASE_* to your Vercel environment variables and redeploy.");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  firebaseError = e.message || "Firebase failed to initialize";
  console.error("Firebase init error:", e);
}

export { auth, db, firebaseError };

// ─── Auth helpers ────────────────────────────────────────────────────────────
export async function signUp(email, password, displayName, promoCode) {
  if (!auth) throw new Error("Firebase not configured");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });

  // Check if promo code grants free access
  const validPromo = import.meta.env.VITE_PROMO_CODE;
  const promoValid = promoCode && validPromo && promoCode.trim().toLowerCase() === validPromo.trim().toLowerCase();

  const userData = {
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
  };

  // If valid promo code, auto-activate subscription (free access)
  if (promoValid) {
    userData.promoCode = promoCode.trim();
    userData.subscription = {
      status: "active",
      plan: "promo",
      amount: 0,
      currency: "USD",
      subscribedAt: new Date().toISOString(),
      provider: "promo_code",
      promoCode: promoCode.trim(),
    };
  }

  // Initialize user document in Firestore
  await setDoc(doc(db, "users", cred.user.uid), userData);
  return { user: cred.user, subscription: userData.subscription || null };
}

export async function logIn(email, password) {
  if (!auth) throw new Error("Firebase not configured");
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logOut() {
  if (!auth) return;
  await signOut(auth);
}

export function onAuth(callback) {
  if (!auth) {
    // If Firebase isn't available, immediately call back with null user
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ─── Firestore helpers ───────────────────────────────────────────────────────
export async function loadUserData(uid) {
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveUserData(uid, field, value) {
  if (!db) return;
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
  if (!db) return;
  await setDoc(doc(db, "users", uid), { subscription: subscriptionData }, { merge: true });
}

export async function loadSubscription(uid) {
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) {
    return snap.data().subscription || null;
  }
  return null;
}

// ─── Admin helpers ──────────────────────────────────────────────────────────
export async function getAllUsers() {
  if (!db) return [];
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function adminDeleteUser(uid) {
  if (!db) return;
  await deleteDoc(doc(db, "users", uid));
}

export async function adminUpdateUser(uid, data) {
  if (!db) return;
  await setDoc(doc(db, "users", uid), data, { merge: true });
}
