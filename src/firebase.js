import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAn_QZCMF4aQyXtPHAJqDLHa1tQcOqZDWA",
  authDomain: "agentslock-3221b.firebaseapp.com",
  projectId: "agentslock-3221b",
  storageBucket: "agentslock-3221b.firebasestorage.app",
  messagingSenderId: "648882538183",
  appId: "1:648882538183:web:85fe9a803870a94bfb20e2",
  measurementId: "G-H3M3R1FECE",
};

// Initialize Firebase
let app = null;
let auth = null;
let db = null;
let firebaseError = null;

try {
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

export async function logInWithGoogle() {
  if (!auth) throw new Error("Firebase not configured");
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  // Ensure Firestore user doc exists for Google sign-in users
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  if (!snap.exists()) {
    await setDoc(doc(db, "users", cred.user.uid), {
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email.split("@")[0],
      createdAt: Date.now(),
      checks: {},
      accounts: [],
      threats: [],
      monitors: [],
      scanLog: [],
      irChecks: {},
      settings: { notifs: true, autoScan: false },
    });
  }
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
  if (!auth) throw new Error("Firebase not configured");

  // Get the current user's ID token for authorization
  const token = await auth.currentUser.getIdToken();

  // Call the Vercel API route to delete from both Auth + Firestore
  const res = await fetch("/api/admin-delete-user", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ uid }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete user");
  return data;
}

export async function adminUpdateUser(uid, data) {
  if (!db) return;
  await setDoc(doc(db, "users", uid), data, { merge: true });
}
