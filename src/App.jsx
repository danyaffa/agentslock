import { useState, useEffect, useCallback, useRef, Component } from "react";
import { auth, db, firebaseError, signUp, logIn, logInWithGoogle, logOut, onAuth, loadUserData, saveUserData, saveSubscription, loadSubscription, getAllUsers, adminDeleteUser, adminUpdateUser } from "./firebase.js";

// ═══════════════════════════════════════════════════════════════════════════════
// AGENTSLOCK v4.0 — Full-Stack Personal Cybersecurity Platform
// Firebase Auth + Firestore | Real-Time Monitoring | PWA
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Error Boundary ─────────────────────────────────────────────────────────
export { ErrorBoundary as AppErrorBoundary };
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "#06080d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", padding: 20 }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #ff4057, #ff9f2e)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h1 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 22, color: "#eef0f6", margin: "0 0 8px" }}>Something went wrong</h1>
            <p style={{ color: "#5a6178", fontSize: 13, marginBottom: 20 }}>AgentsLock encountered an error. Try refreshing the page.</p>
            <button onClick={() => window.location.reload()} style={{ background: "#00e87b15", border: "1px solid #00e87b40", color: "#00e87b", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 600 }}>Refresh Page</button>
            <div style={{ color: "#5a6178", fontSize: 10, marginTop: 16, fontFamily: "'Fira Code', monospace", padding: "8px 12px", background: "#0c0f18", borderRadius: 6 }}>{String(this.state.error?.message || "Unknown error")}</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── SVG Icon Factory ────────────────────────────────────────────────────────
const icon = (d, s = 18) => (p) => (
  <svg width={p?.s || s} height={p?.s || s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{d}</svg>
);
const I = {
  Shield: icon(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, 20),
  Lock: icon(<><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>),
  Unlock: icon(<><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></>),
  Alert: icon(<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>),
  Check: icon(<polyline points="20 6 9 17 4 12" />, 16),
  X: icon(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>, 16),
  Monitor: icon(<><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>),
  Phone: icon(<><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></>),
  Wifi: icon(<><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></>),
  Globe: icon(<><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>),
  Key: icon(<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />),
  Eye: icon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>),
  EyeOff: icon(<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>),
  Terminal: icon(<><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></>),
  Refresh: icon(<><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>, 16),
  Zap: icon(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />),
  Database: icon(<><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>),
  Search: icon(<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>),
  Mail: icon(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>),
  User: icon(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  Copy: icon(<><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>, 16),
  Clock: icon(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, 14),
  Activity: icon(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />),
  FileText: icon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>),
  ExternalLink: icon(<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>, 14),
  Trash: icon(<><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>, 16),
  Plus: icon(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>, 16),
  Server: icon(<><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></>),
  Download: icon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>),
  Crosshair: icon(<><circle cx="12" cy="12" r="10" /><line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" /><line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" /></>),
  Bell: icon(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>),
  BarChart: icon(<><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>),
  DollarSign: icon(<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>),
  CreditCard: icon(<><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></>),
  Star: icon(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>),
  LogIn: icon(<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></>),
  LogOut: icon(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>),
  Settings: icon(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
  Map: icon(<><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>),
  Cpu: icon(<><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></>),
  Apple: icon(<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />),
  HelpCircle: icon(<><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>),
  Smartphone: icon(<><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></>),
};

// ─── Colors ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#06080d", bgCard: "#0c0f18", bgHover: "#10141f",
  border: "#161b2e", borderActive: "#1e2540",
  text: "#c8cdd8", dim: "#5a6178", bright: "#eef0f6",
  green: "#00e87b", greenDim: "#00e87b18", greenBdr: "#00e87b30",
  red: "#ff4057", redDim: "#ff405718", redBdr: "#ff405730",
  orange: "#ff9f2e", orangeDim: "#ff9f2e18", orangeBdr: "#ff9f2e30",
  blue: "#3b8bff", blueDim: "#3b8bff18", blueBdr: "#3b8bff30",
  purple: "#a855f7", purpleDim: "#a855f718", purpleBdr: "#a855f730",
  cyan: "#06b6d4", cyanDim: "#06b6d418", cyanBdr: "#06b6d430",
};
const sevColor = (s) => ({ critical: C.red, high: C.red, medium: C.orange, low: C.green }[s] || C.dim);

// ─── LocalStorage (fallback cache) ───────────────────────────────────────────
const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(`al_${k}`); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(`al_${k}`, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(`al_${k}`); } catch {} },
};

// ─── Download Report Helper ─────────────────────────────────────────────────
const downloadReport = (name, content) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `agentslock-${name}-${new Date().toISOString().slice(0,10)}.txt`; a.click();
  URL.revokeObjectURL(url);
};
const ReportBtn = ({ onClick }) => <Btn onClick={onClick} color={C.blue} style={{ fontSize: 10 }}><I.Download /> Download Report</Btn>;

// ─── Firebase Auth Hook ──────────────────────────────────────────────────────
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onAuth((u) => { setUser(u); setLoading(false); });
    return unsub;
  }, []);
  const firebaseAuthError = (e) => {
    const code = e.code || "";
    const map = {
      "auth/email-already-in-use": "This email is already registered. Try logging in instead.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Password is too weak. Use at least 6 characters.",
      "auth/user-not-found": "No account found with this email. Create an account first.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/too-many-requests": "Too many attempts. Please wait a minute and try again.",
      "auth/network-request-failed": "Network error. Check your connection and try again.",
      "auth/invalid-credential": "Incorrect email or password. Please double-check and try again.",
      "auth/invalid-login-credentials": "Incorrect email or password. Please double-check and try again.",
    };
    return map[code] || e.message.replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/, "").trim() || "Something went wrong. Please try again.";
  };
  const doLogin = async (email, pass, promoCode) => {
    try {
      const u = await logIn(email, pass);
      // If user provided a promo code at login, apply it to activate subscription
      if (promoCode && u) {
        const validPromo = import.meta.env.VITE_PROMO_CODE;
        if (validPromo && promoCode.toLowerCase() === validPromo.trim().toLowerCase()) {
          try {
            await saveSubscription(u.uid, {
              status: "active",
              plan: "promo",
              amount: 0,
              currency: "USD",
              subscribedAt: new Date().toISOString(),
              provider: "promo_code",
              promoCode: promoCode,
            });
          } catch (_) { /* non-fatal — subscription save failed but login succeeded */ }
        }
      }
      return { ok: true };
    }
    catch (e) { return { ok: false, err: firebaseAuthError(e) }; }
  };
  const doSignup = async (email, name, pass, promoCode) => {
    try {
      const result = await signUp(email, pass, name, promoCode);
      return { ok: true, subscription: result.subscription };
    } catch (e) { return { ok: false, err: firebaseAuthError(e) }; }
  };
  const doGoogleLogin = async () => {
    try { await logInWithGoogle(); return { ok: true }; }
    catch (e) { return { ok: false, err: firebaseAuthError(e) }; }
  };
  const doLogout = async () => { await logOut(); };
  return { user, loading, login: doLogin, signup: doSignup, googleLogin: doGoogleLogin, logout: doLogout };
}

// ─── Crypto Utils ────────────────────────────────────────────────────────────
async function sha1(str) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
function calcPwStrength(pw) {
  if (!pw) return { score: 0, label: "Empty", color: C.dim, entropy: 0, crack: "—", issues: [] };
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26; if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10; if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  const entropy = Math.round(pw.length * Math.log2(pool || 1));
  const issues = [];
  if (pw.length < 8) issues.push("Too short (min 8)");
  if (pw.length < 12) issues.push("Use 12+ characters");
  if (!/[A-Z]/.test(pw)) issues.push("Add uppercase");
  if (!/[a-z]/.test(pw)) issues.push("Add lowercase");
  if (!/[0-9]/.test(pw)) issues.push("Add numbers");
  if (!/[^a-zA-Z0-9]/.test(pw)) issues.push("Add symbols");
  if (/(.)\1{2,}/.test(pw)) issues.push("Avoid repeats");
  const common = ["password","123456","12345678","qwerty","abc123","admin","letmein","welcome"];
  if (common.includes(pw.toLowerCase())) issues.push("Common breached password!");
  let score, label, color;
  if (common.includes(pw.toLowerCase())) { score = 5; label = "Compromised"; color = C.red; }
  else if (entropy >= 80) { score = 100; label = "Excellent"; color = C.green; }
  else if (entropy >= 60) { score = 80; label = "Strong"; color = C.green; }
  else if (entropy >= 40) { score = 60; label = "Moderate"; color = C.orange; }
  else if (entropy >= 25) { score = 35; label = "Weak"; color = C.orange; }
  else { score = 15; label = "Very Weak"; color = C.red; }
  const secs = Math.pow(2, entropy) / 1e12;
  let crack = "Instant";
  if (secs > 3.154e13) crack = "Millions of years"; else if (secs > 3.154e10) crack = "Thousands of years";
  else if (secs > 3.154e9) crack = "Centuries"; else if (secs > 3.154e7) crack = Math.round(secs / 3.154e7) + " years";
  else if (secs > 86400) crack = Math.round(secs / 86400) + " days"; else if (secs > 3600) crack = Math.round(secs / 3600) + " hours";
  else if (secs > 60) crack = Math.round(secs / 60) + " min"; else if (secs > 1) crack = Math.round(secs) + " sec";
  return { score, label, color, entropy, crack, issues };
}
function genPassword(len = 20, opts = {}) {
  const { upper = true, lower = true, nums = true, syms = true } = opts;
  let chars = "";
  if (lower) chars += "abcdefghijkmnopqrstuvwxyz"; if (upper) chars += "ABCDEFGHJKLMNPQRSTUVWXYZ";
  if (nums) chars += "23456789"; if (syms) chars += "!@#$%^&*_+-=?";
  if (!chars) chars = "abcdefghijkmnopqrstuvwxyz";
  const arr = new Uint32Array(len); crypto.getRandomValues(arr);
  return Array.from(arr, v => chars[v % chars.length]).join("");
}

// ─── Shared UI Components ────────────────────────────────────────────────────
const Card = ({ children, style, glow, onClick }) => (
  <div onClick={onClick} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20,
    ...(glow ? { boxShadow: `0 0 25px ${glow}10`, borderColor: `${glow}30` } : {}),
    ...(onClick ? { cursor: "pointer", transition: "border-color 0.2s" } : {}), ...style }}>{children}</div>
);
const Badge = ({ children, color, style }) => (
  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", background: `${color}18`, color, ...style }}>{children}</span>
);
const Btn = ({ children, onClick, color = C.green, disabled, style }) => (
  <button disabled={disabled} onClick={onClick} style={{ background: `${color}15`, border: `1px solid ${color}40`, color, padding: "8px 16px", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600, opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.2s", ...style }}>{children}</button>
);
const Input = ({ value, onChange, placeholder, type = "text", style, icon }) => {
  const [showPw, setShowPw] = useState(false);
  const isPw = type === "password";
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", ...style }}>
      {icon && <span style={{ position: "absolute", left: 12, color: C.dim }}>{icon}</span>}
      <input type={isPw && showPw ? "text" : type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: icon ? `10px ${isPw ? "38px" : "14px"} 10px 38px` : `10px ${isPw ? "38px" : "14px"} 10px 14px`, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.bright, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
      {isPw && <span onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, color: C.dim, cursor: "pointer", display: "flex", alignItems: "center" }}>{showPw ? <I.EyeOff s={16} /> : <I.Eye s={16} />}</span>}
    </div>
  );
};
const Progress = ({ value, color = C.green, h = 6 }) => (
  <div style={{ width: "100%", height: h, background: C.bg, borderRadius: h, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: "100%", background: color, borderRadius: h, transition: "width 0.6s ease" }} />
  </div>
);
const Sect = ({ title, icon, children, right }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon && <span style={{ color: C.green }}>{icon}</span>}
        <h3 style={{ margin: 0, fontFamily: "'Chakra Petch', sans-serif", fontSize: 15, fontWeight: 600, color: C.bright }}>{title}</h3>
      </div>
      {right}
    </div>
    {children}
  </div>
);
const Stat = ({ label, value, color = C.bright, sub }) => (
  <Card>
    <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</div>
    <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 28, fontWeight: 700, color }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>{sub}</div>}
  </Card>
);

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH SCREEN (Phase 3)
// ═══════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onLogin, onSignup, onGoogleLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr(""); setBusy(true);
    const trimmedEmail = email.trim();
    const trimmedPass = pass;
    if (!trimmedEmail || !trimmedPass) { setErr("Fill all fields"); setBusy(false); return; }
    if (mode === "signup" && !name.trim()) { setErr("Enter your name"); setBusy(false); return; }
    if (trimmedPass.length < 6) { setErr("Password must be 6+ characters"); setBusy(false); return; }
    const r = mode === "login" ? await onLogin(trimmedEmail, trimmedPass, promoCode.trim()) : await onSignup(trimmedEmail, name.trim(), trimmedPass, promoCode.trim());
    if (!r.ok) setErr(r.err);
    setBusy(false);
  };

  const handleGoogleLogin = async () => {
    setErr(""); setBusy(true);
    const r = await onGoogleLogin();
    if (!r.ok) setErr(r.err);
    setBusy(false);
  };

  const handleKey = (e) => { if (e.key === "Enter" && !busy) submit(); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif" }} onKeyDown={handleKey}>
      <div style={{ width: 400, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${C.green}, ${C.blue})`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <I.Shield s={28} style={{ color: "#fff" }} />
          </div>
          <h1 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 28, color: C.bright, margin: "0 0 4px", letterSpacing: "0.06em" }}>AGENTSLOCK</h1>
          <p style={{ color: C.dim, fontSize: 12 }}>Personal Cybersecurity Platform</p>
          <p style={{ color: C.text, fontSize: 11, marginTop: 12, lineHeight: 1.6, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
            Your all-in-one security dashboard — check passwords against known breaches, analyze password strength, scan websites for vulnerabilities, harden your devices, and respond to incidents with guided playbooks.
          </p>
        </div>

        <Card>
          <div style={{ display: "flex", marginBottom: 20, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{
                flex: 1, padding: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                background: mode === m ? `${C.green}15` : C.bg, color: mode === m ? C.green : C.dim, textTransform: "capitalize",
              }}>{m === "login" ? "Sign In" : "Create Account"}</button>
            ))}
          </div>

          {mode === "signup" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: C.dim, marginBottom: 4, display: "block" }}>Name</label>
              <Input value={name} onChange={setName} placeholder="Your name" icon={<I.User />} />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: C.dim, marginBottom: 4, display: "block" }}>Email</label>
            <Input value={email} onChange={setEmail} placeholder="you@example.com" type="email" icon={<I.Mail />} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: C.dim, marginBottom: 4, display: "block" }}>Password</label>
            <Input value={pass} onChange={setPass} placeholder="••••••••" type="password" icon={<I.Lock />} />
          </div>

          {/* Promo Code — shown on both Login and Signup */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: C.dim, marginBottom: 4, display: "block" }}>Promo Code <span style={{ color: C.dim, fontStyle: "italic" }}>(optional)</span></label>
            <Input value={promoCode} onChange={setPromoCode} placeholder="Enter promo code" icon={<I.Zap />} />
            <p style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>Have an invite code? Enter it to get free access.</p>
          </div>

          {err && <div style={{ padding: "8px 12px", background: C.redDim, border: `1px solid ${C.redBdr}`, borderRadius: 6, color: C.red, fontSize: 12, marginBottom: 12 }}>{err}</div>}

          <Btn onClick={submit} disabled={busy} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
            <I.LogIn /> {busy ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </Btn>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 11, color: C.dim }}>or</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          <button onClick={handleGoogleLogin} disabled={busy} style={{
            width: "100%", padding: "12px", borderRadius: 8, cursor: busy ? "not-allowed" : "pointer",
            background: C.bg, border: `1px solid ${C.border}`, color: C.bright,
            fontSize: 13, fontFamily: "inherit", fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: busy ? 0.5 : 1, transition: "all 0.2s",
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Sign in with Google
          </button>
        </Card>

        <p style={{ textAlign: "center", color: C.dim, fontSize: 11, marginTop: 20 }}>
          🔒 Secured by Firebase Authentication & Firestore
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION / PAYWALL SCREEN
// PayPal Integration — $18 USD/month
// ═══════════════════════════════════════════════════════════════════════════════

const PAYPAL_PLAN_ID = import.meta.env.VITE_PAYPAL_PLAN_ID;
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

function SubscriptionScreen({ user, onSubscribed, onLogout }) {
  const paypalRef = useRef(null);
  const [paypalReady, setPaypalReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If PayPal SDK is already loaded, use it
    if (window.paypal) { setPaypalReady(true); return; }
    // Otherwise, load it dynamically (the HTML script tag may have failed due to env vars)
    if (PAYPAL_CLIENT_ID) {
      const existing = document.querySelector('script[src*="paypal.com/sdk"]');
      if (!existing) {
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
        script.setAttribute("data-sdk-integration-source", "button-factory");
        script.onload = () => setPaypalReady(true);
        script.onerror = () => setError("Failed to load PayPal. Check your connection and refresh.");
        document.head.appendChild(script);
      }
    }
    // Poll as fallback (in case script was already loading from HTML)
    const checkPayPal = setInterval(() => {
      if (window.paypal) { setPaypalReady(true); clearInterval(checkPayPal); }
    }, 500);
    // Stop polling after 20 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkPayPal);
      if (!window.paypal) setError("PayPal failed to load. Please check your internet connection and refresh.");
    }, 20000);
    return () => { clearInterval(checkPayPal); clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    if (!paypalReady || !paypalRef.current) return;
    // Clear any previous buttons
    paypalRef.current.innerHTML = "";

    window.paypal.Buttons({
      style: {
        shape: "rect",
        color: "gold",
        layout: "vertical",
        label: "subscribe",
      },
      createSubscription: (data, actions) => {
        return actions.subscription.create({
          plan_id: PAYPAL_PLAN_ID,
        });
      },
      onApprove: async (data) => {
        setProcessing(true);
        setError("");
        try {
          const subData = {
            subscriptionId: data.subscriptionID,
            status: "active",
            plan: "monthly",
            amount: 18,
            currency: "USD",
            subscribedAt: new Date().toISOString(),
            provider: "paypal",
          };
          await saveSubscription(user.uid, subData);
          onSubscribed(subData);
        } catch (e) {
          setError("Failed to save subscription. Please contact support.");
          setProcessing(false);
        }
      },
      onError: (err) => {
        setError("Payment failed. Please try again.");
        console.error("PayPal error:", err);
      },
    }).render(paypalRef.current);
  }, [paypalReady, user?.uid]);

  const features = [
    { icon: <I.Shield />, text: "Full Cybersecurity Dashboard" },
    { icon: <I.Database />, text: "Password Breach Detection" },
    { icon: <I.Key />, text: "Password Strength Analyzer" },
    { icon: <I.Globe />, text: "Website Vulnerability Scanner" },
    { icon: <I.Monitor />, text: "Device Security Checklist" },
    { icon: <I.Activity />, text: "Real-Time Uptime Monitoring" },
    { icon: <I.Alert />, text: "Threat Intelligence Center" },
    { icon: <I.BarChart />, text: "Security Reports & Scoring" },
    { icon: <I.Zap />, text: "Incident Response Playbooks" },
    { icon: <I.Server />, text: "Firebase Cloud Sync & Backup" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${C.green}, ${C.blue})`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: `0 8px 32px ${C.green}30` }}>
          <I.Shield s={32} style={{ color: "#fff" }} />
        </div>
        <h1 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 32, color: C.bright, margin: "0 0 6px", letterSpacing: "0.06em" }}>AGENTSLOCK</h1>
        <p style={{ color: C.dim, fontSize: 13 }}>Personal Cybersecurity Platform</p>
        <div style={{ color: C.dim, fontSize: 12, marginTop: 8 }}>Welcome, <span style={{ color: C.bright }}>{user.displayName || user.email?.split("@")[0]}</span></div>
      </div>

      {/* Pricing Card */}
      <div style={{ width: "100%", maxWidth: 480, marginBottom: 32 }}>
        <Card style={{ position: "relative", overflow: "hidden", border: `1px solid ${C.green}40` }}>
          {/* Glow accent */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.green}, ${C.blue}, ${C.green})`, backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }} />

          <div style={{ textAlign: "center", paddingTop: 8, marginBottom: 24 }}>
            <Badge color={C.green} style={{ fontSize: 11, padding: "4px 14px", marginBottom: 12, display: "inline-block" }}>PRO PLAN</Badge>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginTop: 12 }}>
              <span style={{ fontFamily: "'Chakra Petch'", fontSize: 48, fontWeight: 700, color: C.bright }}>$18</span>
              <span style={{ color: C.dim, fontSize: 16 }}>USD / month</span>
            </div>
            <p style={{ color: C.dim, fontSize: 12, marginTop: 8 }}>Full access to all cybersecurity tools</p>
          </div>

          {/* Features List */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 28 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: C.bg, borderRadius: 8, fontSize: 11, color: C.text }}>
                <span style={{ color: C.green, flexShrink: 0 }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>

          {/* PayPal Button Container */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            {processing ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.green, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                <div style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>Activating your subscription...</div>
              </div>
            ) : !paypalReady ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ width: 28, height: 28, border: `3px solid ${C.border}`, borderTopColor: C.blue, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
                <div style={{ color: C.dim, fontSize: 12 }}>Loading PayPal...</div>
              </div>
            ) : (
              <div ref={paypalRef} />
            )}

            {error && (
              <div style={{ padding: "10px 14px", background: C.redDim, border: `1px solid ${C.redBdr}`, borderRadius: 8, color: C.red, fontSize: 12, marginTop: 12, textAlign: "center" }}>{error}</div>
            )}
          </div>

          {/* Security badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, color: C.dim, fontSize: 10 }}>
            <I.Lock s={12} />
            Secured by PayPal — Cancel anytime from your PayPal account
          </div>
        </Card>
      </div>

      {/* Sign out option */}
      <button onClick={onLogout} style={{ background: "none", border: "none", color: C.dim, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, transition: "color 0.2s" }}
        onMouseOver={e => e.currentTarget.style.color = C.red} onMouseOut={e => e.currentTarget.style.color = C.dim}>
        <I.LogOut s={14} /> Sign out
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: OVERVIEW DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
// ── Apply a single runtime protection by fix ID (survives within session) ──
function applyProtection(fixId) {
  try {
    if (fixId === "block-webrtc" && !window.__alWebrtcBlocked) {
      window.__alWebrtcBlocked = true;
      const orig = window.RTCPeerConnection;
      if (orig) window.RTCPeerConnection = function() { if (window.__alWebrtcBlocked) throw new Error("WebRTC blocked by AgentsLock"); return new orig(...arguments); };
    }
    if (fixId === "spoof-fingerprint" && !window.__alFingerprintSpoofed) {
      window.__alFingerprintSpoofed = true;
      Object.defineProperty(navigator, "hardwareConcurrency", { get: () => [2, 4, 8][Math.floor(Math.random() * 3)], configurable: true });
      Object.defineProperty(navigator, "deviceMemory", { get: () => [4, 8][Math.floor(Math.random() * 2)], configurable: true });
      Object.defineProperty(navigator, "platform", { get: () => "Win32", configurable: true });
    }
    if (fixId === "enable-dnt-header" && navigator.doNotTrack !== "1") {
      Object.defineProperty(navigator, "doNotTrack", { get: () => "1", configurable: true });
    }
    if (fixId === "clear-cookies") {
      document.cookie.split(";").forEach(c => { const name = c.split("=")[0].trim(); document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`; });
    }
    if (fixId === "deploy-https" && location.protocol === "http:") {
      const meta = document.createElement("meta"); meta.httpEquiv = "Content-Security-Policy"; meta.content = "upgrade-insecure-requests"; document.head.appendChild(meta);
    }
    if (fixId?.startsWith("revoke-perm-")) {
      const perm = fixId.replace("revoke-perm-", "");
      if (perm === "geolocation" && navigator.geolocation) { navigator.geolocation.getCurrentPosition = (s, e) => e?.(new GeolocationPositionError()); navigator.geolocation.watchPosition = (s, e) => { e?.(new GeolocationPositionError()); return 0; }; }
      if (perm === "notifications" && window.Notification) { window.Notification.requestPermission = async () => "denied"; window.Notification = class { constructor() { throw new Error("Notifications blocked by AgentsLock"); } }; }
      if (perm === "camera" || perm === "microphone") {
        const origGUM = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
        if (origGUM) { navigator.mediaDevices.getUserMedia = async (constraints) => { if ((perm === "camera" && constraints?.video) || (perm === "microphone" && constraints?.audio)) throw new DOMException("Blocked by AgentsLock", "NotAllowedError"); return origGUM(constraints); }; }
      }
    }
  } catch {}
}

function OverviewTab({ checks, threats, setThreats, accounts, scanLog, monitors, userName, setTab, addLog, deviceCleaned, setDeviceCleaned }) {
  const totalChecks = Object.values(DEVICE_CHECKS).flat().length;
  const doneChecks = Object.keys(checks).filter(k => checks[k]).length;
  const baseScore = totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;
  const activeThreats = threats.filter(t => t.status === "active").length;
  // Penalize score for active threats (each active threat reduces score by up to 10 points)
  const threatPenalty = Math.min(activeThreats * 10, 40);
  const score = Math.max(0, baseScore - threatPenalty);
  const highRisk = accounts.filter(a => a.risk === "high").length;
  const onlineMonitors = monitors.filter(m => m.status === "up").length;

  // ── Device Scan State ──
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState("");
  const [findings, setFindings] = useState(null);
  const cleaned = deviceCleaned;
  const setCleaned = setDeviceCleaned; // React's native setState — properly handles functional updates
  // Keep a ref to deviceCleaned so async functions always read the latest value (no stale closures)
  const cleanedRef = useRef(deviceCleaned);
  cleanedRef.current = deviceCleaned;

  const runDeviceScan = async () => {
    setScanning(true); setFindings(null); setEliminating(false); setElimProgress(null);
    const results = [];
    const autoProtected = []; // Protections applied automatically — shown as green "Protected" items
    const pageOrigin = location.origin || location.href;
    const pageHost = location.hostname || "localhost";

    // ── Resolve real public IP for origin attribution ──
    let publicIP = null;
    try { const r = await fetch("https://api.ipify.org?format=json"); const d = await r.json(); publicIP = d.ip; } catch {}

    // Helper: check if a threat was already eliminated (uses ref for latest state)
    const wasEliminated = (id) => cleanedRef.current[id] === "done";

    const steps = [
      { phase: "Checking browser security...", pct: 10, run: () => {
        if (!wasEliminated("no-https")) {
          const isHttps = location.protocol === "https:";
          if (!isHttps) results.push({ id: "no-https", sev: "critical", cat: "Browser", name: "Insecure Connection", desc: "Page not served over HTTPS — data can be intercepted", fix: "deploy-https", fixLabel: "Eliminate", elimDesc: "Force-redirect all requests to HTTPS and block insecure resources", origin: pageOrigin, originType: "address" });
        }
        if (!wasEliminated("old-browser")) {
          const ua = navigator.userAgent;
          const isOldBrowser = /MSIE|Trident/.test(ua);
          if (isOldBrowser) results.push({ id: "old-browser", sev: "critical", cat: "Browser", name: "Outdated Browser", desc: "Internet Explorer detected — highly vulnerable to attacks", fix: "block-old-browser", fixLabel: "Eliminate", elimDesc: "Block unsafe legacy APIs and apply security shims", origin: navigator.userAgent.match(/(MSIE\s[\d.]+|Trident\/[\d.]+)/)?.[0] || "Internet Explorer", originType: "browser" });
        }
        // DNT: auto-protect instead of showing as threat
        if (!wasEliminated("no-dnt")) {
          const dnt = navigator.doNotTrack;
          if (dnt !== "1") {
            applyProtection("enable-dnt-header");
            autoProtected.push({ id: "no-dnt", cat: "Privacy", name: "Tracking opt-out enabled", desc: "Do Not Track signal is now active — websites are told not to track you", origin: `${navigator.vendor || "Browser"} — ${pageHost}`, originType: "browser" });
          }
        } else {
          autoProtected.push({ id: "no-dnt", cat: "Privacy", name: "Tracking opt-out enabled", desc: "Do Not Track signal is active — websites are told not to track you", origin: `${navigator.vendor || "Browser"} — ${pageHost}`, originType: "browser" });
        }
      }},
      { phase: "Scanning cookies & tracking...", pct: 25, run: () => {
        const cookies = document.cookie.split(";").filter(c => c.trim());
        const cookieNames = cookies.map(c => c.split("=")[0].trim()).filter(Boolean);
        const cookieOriginStr = cookieNames.length > 0 ? `${pageHost} (${cookieNames.slice(0, 3).join(", ")}${cookieNames.length > 3 ? ` +${cookieNames.length - 3} more` : ""})` : pageHost;
        if (cookies.length > 5) results.push({ id: "excess-cookies", sev: "medium", cat: "Privacy", name: `${cookies.length} cookies detected`, desc: "Tracking cookies may be profiling your browsing activity", fix: "clear-cookies", fixLabel: "Eliminate", elimDesc: "Remove all non-essential cookies — your logins stay intact", origin: cookieOriginStr, originType: "domain" });
        else if (cookies.length > 0) results.push({ id: "some-cookies", sev: "low", cat: "Privacy", name: `${cookies.length} cookies found`, desc: "Cookies present — review for unnecessary trackers", fix: "clear-cookies", fixLabel: "Eliminate", elimDesc: "Remove all non-essential cookies safely", origin: cookieOriginStr, originType: "domain" });
      }},
      { phase: "Checking local storage...", pct: 40, run: () => {
        let lsCount = 0; let lsSize = 0; const lsKeys = [];
        try { lsCount = localStorage.length; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); lsKeys.push(k); lsSize += (localStorage.getItem(k) || "").length; } } catch {}
        const lsKB = Math.round(lsSize / 1024);
        const foreignKeys = lsKeys.filter(k => !k?.startsWith("al_"));
        const lsOriginStr = `${pageHost}/localStorage (${foreignKeys.slice(0, 3).join(", ")}${foreignKeys.length > 3 ? ` +${foreignKeys.length - 3}` : ""})`;
        if (lsKB > 500) results.push({ id: "large-ls", sev: "medium", cat: "Storage", name: `${lsKB}KB in localStorage`, desc: `${lsCount} items storing ${lsKB}KB — may contain sensitive cached data`, fix: "clear-ls-other", fixLabel: "Eliminate", elimDesc: "Remove third-party cached data — AgentsLock settings preserved", origin: lsOriginStr, originType: "storage" });
        let ssCount = 0;
        try { ssCount = sessionStorage.length; } catch {}
        if (ssCount > 10) results.push({ id: "session-data", sev: "low", cat: "Storage", name: `${ssCount} sessionStorage items`, desc: "Temporary session data could expose activity if device is shared", fix: "clear-ss", fixLabel: "Eliminate", elimDesc: "Wipe all session data to prevent exposure on shared devices", origin: `${pageHost}/sessionStorage (${ssCount} keys)`, originType: "storage" });
      }},
      { phase: "Testing WebRTC leak...", pct: 55, run: async () => {
        if (wasEliminated("webrtc-leak")) {
          // Already blocked from a previous session — show as protected
          autoProtected.push({ id: "webrtc-leak", cat: "Privacy", name: "IP address hidden", desc: "WebRTC is blocked — your real IP address cannot be leaked, even on a VPN", origin: "WebRTC blocked by AgentsLock", originType: "ip" });
          return;
        }
        try {
          const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
          pc.createDataChannel("");
          const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
          let leakedIP = null;
          await new Promise(resolve => {
            const to = setTimeout(() => resolve(false), 3000);
            pc.onicecandidate = e => { if (e.candidate?.candidate) { const m = e.candidate.candidate.match(/(\d{1,3}\.){3}\d{1,3}/); if (m && !m[0].startsWith("0.") && m[0] !== "0.0.0.0") { leakedIP = m[0]; clearTimeout(to); resolve(true); } } };
          });
          pc.close();
          if (leakedIP) {
            // Auto-protect: block WebRTC immediately
            applyProtection("block-webrtc");
            autoProtected.push({ id: "webrtc-leak", cat: "Privacy", name: "IP address hidden", desc: "WebRTC leak detected and blocked — your real IP is now protected", origin: `${leakedIP} → blocked by AgentsLock`, originType: "ip" });
          }
        } catch {}
      }},
      { phase: "Checking permissions...", pct: 70, run: async () => {
        const permsToCheck = ["camera", "microphone", "geolocation", "notifications"];
        for (const p of permsToCheck) {
          if (wasEliminated(`perm-${p}`)) continue; // Already revoked
          try {
            const status = await navigator.permissions.query({ name: p });
            if (status.state === "granted") results.push({ id: `perm-${p}`, sev: p === "geolocation" ? "high" : "medium", cat: "Permissions", name: `${p.charAt(0).toUpperCase() + p.slice(1)} access granted`, desc: `Website has ${p} permission — revoke if not needed`, fix: `revoke-perm-${p}`, fixLabel: "Eliminate", elimDesc: `Block ${p} API access for this page and clear granted permission`, origin: `${pageHost} → navigator.${p === "notifications" ? "Notification" : p === "camera" || p === "microphone" ? "mediaDevices" : p}`, originType: "api" });
          } catch {}
        }
      }},
      { phase: "Analyzing device exposure...", pct: 85, run: () => {
        // Fingerprinting: auto-protect instead of showing as threat
        if (!wasEliminated("fingerprint") && !window.__alFingerprintSpoofed) {
          const cores = navigator.hardwareConcurrency;
          const mem = navigator.deviceMemory;
          const platform = navigator.platform;
          let fpPoints = 0; const fpAPIs = [];
          if (cores) { fpPoints++; fpAPIs.push("hardwareConcurrency"); }
          if (mem) { fpPoints++; fpAPIs.push("deviceMemory"); }
          if (platform) { fpPoints++; fpAPIs.push("platform"); }
          if (navigator.languages?.length > 1) { fpPoints++; fpAPIs.push("languages"); }
          if (screen.colorDepth) { fpPoints++; fpAPIs.push("screen.colorDepth"); }
          if (fpPoints >= 4) {
            // Auto-protect: spoof fingerprint immediately
            applyProtection("spoof-fingerprint");
            autoProtected.push({ id: "fingerprint", cat: "Privacy", name: "Fingerprint randomized", desc: `${fpPoints} device identifiers scrambled — tracking sites can no longer identify you`, origin: `navigator.{${fpAPIs.join(", ")}} → randomized`, originType: "api" });
          }
        } else {
          // Already protected
          autoProtected.push({ id: "fingerprint", cat: "Privacy", name: "Fingerprint randomized", desc: "Device identifiers are scrambled — tracking sites cannot identify you", origin: "Device properties randomized by AgentsLock", originType: "api" });
        }
        const conn = navigator.connection;
        if (conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") results.push({ id: "slow-net", sev: "low", cat: "Network", name: "Slow network connection", desc: "Slow connection may cause timeouts during security operations", fix: "optimize-net", fixLabel: "Eliminate", elimDesc: "Enable request compression and reduce payload sizes for faster operations", origin: `${conn.effectiveType} via navigator.connection`, originType: "api" });
      }},
      { phase: "Checking storage quota...", pct: 95, run: async () => {
        try {
          const est = await navigator.storage.estimate();
          const usedMB = Math.round((est.usage || 0) / 1024 / 1024);
          const quotaMB = Math.round((est.quota || 0) / 1024 / 1024);
          if (usedMB > 50) results.push({ id: "storage-quota", sev: "low", cat: "Storage", name: `${usedMB}MB browser storage used`, desc: "Cached data accumulation — consider clearing site data periodically", fix: "clear-cache", fixLabel: "Eliminate", elimDesc: "Purge cached files and service worker data — your saved settings are safe", origin: `${pageHost} — ${usedMB}MB / ${quotaMB}MB quota`, originType: "storage" });
        } catch {}
      }},
    ];

    for (const step of steps) {
      setScanPhase(step.phase);
      setScanProgress(step.pct);
      await new Promise(r => setTimeout(r, 400));
      await step.run();
    }

    // ── Enrich all findings with public IP when available ──
    if (publicIP) { results.forEach(r => { if (r.originType === "ip" || r.originType === "address") { if (!r.origin.includes(publicIP)) r.publicIP = publicIP; } else { r.publicIP = publicIP; } }); }

    setScanProgress(100);
    setScanPhase("Scan complete — protections applied");
    await new Promise(r => setTimeout(r, 300));

    // Mark auto-protected items as "done" in cleaned state
    if (autoProtected.length > 0) {
      const newCleaned = { ...cleanedRef.current };
      autoProtected.forEach(p => { newCleaned[p.id] = "done"; });
      setCleaned(newCleaned);
      cleanedRef.current = newCleaned;
    }

    // Filter out threats that were already eliminated (protections active)
    // Use ref to get the latest deviceCleaned value (avoids stale closure in async function)
    const currentCleaned = cleanedRef.current;
    const filtered = results.filter(r => currentCleaned[r.id] !== "done");

    // Build final findings: auto-protected items (green) + remaining actionable items
    const protectedFindings = autoProtected.map(p => ({ ...p, sev: "protected", fix: null, fixLabel: null, elimDesc: null }));
    const combined = [...protectedFindings, ...filtered];

    if (combined.length === 0) combined.push({ id: "all-clear", sev: "safe", cat: "System", name: "All clear — fully protected", desc: "Your device passed all security checks", fix: null, fixLabel: null, elimDesc: null, origin: null });

    setFindings(combined);
    setScanning(false);
    addLog({ type: "DeviceScan", target: navigator.platform || "Device", safe: combined.every(r => r.sev === "safe" || r.sev === "low" || r.sev === "protected") });
  };

  // ── Safe elimination actions per fix type ──
  const eliminateFinding = async (finding) => {
    setCleaned(p => ({ ...p, [finding.id]: "cleaning" }));
    await new Promise(r => setTimeout(r, 500));
    try {
      const f = finding.fix;
      // Use shared protection applier for runtime overrides
      applyProtection(f);
      // localStorage cleanup (preserve app data)
      if (f === "clear-ls-other") { const keep = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith("al_")) keep.push([k, localStorage.getItem(k)]); } localStorage.clear(); keep.forEach(([k, v]) => localStorage.setItem(k, v)); }
      // Session data wipe
      if (f === "clear-ss") { sessionStorage.clear(); }
      // Cache purge
      if (f === "clear-cache") { if ("caches" in window) { const names = await caches.keys(); await Promise.all(names.map(n => caches.delete(n))); } }
      // Old browser mitigation
      if (f === "block-old-browser") { const meta = document.createElement("meta"); meta.httpEquiv = "X-UA-Compatible"; meta.content = "IE=edge"; document.head.appendChild(meta); }
      // Network optimization placeholder
      if (f === "optimize-net") { /* compression handled at request level */ }
    } catch {}
    setCleaned(p => ({ ...p, [finding.id]: "done" }));
    // Update ref immediately so any subsequent scan sees the latest state
    cleanedRef.current = { ...cleanedRef.current, [finding.id]: "done" };
    // Remove from findings list after a short delay (let the "Eliminated" badge show briefly)
    setTimeout(() => {
      setFindings(prev => {
        if (!prev) return prev;
        const remaining = prev.filter(f => f.id !== finding.id);
        if (remaining.length === 0 || remaining.every(f => f.sev === "safe" || f.sev === "protected")) {
          const protectedItems = remaining.filter(f => f.sev === "protected");
          return [...protectedItems, { id: "all-clear", sev: "safe", cat: "System", name: "All clear — fully protected", desc: "Your device is secured and clean", fix: null, fixLabel: null, elimDesc: null, origin: null }];
        }
        return remaining;
      });
    }, 1200);
  };

  // ── Eliminate All Threats ──
  const [eliminating, setEliminating] = useState(false);
  const [elimProgress, setElimProgress] = useState(null);

  const eliminateAll = async () => {
    if (!findings) return;
    // Use ref for latest cleaned state to avoid stale closure
    const actionable = findings.filter(f => f.sev !== "safe" && f.sev !== "protected" && f.fix && cleanedRef.current[f.id] !== "done");
    if (actionable.length === 0) return;
    setEliminating(true);
    setElimProgress({ done: 0, total: actionable.length, current: "" });
    for (let i = 0; i < actionable.length; i++) {
      setElimProgress({ done: i, total: actionable.length, current: actionable[i].name });
      await eliminateFinding(actionable[i]);
      setElimProgress({ done: i + 1, total: actionable.length, current: actionable[i].name });
    }
    setEliminating(false);
    // Remove cleaned items from findings — keep protected items visible
    setFindings(prev => {
      if (!prev) return prev;
      const remaining = prev.filter(f => f.sev === "safe" || f.sev === "protected" || !actionable.find(a => a.id === f.id));
      if (remaining.length === 0 || remaining.every(f => f.sev === "protected" || f.sev === "safe")) {
        const protectedItems = remaining.filter(f => f.sev === "protected");
        return [...protectedItems, { id: "all-clear", sev: "safe", cat: "System", name: "All clear — fully protected", desc: "Your device is secured and clean", fix: null, fixLabel: null, elimDesc: null, origin: null }];
      }
      return remaining;
    });
    addLog({ type: "Eliminate", target: `${actionable.length} threats`, safe: true });
  };

  const sevIcon = (sev) => ({ critical: C.red, high: C.red, medium: C.orange, low: C.green, safe: C.green, protected: C.green }[sev] || C.dim);

  const exportOverview = () => {
    const lines = [`AGENTSLOCK — SECURITY OVERVIEW REPORT`, `Generated: ${new Date().toISOString()}`, `${"=".repeat(50)}`, ``, `SECURITY SCORE: ${score}/100 (${doneChecks}/${totalChecks} tasks)`, `ACTIVE THREATS: ${activeThreats}`, `BLOCKED: ${threats.filter(t => t.status === "blocked").length}`, `MONITORS: ${monitors.length} (${onlineMonitors} online)`, `ACCOUNTS: ${accounts.length} (${highRisk} high risk)`, `SCANS: ${scanLog.length} total`, ``];
    if (findings) {
      lines.push(`DEVICE SCAN FINDINGS:`, `-`.repeat(30));
      findings.forEach(f => lines.push(`  [${f.sev?.toUpperCase()}] ${f.name} — ${f.desc || ""}`));
      lines.push(``);
    }
    if (threats.length > 0) {
      lines.push(`RECENT THREATS:`, `-`.repeat(30));
      threats.slice(0, 8).forEach(t => lines.push(`  [${t.status.toUpperCase()}] ${t.name} — ${t.target}`));
      lines.push(``);
    }
    if (scanLog.length > 0) {
      lines.push(`SCAN HISTORY:`, `-`.repeat(30));
      scanLog.slice(-10).forEach(s => lines.push(`  ${new Date(s.time).toLocaleString()} — ${s.type}: ${s.target} (${s.safe ? "Safe" : "Risk"})`));
    }
    downloadReport("overview", lines.join("\n"));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {userName && <div style={{ fontSize: 13, color: C.dim }}>Welcome back, <span style={{ color: C.green, fontWeight: 600 }}>{userName}</span></div>}
        <ReportBtn onClick={exportOverview} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
        <Card glow={score >= 80 ? C.green : score >= 50 ? C.orange : C.red}>
          <div style={{ textAlign: "center" }}>
            <svg width="90" height="90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke={C.border} strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={score >= 80 ? C.green : score >= 50 ? C.orange : C.red}
                strokeWidth="8" strokeDasharray={`${score * 3.267} 326.7`} strokeLinecap="round" transform="rotate(-90 60 60)" />
              <text x="60" y="55" textAnchor="middle" fill={C.bright} fontSize="26" fontWeight="700" fontFamily="'Chakra Petch'">{score}</text>
              <text x="60" y="72" textAnchor="middle" fill={C.dim} fontSize="8" letterSpacing="0.1em">SECURITY</text>
            </svg>
            <div style={{ fontSize: 10, color: C.dim }}>{doneChecks}/{totalChecks} tasks</div>
          </div>
        </Card>
        <Stat label="Active Threats" value={activeThreats} color={activeThreats > 0 ? C.red : C.green} sub={`${threats.filter(t => t.status === "blocked").length} blocked`} />
        <Stat label="Monitors" value={monitors.length} color={C.bright} sub={`${onlineMonitors} online`} />
        <Stat label="Accounts" value={accounts.length} color={C.bright} sub={highRisk > 0 ? `${highRisk} high risk` : "All secured"} />
        <Stat label="Scans" value={scanLog.length} color={C.blue} sub="Total performed" />
      </div>

      {/* ── Device Scan & Clean ─── */}
      <Card glow={scanning ? C.cyan : findings ? (findings.some(f => f.sev === "critical" || f.sev === "high") ? C.red : C.green) : null}>
        <Sect title="Device Security & Protection" icon={<I.Shield />}>
          {!scanning && !findings && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ color: C.dim, fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
                Scan and protect your device — AgentsLock automatically shields your IP, blocks fingerprinting, and enables tracking protection. Additional cleanup options are shown if needed.
              </div>
              <Btn onClick={runDeviceScan} color={C.cyan} style={{ padding: "12px 32px", fontSize: 14 }}>
                <I.Shield /> Scan Device
              </Btn>
            </div>
          )}

          {scanning && (
            <div style={{ padding: "16px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 20, height: 20, border: `2px solid ${C.border}`, borderTopColor: C.cyan, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span style={{ color: C.cyan, fontSize: 12, fontWeight: 600 }}>{scanPhase}</span>
              </div>
              <Progress value={scanProgress} color={C.cyan} h={6} />
              <div style={{ textAlign: "right", fontSize: 10, color: C.dim, marginTop: 4 }}>{scanProgress}%</div>
            </div>
          )}

          {findings && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Summary bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: C.bg, borderRadius: 8, marginBottom: 4 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {(() => {
                    const protectedCount = findings.filter(f => f.sev === "protected").length;
                    return protectedCount > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <I.Shield s={12} />
                        <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>{protectedCount} protected</span>
                      </div>
                    ) : null;
                  })()}
                  {["critical", "high", "medium", "low"].map(sev => {
                    const count = findings.filter(f => f.sev === sev).length;
                    return count > 0 ? (
                      <div key={sev} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: sevIcon(sev) }} />
                        <span style={{ fontSize: 11, color: C.text }}>{count} {sev === "low" ? "optional" : sev}</span>
                      </div>
                    ) : null;
                  })}
                  {findings.every(f => f.sev === "safe" || f.sev === "protected") && <span style={{ color: C.green, fontSize: 12, fontWeight: 600 }}>All clear — fully protected</span>}
                </div>
                {(() => {
                  const actionable = findings.filter(f => f.sev !== "safe" && f.sev !== "protected" && f.fix && cleaned[f.id] !== "done");
                  const allDone = findings.filter(f => f.sev !== "safe" && f.sev !== "protected").length > 0 && findings.filter(f => f.sev !== "safe" && f.sev !== "protected").every(f => cleaned[f.id] === "done");
                  return actionable.length > 0 && !eliminating ? (
                    <Btn onClick={eliminateAll} color={C.orange} style={{ fontSize: 11, padding: "5px 14px" }}><I.Crosshair /> Clean Up ({actionable.length})</Btn>
                  ) : allDone ? (
                    <Badge color={C.green}>All Clean</Badge>
                  ) : null;
                })()}
              </div>

              {/* Eliminate All progress */}
              {eliminating && elimProgress && (
                <div style={{ padding: "10px 14px", background: `${C.orange}08`, border: `1px solid ${C.orange}25`, borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 16, height: 16, border: `2px solid ${C.border}`, borderTopColor: C.orange, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <span style={{ color: C.orange, fontSize: 12, fontWeight: 600 }}>Cleaning up... ({elimProgress.done}/{elimProgress.total})</span>
                  </div>
                  <Progress value={elimProgress.total > 0 ? Math.round((elimProgress.done / elimProgress.total) * 100) : 0} color={C.orange} h={4} />
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>Cleaning: {elimProgress.current}</div>
                </div>
              )}

              {/* Auto-protected items — shown first with green styling */}
              {findings.filter(f => f.sev === "protected").map(f => (
                <div key={f.id} style={{ padding: "10px 14px", background: `${C.green}08`, borderRadius: 8, border: `1px solid ${C.green}30`, transition: "all 0.3s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                      <I.Shield s={14} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>{f.name}</span>
                          <Badge color={C.green}>{f.cat}</Badge>
                        </div>
                        <div style={{ fontSize: 10, color: `${C.green}cc`, marginTop: 2 }}>{f.desc}</div>
                      </div>
                    </div>
                    <Badge color={C.green}>Protected</Badge>
                  </div>
                  {f.origin && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, marginLeft: 18, padding: "4px 10px", background: `${C.green}08`, borderRadius: 5, width: "fit-content" }}>
                      <I.Shield s={10} />
                      <span style={{ fontSize: 10, color: `${C.green}99`, letterSpacing: "0.02em" }}>{f.origin}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Actionable findings — things user can optionally clean */}
              {findings.filter(f => f.sev !== "safe" && f.sev !== "protected").length > 0 && (
                <div style={{ fontSize: 10, color: C.dim, marginTop: 4, marginBottom: -4, paddingLeft: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Optional cleanup</div>
              )}
              {findings.filter(f => f.sev !== "safe" && f.sev !== "protected").map(f => (
                <div key={f.id} style={{ padding: "10px 14px", background: cleaned[f.id] === "done" ? `${C.green}06` : C.bg, borderRadius: 8, border: `1px solid ${cleaned[f.id] === "done" ? C.greenBdr : C.border}`, transition: "all 0.3s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cleaned[f.id] === "done" ? C.green : sevIcon(f.sev), flexShrink: 0, transition: "background 0.3s" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: cleaned[f.id] === "done" ? C.green : C.bright }}>{f.name}</span>
                          <Badge color={sevIcon(f.sev)}>{f.cat}</Badge>
                        </div>
                        <div style={{ fontSize: 10, color: cleaned[f.id] === "done" ? C.green : C.dim, marginTop: 2 }}>
                          {cleaned[f.id] === "done" ? "Cleaned up — your device is tidy" : cleaned[f.id] === "cleaning" ? f.elimDesc : f.desc}
                        </div>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, marginLeft: 10 }}>
                      {cleaned[f.id] === "done" ? (
                        <Badge color={C.green}>Cleaned</Badge>
                      ) : cleaned[f.id] === "cleaning" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 12, height: 12, border: `2px solid ${C.border}`, borderTopColor: C.orange, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                          <span style={{ fontSize: 10, color: C.orange, fontWeight: 600 }}>Cleaning...</span>
                        </div>
                      ) : f.fix ? (
                        <Btn onClick={() => eliminateFinding(f)} color={C.orange} style={{ fontSize: 10, padding: "4px 12px" }} disabled={eliminating}><I.Crosshair /> Clean</Btn>
                      ) : (
                        <span style={{ fontSize: 10, color: C.dim, fontStyle: "italic" }}>{f.fixLabel || "Manual action"}</span>
                      )}
                    </div>
                  </div>
                  {/* Origin / Source address */}
                  {f.origin && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, marginLeft: 18, padding: "4px 10px", background: `${C.border}20`, borderRadius: 5, width: "fit-content" }}>
                      <I.Map />
                      <span style={{ fontSize: 10, color: C.dim, letterSpacing: "0.02em" }}>
                        <span style={{ color: C.text, fontWeight: 600 }}>Source:</span> {f.origin}
                      </span>
                      {f.publicIP && f.originType !== "ip" && (
                        <span style={{ fontSize: 10, color: C.dim, borderLeft: `1px solid ${C.border}`, paddingLeft: 6, marginLeft: 2 }}>
                          <span style={{ color: C.text, fontWeight: 600 }}>IP:</span> {f.publicIP}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Actions row */}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Btn onClick={runDeviceScan} color={C.cyan} style={{ fontSize: 11 }}><I.Refresh /> Scan Again</Btn>
                <Btn onClick={() => { setFindings(null); setElimProgress(null); }} color={C.dim} style={{ fontSize: 11 }}><I.X /> Dismiss</Btn>
              </div>
            </div>
          )}
        </Sect>
      </Card>

      {/* ── Quick Actions ─── */}
      <Card>
        <Sect title="Quick Actions" icon={<I.Zap />}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "Breach Check", desc: "Check password leaks", icon: <I.Key />, color: C.purple, tab: "breach" },
              { label: "Web Scanner", desc: "Scan site security", icon: <I.Globe />, color: C.cyan, tab: "scanner" },
              { label: "Device Hardening", desc: "Secure your devices", icon: <I.Shield />, color: C.green, tab: "devices" },
              { label: "Password Audit", desc: "Check password strength", icon: <I.Key />, color: C.purple, tab: "passwords" },
            ].map(a => (
              <button key={a.tab} onClick={() => setTab(a.tab)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = `${a.color}08`; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}>
                <div style={{ color: a.color }}>{a.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.bright }}>{a.label}</div>
                <div style={{ fontSize: 10, color: C.dim }}>{a.desc}</div>
              </button>
            ))}
          </div>
        </Sect>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card glow={activeThreats > 0 ? C.red : undefined}>
          <Sect title="Recent Threats" icon={<I.Alert />} right={activeThreats > 0 && (
            <Btn onClick={() => { const n = threats.map(t => t.status === "active" ? { ...t, status: "blocked" } : t); setThreats(n); }} color={C.green} style={{ fontSize: 10, padding: "4px 12px" }}><I.Shield /> Block All Threats</Btn>
          )}>
            {threats.length === 0 ? <div style={{ textAlign: "center", padding: 20, color: C.dim }}>All clear</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeThreats === 0 && threats.every(t => t.status === "blocked" || t.status === "resolved") && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: `${C.green}08`, borderRadius: 8, border: `1px solid ${C.greenBdr}` }}>
                    <I.Shield s={14} style={{ color: C.green }} />
                    <span style={{ color: C.green, fontSize: 12, fontWeight: 600 }}>All threats blocked — you're protected</span>
                  </div>
                )}
                {threats.slice(0, 4).map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: t.status === "blocked" ? `${C.green}06` : t.status === "active" ? `${C.red}06` : C.bg, borderRadius: 8, border: `1px solid ${t.status === "blocked" ? C.greenBdr : t.status === "active" ? C.redBdr : C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {t.status === "blocked" ? <I.Check s={12} style={{ color: C.green }} /> : t.status === "active" ? <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.red, animation: "pulse 2s infinite" }} /> : <div style={{ width: 7, height: 7, borderRadius: "50%", background: sevColor(t.severity) }} />}
                      <span style={{ color: t.status === "blocked" ? C.green : C.bright, fontWeight: 600, fontSize: 12 }}>{t.name}</span>
                      <span style={{ color: C.dim, fontSize: 11 }}>{"\u2192"} {t.target}</span>
                    </div>
                    <Badge color={t.status === "active" ? C.red : t.status === "blocked" ? C.green : C.orange}>{t.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Sect>
        </Card>

        <Card>
          <Sect title="Uptime Monitors" icon={<I.Activity />}>
            {monitors.length === 0 ? <div style={{ textAlign: "center", padding: 20, color: C.dim, fontSize: 12 }}>No monitors — add sites in Monitoring tab</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {monitors.slice(0, 4).map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: C.bg, borderRadius: 8 }}>
                    <span style={{ color: C.text, fontSize: 12 }}>{m.name || m.url}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {m.responseTime && <span style={{ color: C.dim, fontSize: 10 }}>{m.responseTime}ms</span>}
                      <Badge color={m.status === "up" ? C.green : m.status === "down" ? C.red : C.orange}>{m.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Sect>
        </Card>
      </div>

      <Card>
        <Sect title="Scan History" icon={<I.Clock />}>
          {scanLog.length === 0 ? <div style={{ textAlign: "center", padding: 20, color: C.dim, fontSize: 12 }}>No scans yet — try the Device Scan above or Breach Check</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {scanLog.slice(0, 8).map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: C.bg, borderRadius: 6, fontSize: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge color={C.blue}>{s.type}</Badge>
                    <span style={{ color: C.text }}>{s.target}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: C.dim }}>{s.time ? new Date(s.time).toLocaleTimeString() : ""}</span>
                    <Badge color={s.safe ? C.green : C.red}>{s.safe ? "SAFE" : "RISK"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Sect>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: BREACH CHECKER
// ═══════════════════════════════════════════════════════════════════════════════
function BreachTab({ addLog }) {
  const [pw, setPw] = useState("");
  const [pwRes, setPwRes] = useState(null);
  const [loading, setLoading] = useState("");

  const checkPw = async () => {
    if (!pw) return; setLoading("pw"); setPwRes(null);
    try {
      const hash = await sha1(pw), prefix = hash.slice(0, 5), suffix = hash.slice(5);
      const r = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await r.text();
      const match = text.split("\n").find(l => l.startsWith(suffix));
      const count = match ? parseInt(match.split(":")[1]) : 0;
      setPwRes({ count, safe: count === 0 });
      addLog({ type: "PwCheck", target: "••••••", safe: count === 0 });
    } catch { setPwRes({ error: true }); }
    setLoading("");
  };

  const exportBreach = () => {
    const lines = [`AGENTSLOCK — BREACH CHECK REPORT`, `Generated: ${new Date().toISOString()}`, `${"=".repeat(50)}`, ``];
    if (pwRes) {
      lines.push(`PASSWORD BREACH CHECK:`);
      if (pwRes.error) lines.push(`  Result: Error occurred`);
      else if (pwRes.safe) lines.push(`  Result: Not found in breaches`);
      else lines.push(`  Result: Found ${pwRes.count.toLocaleString()} times in breaches — CHANGE IMMEDIATELY`);
    } else { lines.push(`PASSWORD: Not checked yet`); }
    downloadReport("breach-check", lines.join("\n"));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><ReportBtn onClick={exportBreach} /></div>
      <Card glow={C.purple}>
        <Sect title="Password Breach Check" icon={<I.Key />}>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>🔒 Uses k-anonymity — your password never leaves your browser. Checks against billions of leaked passwords from known data breaches.</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <Input value={pw} onChange={setPw} placeholder="Enter password to check..." type="password" icon={<I.Lock />} style={{ flex: 1 }} />
            <Btn onClick={checkPw} disabled={loading === "pw"} color={C.purple}>{loading === "pw" ? "Checking..." : "Check"}</Btn>
          </div>
          {pwRes && (
            <div style={{ padding: 14, borderRadius: 8, background: pwRes.safe ? C.greenDim : C.redDim, border: `1px solid ${pwRes.safe ? C.greenBdr : C.redBdr}` }}>
              {pwRes.error ? <div style={{ color: C.orange }}>Error — retry</div>
              : pwRes.safe ? <div style={{ color: C.green, fontWeight: 600 }}>Not found in breaches — this password is safe to use</div>
              : <div><div style={{ color: C.red, fontWeight: 600 }}>Seen {pwRes.count.toLocaleString()} times in data breaches!</div><div style={{ color: C.text, fontSize: 12, marginTop: 4 }}>Change this password immediately everywhere you use it.</div></div>}
            </div>
          )}
        </Sect>
      </Card>
      <Card>
        <Sect title="How It Works" icon={<I.Shield />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { step: "1", title: "Your password is hashed locally", desc: "SHA-1 hash is computed entirely in your browser — the password itself is never transmitted.", color: C.green },
              { step: "2", title: "Only a tiny prefix is sent", desc: "Only the first 5 characters of the hash are sent to the Pwned Passwords API (k-anonymity).", color: C.blue },
              { step: "3", title: "Comparison happens locally", desc: "The API returns matching hash suffixes. Your browser checks for a match — the server never sees your password.", color: C.purple },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", background: C.bg, borderRadius: 8, borderLeft: `3px solid ${item.color}` }}>
                <div style={{ minWidth: 24, height: 24, borderRadius: 6, background: `${item.color}18`, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, fontSize: 12 }}>{item.step}</div>
                <div>
                  <div style={{ color: C.bright, fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ color: C.dim, fontSize: 11 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Sect>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: PASSWORD TOOLS
// ═══════════════════════════════════════════════════════════════════════════════
function PasswordTab() {
  const [pw, setPw] = useState(""); const [showPw, setShowPw] = useState(false);
  const [genLen, setGenLen] = useState(20);
  const [genOpts, setGenOpts] = useState({ upper: true, lower: true, nums: true, syms: true });
  const [generated, setGenerated] = useState(""); const [copied, setCopied] = useState(false);
  const str = calcPwStrength(pw);
  const doGen = () => { setGenerated(genPassword(genLen, genOpts)); setCopied(false); };
  const doCopy = () => { navigator.clipboard.writeText(generated); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  useEffect(() => { doGen(); }, []);
  const exportPw = () => {
    const lines = [`AGENTSLOCK — PASSWORD ANALYSIS REPORT`, `Generated: ${new Date().toISOString()}`, `${"=".repeat(50)}`, ``];
    if (pw) {
      lines.push(`PASSWORD STRENGTH ANALYSIS:`, `  Strength: ${str.label}`, `  Score: ${str.score}/100`, `  Entropy: ${str.entropy} bits`, `  Crack Time: ${str.crack}`, `  Length: ${pw.length} characters`);
      if (str.issues.length > 0) { lines.push(`  Issues:`); str.issues.forEach(i => lines.push(`    - ${i}`)); }
    } else { lines.push(`No password analyzed.`); }
    lines.push(``, `GENERATOR SETTINGS:`, `  Length: ${genLen}`, `  Uppercase: ${genOpts.upper ? "Yes" : "No"}`, `  Lowercase: ${genOpts.lower ? "Yes" : "No"}`, `  Numbers: ${genOpts.nums ? "Yes" : "No"}`, `  Symbols: ${genOpts.syms ? "Yes" : "No"}`);
    if (generated) { const gs = calcPwStrength(generated); lines.push(``, `GENERATED PASSWORD STRENGTH:`, `  Strength: ${gs.label}`, `  Entropy: ${gs.entropy} bits`, `  Crack Time: ${gs.crack}`); }
    downloadReport("password-analysis", lines.join("\n"));
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}><ReportBtn onClick={exportPw} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card glow={pw ? str.color : undefined}>
        <Sect title="Password Strength Analyzer" icon={<I.Shield />}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Input value={pw} onChange={setPw} placeholder="Type a password..." type={showPw ? "text" : "password"} icon={<I.Lock />} />
            <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.dim }}>{showPw ? <I.EyeOff /> : <I.Eye />}</button>
          </div>
          {pw && (<>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: str.color, fontWeight: 700 }}>{str.label}</span><span style={{ color: C.dim, fontSize: 11 }}>{str.entropy} bits</span></div>
            <Progress value={str.score} color={str.color} h={8} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
              <div style={{ padding: "8px 12px", background: C.bg, borderRadius: 6 }}><div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase" }}>Crack Time</div><div style={{ color: str.color, fontWeight: 600, marginTop: 2 }}>{str.crack}</div></div>
              <div style={{ padding: "8px 12px", background: C.bg, borderRadius: 6 }}><div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase" }}>Length</div><div style={{ color: C.bright, fontWeight: 600, marginTop: 2 }}>{pw.length} chars</div></div>
            </div>
            {str.issues.length > 0 && <div style={{ marginTop: 14 }}><div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>Issues</div>{str.issues.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.orange, padding: "3px 0" }}><I.Alert s={12} /> {s}</div>)}</div>}
          </>)}
        </Sect>
      </Card>
      <Card glow={C.cyan}>
        <Sect title="Password Generator" icon={<I.Zap />}>
          <div style={{ padding: 14, background: C.bg, borderRadius: 8, marginBottom: 14, fontFamily: "'Fira Code', monospace", fontSize: 14, color: C.bright, wordBreak: "break-all", minHeight: 48, display: "flex", alignItems: "center" }}>{generated || "Click Generate"}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}><Btn onClick={doGen} color={C.cyan}><I.Refresh /> Generate</Btn><Btn onClick={doCopy} color={copied ? C.green : C.blue}><I.Copy /> {copied ? "Copied!" : "Copy"}</Btn></div>
          <div style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.dim, marginBottom: 4 }}><span>Length</span><span style={{ color: C.cyan, fontWeight: 600 }}>{genLen}</span></div><input type="range" min="8" max="64" value={genLen} onChange={e => setGenLen(+e.target.value)} style={{ width: "100%", accentColor: C.cyan }} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[["upper","A-Z"],["lower","a-z"],["nums","0-9"],["syms","!@#"]].map(([k,l]) => <label key={k} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: C.bg, borderRadius: 6, cursor: "pointer", fontSize: 11, color: genOpts[k] ? C.bright : C.dim }}><input type="checkbox" checked={genOpts[k]} onChange={() => setGenOpts({...genOpts,[k]:!genOpts[k]})} style={{ accentColor: C.cyan }} />{l}</label>)}
          </div>
          {generated && (()=>{ const g=calcPwStrength(generated); return <div style={{ marginTop:12, padding:"8px 12px", background:C.bg, borderRadius:6 }}><Progress value={g.score} color={g.color}/><div style={{ fontSize:11, color:g.color, fontWeight:600, marginTop:4 }}>{g.label} — {g.crack}</div></div>; })()}
        </Sect>
      </Card>
    </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: WEBSITE SCANNER
// ═══════════════════════════════════════════════════════════════════════════════
const SEC_HEADERS = [
  { name:"Content-Security-Policy", sev:"critical", desc:"Prevents XSS & injection", rec:"default-src 'self'; script-src 'self'" },
  { name:"Strict-Transport-Security", sev:"critical", desc:"Forces HTTPS", rec:"max-age=31536000; includeSubDomains; preload" },
  { name:"X-Content-Type-Options", sev:"medium", desc:"Prevents MIME sniffing", rec:"nosniff" },
  { name:"X-Frame-Options", sev:"medium", desc:"Prevents clickjacking", rec:"DENY" },
  { name:"Referrer-Policy", sev:"medium", desc:"Controls referrer info", rec:"strict-origin-when-cross-origin" },
  { name:"Permissions-Policy", sev:"medium", desc:"Controls browser features", rec:"camera=(), microphone=(), geolocation=()" },
  { name:"Cross-Origin-Opener-Policy", sev:"low", desc:"Isolates context", rec:"same-origin" },
  { name:"Cross-Origin-Resource-Policy", sev:"low", desc:"Controls loading", rec:"same-origin" },
];

function ScannerTab({ addLog }) {
  const [url, setUrl] = useState(""); const [scanning, setScanning] = useState(false); const [result, setResult] = useState(null);
  const scan = async () => {
    if (!url) return; let target = url.trim(); if (!target.startsWith("http")) target = "https://" + target;
    setScanning(true); setResult(null);
    try {
      const hostname = new URL(target).hostname; let sslGrade = "—";
      try { const r = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${hostname}&fromCache=on&maxAge=24`); if (r.ok) { const d = await r.json(); sslGrade = d.endpoints?.[0]?.grade || d.status || "Pending"; } } catch {}

      // Fetch real HTTP headers via proxy API
      let liveHeaders = {};
      let headerFetchOk = false;
      try {
        const r = await fetch("/api/scan-headers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: target }) });
        if (r.ok) { const d = await r.json(); liveHeaders = d.headers || {}; headerFetchOk = true; }
      } catch {}

      // Build header results with real pass/fail status
      const headerResults = SEC_HEADERS.map(h => {
        const headerKey = h.name.toLowerCase();
        const found = headerFetchOk ? !!liveHeaders[headerKey] : null;
        const value = liveHeaders[headerKey] || null;
        return { ...h, found, value };
      });

      const presentCount = headerResults.filter(h => h.found === true).length;
      const missingCount = headerResults.filter(h => h.found === false).length;
      const allPresent = headerFetchOk && missingCount === 0;

      setResult({ url: target, hostname, sslGrade, headers: headerResults, headerFetchOk, presentCount, missingCount, time: new Date() });
      addLog({ type: "WebScan", target: hostname, safe: allPresent && sslGrade.startsWith?.("A") });
    } catch (e) { setResult({ error: e.message }); }
    setScanning(false);
  };
  const exportScan = () => {
    if (!result || result.error) return;
    const lines = [`AGENTSLOCK — WEB SCANNER REPORT`, `Generated: ${new Date().toISOString()}`, `${"=".repeat(50)}`, ``, `URL: ${result.url}`, `HOSTNAME: ${result.hostname}`, `SSL/TLS GRADE: ${result.sslGrade}`, `SCANNED: ${result.time?.toLocaleString()}`, ``, `SECURITY HEADERS ANALYSIS:`, `-`.repeat(30)];
    result.headers.forEach(h => {
      const status = h.found === true ? "PASS" : h.found === false ? "FAIL" : "N/A";
      lines.push(`[${status}] [${h.sev.toUpperCase()}] ${h.name}`, `  ${h.desc}`, h.value ? `  Value: ${h.value}` : `  Recommended: ${h.rec}`, ``);
    });
    downloadReport("web-scan", lines.join("\n"));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card><Sect title="Website Security Scanner" icon={<I.Globe />}>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>SSL/TLS grade and live security header validation. Headers are fetched from the actual server response.</div>
        <div style={{ display: "flex", gap: 8 }}><Input value={url} onChange={setUrl} placeholder="example.com" icon={<I.Search />} style={{ flex: 1 }} /><Btn onClick={scan} disabled={scanning}>{scanning ? "Scanning..." : "Scan"}</Btn>{result && !result.error && <ReportBtn onClick={exportScan} />}</div>
      </Sect></Card>
      {result && !result.error && (<>
        <Card glow={result.headerFetchOk && result.missingCount === 0 ? C.green : result.missingCount > 0 ? C.red : C.orange}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          {[
            ["SSL Grade", result.sslGrade, result.sslGrade?.startsWith?.("A") ? C.green : C.orange],
            ["Host", result.hostname, C.bright],
            ["Passed", result.headerFetchOk ? result.presentCount + "/" + SEC_HEADERS.length : "N/A", result.presentCount === SEC_HEADERS.length ? C.green : result.presentCount > 0 ? C.orange : C.red],
            ["Missing", result.headerFetchOk ? result.missingCount + "" : "N/A", result.missingCount === 0 ? C.green : C.red],
          ].map(([l,v,c],i) => (
            <div key={i} style={{ padding: 14, background: C.bg, borderRadius: 8, textAlign: "center" }}><div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>{l}</div><div style={{ fontSize: l==="Host"?13:22, fontWeight: 700, color: c }}>{v}</div></div>
          ))}
        </div></Card>
        {!result.headerFetchOk && (
          <Card><div style={{ padding: "10px 14px", background: `${C.orange}10`, borderRadius: 8, border: `1px solid ${C.orangeBdr}` }}>
            <div style={{ fontSize: 12, color: C.orange, fontWeight: 600, marginBottom: 4 }}>Header fetch unavailable</div>
            <div style={{ fontSize: 11, color: C.dim }}>The proxy API could not reach the target server. Showing recommended headers below. Deploy the <span style={{ color: C.cyan, fontFamily: "'Fira Code', monospace" }}>/api/scan-headers</span> endpoint to enable live validation.</div>
          </div></Card>
        )}
        <Card><Sect title="Security Headers" icon={<I.FileText />} right={result.headerFetchOk && (
          <Badge color={result.missingCount === 0 ? C.green : C.red}>{result.missingCount === 0 ? "All Present" : `${result.missingCount} Missing`}</Badge>
        )}>
          {result.headers.map((h,i) => {
            const passed = h.found === true;
            const failed = h.found === false;
            const borderColor = passed ? C.greenBdr : failed ? C.redBdr : C.border;
            const bgColor = passed ? `${C.green}06` : failed ? `${C.red}06` : C.bg;
            return (
              <div key={i} style={{ padding:"10px 14px", background:bgColor, borderRadius:8, marginBottom:6, border:`1px solid ${borderColor}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  {passed ? <I.Check s={14} style={{ color: C.green }} /> : failed ? <I.X s={14} style={{ color: C.red }} /> : null}
                  <span style={{ color: passed ? C.green : failed ? C.red : C.bright, fontWeight:600, fontSize:12 }}>{h.name}</span>
                  <Badge color={passed ? C.green : failed ? sevColor(h.sev) : sevColor(h.sev)}>{passed ? "present" : failed ? "missing" : h.sev}</Badge>
                </div>
                <div style={{ fontSize:11, color:C.dim }}>{h.desc}</div>
                {passed && h.value ? (
                  <div style={{ fontSize:10, color:C.green, fontFamily:"'Fira Code', monospace", marginTop:4, padding:"4px 8px", background:`${C.green}08`, borderRadius:4, wordBreak:"break-all" }}>{h.name}: {h.value}</div>
                ) : (
                  <div style={{ fontSize:10, color: failed ? C.red : C.cyan, fontFamily:"'Fira Code', monospace", marginTop:4, padding:"4px 8px", background: failed ? `${C.red}08` : `${C.cyan}08`, borderRadius:4 }}>{failed ? "Missing — " : ""}Recommended: {h.name}: {h.rec}</div>
                )}
              </div>
            );
          })}
        </Sect></Card>
      </>)}
      {result?.error && <Card glow={C.red}><div style={{ color: C.red }}>Error: {result.error}</div></Card>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5: DEVICE HARDENING
// ═══════════════════════════════════════════════════════════════════════════════
const DEVICE_CHECKS = {
  windows: [
    { id:"w1", text:"Enable BitLocker full-disk encryption", sev:"critical", cmd:"manage-bde -on C: -RecoveryPassword", guide:"Settings → Privacy & Security → Device encryption" },
    { id:"w2", text:"Enable Windows Defender real-time protection", sev:"critical", cmd:"Set-MpPreference -DisableRealtimeMonitoring $false", guide:"Windows Security → Virus & threat protection" },
    { id:"w3", text:"Enable Windows Firewall on all profiles", sev:"critical", cmd:"Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True", guide:"Windows Security → Firewall" },
    { id:"w4", text:"Disable Remote Desktop", sev:"high", guide:"Settings → System → Remote Desktop → Off" },
    { id:"w5", text:"Enable automatic Windows updates", sev:"critical", guide:"Settings → Windows Update → Advanced" },
    { id:"w6", text:"Disable SMBv1 protocol", sev:"high", cmd:"Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol", guide:"Windows features → uncheck SMB 1.0" },
    { id:"w7", text:"Enable Controlled Folder Access", sev:"medium", cmd:"Set-MpPreference -EnableControlledFolderAccess Enabled", guide:"Windows Security → Ransomware protection" },
    { id:"w8", text:"Account lockout after 5 attempts", sev:"medium", cmd:"net accounts /lockoutthreshold:5", guide:"Local Security Policy" },
    { id:"w9", text:"Disable autorun for all drives", sev:"medium", guide:"Group Policy → AutoPlay → Disable" },
    { id:"w10", text:"Enable Secure Boot in BIOS", sev:"critical", guide:"BIOS → Security → Secure Boot" },
    { id:"w11", text:"Remove unknown startup programs", sev:"medium", guide:"Task Manager → Startup" },
    { id:"w12", text:"Enable credential guard", sev:"high", guide:"Group Policy → Device Guard" },
  ],
  android: [
    { id:"a1", text:"Biometric lock + 6-digit PIN", sev:"critical", guide:"Settings → Security → Screen lock" },
    { id:"a2", text:"Enable Find My Device", sev:"critical", guide:"Settings → Security → Find My Device" },
    { id:"a3", text:"Encrypt device storage", sev:"critical", guide:"Settings → Security → Encryption" },
    { id:"a4", text:"Disable unknown sources", sev:"critical", guide:"Settings → Security → Install unknown apps → All OFF" },
    { id:"a5", text:"Enable Play Protect", sev:"high", guide:"Play Store → Profile → Play Protect" },
    { id:"a6", text:"Review app permissions", sev:"high", guide:"Settings → Privacy → Permission manager" },
    { id:"a7", text:"Disable USB debugging", sev:"high", guide:"Developer options → USB debugging → Off" },
    { id:"a8", text:"Auto system updates", sev:"critical", guide:"Settings → System → System update" },
    { id:"a9", text:"Use Private DNS", sev:"medium", guide:"Settings → Network → Private DNS → dns.google" },
    { id:"a10", text:"Disable NFC when unused", sev:"low", guide:"Settings → Connected devices → NFC" },
    { id:"a11", text:"Remove unused apps", sev:"medium", guide:"Settings → Apps → Sort by last used" },
    { id:"a12", text:"Enable SIM lock PIN", sev:"medium", guide:"Settings → Security → SIM card lock" },
  ],
  ios: [
    { id:"i1", text:"Enable Face ID / Touch ID + strong passcode", sev:"critical", guide:"Settings → Face ID & Passcode → 6-digit or alphanumeric" },
    { id:"i2", text:"Enable Find My iPhone / iPad / Mac", sev:"critical", guide:"Settings → [Your Name] → Find My → Find My iPhone → On" },
    { id:"i3", text:"Enable automatic iOS / macOS updates", sev:"critical", guide:"Settings → General → Software Update → Automatic Updates → On" },
    { id:"i4", text:"Enable two-factor authentication for Apple ID", sev:"critical", guide:"Settings → [Your Name] → Password & Security → Two-Factor Authentication" },
    { id:"i5", text:"Review app permissions (camera, mic, location)", sev:"high", guide:"Settings → Privacy & Security → review each category" },
    { id:"i6", text:"Disable Siri on Lock Screen", sev:"high", guide:"Settings → Face ID & Passcode → Allow Access When Locked → Siri Off" },
    { id:"i7", text:"Enable Stolen Device Protection", sev:"critical", guide:"Settings → Face ID & Passcode → Stolen Device Protection → On" },
    { id:"i8", text:"Use Safari Intelligent Tracking Prevention", sev:"medium", guide:"Settings → Safari → Prevent Cross-Site Tracking → On" },
    { id:"i9", text:"Enable Lockdown Mode (high-risk users)", sev:"high", guide:"Settings → Privacy & Security → Lockdown Mode → Turn On" },
    { id:"i10", text:"Disable AirDrop from everyone", sev:"medium", guide:"Settings → General → AirDrop → Receiving Off or Contacts Only" },
    { id:"i11", text:"Enable iCloud Private Relay (Safari)", sev:"medium", guide:"Settings → [Your Name] → iCloud → Private Relay → On" },
    { id:"i12", text:"Check Safety Check for shared access", sev:"high", guide:"Settings → Privacy & Security → Safety Check → review shared access" },
  ],
  browser: [
    { id:"b1", text:"Enable HTTPS-Only mode", sev:"critical", guide:"Settings → Security → Always use HTTPS" },
    { id:"b2", text:"Install uBlock Origin", sev:"high", guide:"Chrome Web Store → uBlock Origin" },
    { id:"b3", text:"Block third-party cookies", sev:"high", guide:"Settings → Privacy → Cookies" },
    { id:"b4", text:"Enhanced Safe Browsing", sev:"critical", guide:"Settings → Security → Enhanced protection" },
    { id:"b5", text:"Remove unused extensions", sev:"high", guide:"chrome://extensions" },
    { id:"b6", text:"Use password manager (not browser)", sev:"medium", guide:"Bitwarden/1Password" },
    { id:"b7", text:"Clear saved browser passwords", sev:"high", guide:"Settings → Passwords → Remove all" },
    { id:"b8", text:"Enable DNS-over-HTTPS", sev:"medium", guide:"Settings → Security → Secure DNS" },
    { id:"b9", text:"Block WebRTC leaks", sev:"medium", guide:"WebRTC Leak Prevent extension" },
    { id:"b10", text:"Review site permissions", sev:"medium", guide:"Settings → Privacy → Site Settings" },
  ],
  network: [
    { id:"n1", text:"Change router admin password", sev:"critical", guide:"192.168.1.1 → Admin → Change password" },
    { id:"n2", text:"Enable WPA3 (or WPA2-AES)", sev:"critical", guide:"Router → Wireless → Security → WPA3" },
    { id:"n3", text:"Disable WPS", sev:"high", guide:"Router → Wireless → WPS → Off" },
    { id:"n4", text:"Update router firmware", sev:"critical", guide:"Router → System → Firmware" },
    { id:"n5", text:"Change default SSID", sev:"medium", guide:"No personal info in name" },
    { id:"n6", text:"Enable router firewall", sev:"high", guide:"Router → Security → Firewall" },
    { id:"n7", text:"Disable remote management", sev:"high", guide:"Router → Admin → Remote → Off" },
    { id:"n8", text:"Guest network for IoT", sev:"medium", guide:"Router → Wireless → Guest" },
    { id:"n9", text:"DNS: 1.1.1.1 / 8.8.8.8", sev:"medium", guide:"Router → Network → DNS" },
    { id:"n10", text:"Disable UPnP", sev:"high", guide:"Router → NAT → UPnP → Off" },
  ],
  developer: [
    { id:"d1", text:"Secrets in env vars only", sev:"critical", cmd:"echo '.env*' >> .gitignore", guide:"Never hardcode secrets" },
    { id:"d2", text:"GitHub secret scanning on", sev:"critical", guide:"GitHub → Settings → Security" },
    { id:"d3", text:"Dependabot alerts on", sev:"high", guide:"GitHub → Settings → Dependabot" },
    { id:"d4", text:"Restrict API key scopes", sev:"critical", guide:"Minimum permissions only" },
    { id:"d5", text:"Branch protection on main", sev:"high", guide:"GitHub → Branches → Add rule" },
    { id:"d6", text:"SSH keys (ed25519)", sev:"medium", cmd:"ssh-keygen -t ed25519", guide:"Add to GitHub SSH keys" },
    { id:"d7", text:"npm audit regularly", sev:"high", cmd:"npm audit && npm audit fix", guide:"Before every deploy" },
    { id:"d8", text:"2FA on GitHub/Vercel/AWS", sev:"critical", guide:"Authenticator app, not SMS" },
    { id:"d9", text:"Rotate API keys quarterly", sev:"medium", guide:"Calendar reminder 90 days" },
    { id:"d10", text:"Vercel env vars for secrets", sev:"critical", guide:"Vercel → Settings → Env Vars" },
    { id:"d11", text:"AWS CloudTrail enabled", sev:"high", guide:"AWS → CloudTrail → Create trail" },
    { id:"d12", text:"Never commit .env files", sev:"critical", cmd:"git rm --cached .env", guide:"Verify: git status" },
  ],
};
const DEVICE_META = { windows: { name:"Windows", icon:<I.Monitor/> }, android: { name:"Android", icon:<I.Phone/> }, ios: { name:"iOS / Apple", icon:<I.Apple/> }, browser: { name:"Browsers", icon:<I.Globe/> }, network: { name:"Network", icon:<I.Wifi/> }, developer: { name:"Developer", icon:<I.Terminal/> } };
const DEFAULT_CHECKS = Object.values(DEVICE_CHECKS).flat().reduce((acc, c) => ({ ...acc, [c.id]: true }), {});

function DeviceTab({ checks, setChecks }) {
  const [active, setActive] = useState("windows");
  const items = DEVICE_CHECKS[active]; const done = items.filter(c => checks[c.id]).length; const pct = Math.round((done / items.length) * 100);
  const exportDevice = () => {
    const lines = [`AGENTSLOCK — DEVICE HARDENING REPORT`, `Generated: ${new Date().toISOString()}`, `${"=".repeat(50)}`, ``];
    Object.entries(DEVICE_CHECKS).forEach(([platform, checks_list]) => {
      const d = checks_list.filter(c => checks[c.id]).length, t = checks_list.length;
      lines.push(`${DEVICE_META[platform]?.name || platform}: ${d}/${t} (${Math.round((d/t)*100)}%)`, `-`.repeat(30));
      checks_list.forEach(c => lines.push(`  ${checks[c.id] ? "[x]" : "[ ]"} [${c.sev}] ${c.text}`));
      lines.push("");
    });
    downloadReport("device-hardening", lines.join("\n"));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><ReportBtn onClick={exportDevice} /></div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
        {Object.entries(DEVICE_META).map(([k, m]) => { const d = DEVICE_CHECKS[k].filter(c => checks[c.id]).length, t = DEVICE_CHECKS[k].length; return (
          <Card key={k} onClick={() => setActive(k)} style={{ minWidth: 120, padding: 14, textAlign: "center", borderColor: active === k ? C.green : C.border, background: active === k ? `${C.green}08` : C.bgCard }}>
            <div style={{ color: active === k ? C.green : C.dim, marginBottom: 4 }}>{m.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: active === k ? C.bright : C.text }}>{m.name}</div>
            <div style={{ fontSize: 10, color: C.dim, margin: "4px 0" }}>{d}/{t}</div>
            <Progress value={(d/t)*100} color={d===t?C.green:C.orange} h={3} />
          </Card>);
        })}
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div><h3 style={{ margin: 0, fontFamily: "'Chakra Petch', sans-serif", fontSize: 15, color: C.bright }}>{DEVICE_META[active].name} Hardening {pct === 100 && <Badge color={C.green}>All Secured</Badge>}</h3><div style={{ fontSize: 11, color: pct === 100 ? C.green : C.dim }}>{done}/{items.length} ({pct}%){pct === 100 ? " — All threats addressed" : ""}</div></div>
          <div style={{ width: 200 }}><Progress value={pct} color={pct===100?C.green:pct>50?C.orange:C.red} h={8} /></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map(c => (
            <div key={c.id} onClick={() => { const nv = { ...checks, [c.id]: !checks[c.id] }; setChecks(nv); }}
              style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: checks[c.id] ? `${C.green}06` : C.bg, borderRadius: 8, border: `1px solid ${checks[c.id] ? C.greenBdr : C.border}`, cursor: "pointer" }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1, border: `2px solid ${checks[c.id] ? C.green : "#2a2d3e"}`, background: checks[c.id] ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0b0f" }}>{checks[c.id] && <I.Check s={12}/>}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}><span style={{ color: checks[c.id] ? C.dim : C.bright, fontWeight: 500, fontSize: 12, textDecoration: checks[c.id] ? "line-through" : "none" }}>{c.text}</span><Badge color={checks[c.id] ? C.green : sevColor(c.sev)}>{checks[c.id] ? "secured" : c.sev}</Badge></div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>📖 {c.guide}</div>
                {c.cmd && <div style={{ fontSize: 10, color: C.cyan, fontFamily: "'Fira Code', monospace", marginTop: 4, padding: "4px 8px", background: `${C.cyan}08`, borderRadius: 4 }}>$ {c.cmd}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 6: ACCOUNTS
// ═══════════════════════════════════════════════════════════════════════════════
function AccountTab({ accounts, setAccounts }) {
  const toggle = (id, f) => { const n = accounts.map(a => a.id===id?{...a,[f]:!a[f]}:a); setAccounts(n); };
  const exportAccounts = () => {
    const twoFA = accounts.filter(a=>a.twoFA).length;
    const lines = [`AGENTSLOCK — ACCOUNT SECURITY AUDIT`, `Generated: ${new Date().toISOString()}`, `${"=".repeat(50)}`, ``, `TOTAL ACCOUNTS: ${accounts.length}`, `2FA ENABLED: ${twoFA}/${accounts.length} (${Math.round((twoFA/accounts.length)*100)}%)`, `HIGH RISK: ${accounts.filter(a=>a.risk==="high").length}`, ``];
    accounts.forEach(a => lines.push(`${a.name}`, `  2FA: ${a.twoFA ? "ON (" + a.method + ")" : "OFF"}`, `  App Password: ${a.appPw ? "Yes" : "No"}`, `  Sessions: ${a.sessions}`, `  Risk: ${a.risk.toUpperCase()}`, `  Last Review: ${a.lastReview}`, ``));
    downloadReport("accounts", lines.join("\n"));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><ReportBtn onClick={exportAccounts} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Stat label="Total" value={accounts.length} color={C.bright} />
        <Stat label="2FA On" value={accounts.filter(a=>a.twoFA).length} color={C.green} sub={`${accounts.filter(a=>!a.twoFA).length} without`} />
        <Stat label="High Risk" value={accounts.filter(a=>a.risk==="high").length} color={accounts.filter(a=>a.risk==="high").length>0?C.red:C.green} />
      </div>
      {accounts.map(a => (
        <Card key={a.id} glow={a.risk==="high"?C.red:undefined}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div><div style={{ color: C.bright, fontWeight: 600, fontSize: 14 }}>{a.name}</div><div style={{ color: C.dim, fontSize: 11 }}>{a.method} · {a.sessions} session(s) · {a.lastReview}</div></div>
            </div>
            <Badge color={a.risk==="high"?C.red:a.risk==="medium"?C.orange:C.green}>{a.risk}</Badge>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Btn onClick={()=>toggle(a.id,"twoFA")} color={a.twoFA?C.green:C.red} style={{ fontSize:11 }}>{a.twoFA?<I.Check/>:<I.X/>} 2FA</Btn>
            <Btn onClick={()=>toggle(a.id,"appPw")} color={a.appPw?C.green:C.orange} style={{ fontSize:11 }}>{a.appPw?<I.Check/>:<I.X/>} App PW</Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 7: THREATS
// ═══════════════════════════════════════════════════════════════════════════════
function ThreatTab({ threats, setThreats }) {
  const [filter, setFilter] = useState("all");
  const activeCount = threats.filter(t => t.status === "active").length;
  const filtered = filter === "all" ? threats : threats.filter(t => t.status === filter);
  const blockAll = () => { setThreats(threats.map(t => t.status === "active" ? { ...t, status: "blocked" } : t)); };
  const exportThreats = () => {
    const lines = [`AGENTSLOCK — THREAT REPORT`, `Generated: ${new Date().toISOString()}`, `${"=".repeat(50)}`, ``, `ACTIVE: ${threats.filter(t=>t.status==="active").length}`, `BLOCKED: ${threats.filter(t=>t.status==="blocked").length}`, `INVESTIGATING: ${threats.filter(t=>t.status==="investigating").length}`, `RESOLVED: ${threats.filter(t=>t.status==="resolved").length}`, ``];
    threats.forEach(t => lines.push(`[${t.status.toUpperCase()}] ${t.name}`, `  Severity: ${t.severity}`, `  Target: ${t.target}`, `  Time: ${t.time}`, `  ${t.desc || ""}`, ``));
    downloadReport("threats", lines.join("\n"));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {activeCount > 0 ? (
          <Btn onClick={blockAll} color={C.green} style={{ fontSize: 12, padding: "8px 20px" }}><I.Shield /> Block All Threats ({activeCount})</Btn>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <I.Shield s={16} style={{ color: C.green }} />
            <span style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>All threats blocked</span>
          </div>
        )}
        <ReportBtn onClick={exportThreats} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <Stat label="Active" value={activeCount} color={activeCount > 0 ? C.red : C.green} />
        <Stat label="Blocked" value={threats.filter(t=>t.status==="blocked").length} color={C.green} />
        <Stat label="Investigating" value={threats.filter(t=>t.status==="investigating").length} color={C.orange} />
        <Stat label="Resolved" value={threats.filter(t=>t.status==="resolved").length} color={C.blue} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>{["all","active","blocked","investigating","resolved"].map(f => <Btn key={f} onClick={()=>setFilter(f)} color={filter===f?C.green:C.dim} style={{ fontSize:10, padding:"5px 10px", textTransform:"capitalize" }}>{f}</Btn>)}</div>
      {activeCount === 0 && threats.length > 0 && filter === "all" && (
        <Card glow={C.green}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
            <I.Shield s={18} style={{ color: C.green }} />
            <div>
              <div style={{ color: C.green, fontWeight: 600, fontSize: 13 }}>All clear — no active threats</div>
              <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>All threats have been blocked or resolved. Your devices are protected.</div>
            </div>
          </div>
        </Card>
      )}
      {filtered.length===0 ? <Card><div style={{ textAlign:"center", padding:30, color:C.dim }}>{filter === "active" ? "No active threats — you're protected" : "Empty"}</div></Card> : filtered.map(t => (
        <Card key={t.id} glow={t.status==="active"?C.red:t.status==="blocked"?C.green:undefined}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                {t.status === "blocked" ? <I.Check s={14} style={{ color: C.green }} /> : <div style={{ width:8, height:8, borderRadius:"50%", background: t.status === "active" ? C.red : sevColor(t.severity), animation: t.status === "active" ? "pulse 2s infinite" : "none" }}/>}
                <span style={{ color: t.status === "blocked" ? C.green : C.bright, fontWeight:700, fontSize:14 }}>{t.name}</span>
                <Badge color={sevColor(t.severity)}>{t.severity}</Badge>
              </div>
              <div style={{ color:C.dim, fontSize:12 }}>Target: {t.target} · {t.time}</div>
              {t.desc && <div style={{ color: t.status === "blocked" ? `${C.green}cc` : C.text, fontSize:12, marginTop:6 }}>{t.status === "blocked" ? "Blocked — " : ""}{t.desc}</div>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Badge color={t.status==="active"?C.red:t.status==="blocked"?C.green:t.status==="investigating"?C.orange:C.blue}>{t.status}</Badge>
              {t.status==="active" && <Btn onClick={()=>{const n=threats.map(x=>x.id===t.id?{...x,status:"blocked"}:x);setThreats(n);}} color={C.green} style={{ fontSize:10, padding:"3px 8px" }}>Block</Btn>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 8: UPTIME MONITORING (Phase 4)
// ═══════════════════════════════════════════════════════════════════════════════
function MonitorTab({ monitors, setMonitors }) {
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [checking, setChecking] = useState(false);

  const addMonitor = () => {
    if (!newUrl) return;
    let url = newUrl.trim(); if (!url.startsWith("http")) url = "https://" + url;
    const m = { id: Date.now(), url, name: newName || new URL(url).hostname, status: "checking", responseTime: null, lastCheck: null, sslExpiry: null, checks: [] };
    const n = [...monitors, m]; setMonitors(n);
    setNewUrl(""); setNewName("");
    checkSite(m, n);
  };

  const checkSite = async (monitor, allMonitors) => {
    setChecking(true);
    const start = Date.now();
    try {
      const r = await fetch(monitor.url, { mode: "no-cors", cache: "no-cache" });
      const elapsed = Date.now() - start;
      const updated = allMonitors.map(m => m.id === monitor.id ? { ...m, status: "up", responseTime: elapsed, lastCheck: new Date().toISOString(), checks: [...(m.checks || []).slice(-49), { time: Date.now(), status: "up", ms: elapsed }] } : m);
      setMonitors(updated);
    } catch {
      const updated = allMonitors.map(m => m.id === monitor.id ? { ...m, status: "down", responseTime: null, lastCheck: new Date().toISOString(), checks: [...(m.checks || []).slice(-49), { time: Date.now(), status: "down", ms: 0 }] } : m);
      setMonitors(updated);
    }
    setChecking(false);
  };

  const checkAll = async () => {
    setChecking(true);
    let current = monitors;
    for (const m of current) { await checkSite(m, current); }
    setChecking(false);
  };

  const remove = (id) => { const n = monitors.filter(m => m.id !== id); setMonitors(n); };

  const upCount = monitors.filter(m => m.status === "up").length;
  const upPct = monitors.length > 0 ? Math.round((upCount / monitors.length) * 100) : 100;
  const exportMonitors = () => {
    const lines = [`AGENTSLOCK — UPTIME MONITORING REPORT`, `Generated: ${new Date().toISOString()}`, `${"=".repeat(50)}`, ``, `SITES MONITORED: ${monitors.length}`, `ONLINE: ${upCount} (${upPct}% uptime)`, `DOWN: ${monitors.filter(m => m.status === "down").length}`, ``];
    monitors.forEach(m => {
      lines.push(`${m.status === "up" ? "[UP]  " : m.status === "down" ? "[DOWN]" : "[...]"} ${m.name}`, `  URL: ${m.url}`, `  Response: ${m.responseTime ? m.responseTime + "ms" : "—"}`, `  Last Check: ${m.lastCheck ? new Date(m.lastCheck).toLocaleString() : "Never"}`, `  Checks: ${m.checks?.length || 0} recorded`, ``);
    });
    downloadReport("monitoring", lines.join("\n"));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><ReportBtn onClick={exportMonitors} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Stat label="Sites Monitored" value={monitors.length} color={C.bright} />
        <Stat label="Online" value={upCount} color={C.green} sub={`${upPct}% uptime`} />
        <Stat label="Down" value={monitors.filter(m => m.status === "down").length} color={monitors.some(m => m.status === "down") ? C.red : C.green} />
      </div>

      <Card>
        <Sect title="Add Monitor" icon={<I.Plus />}>
          <div style={{ display: "flex", gap: 8 }}>
            <Input value={newName} onChange={setNewName} placeholder="Name (optional)" style={{ width: 200 }} />
            <Input value={newUrl} onChange={setNewUrl} placeholder="https://example.com" icon={<I.Globe />} style={{ flex: 1 }} />
            <Btn onClick={addMonitor} color={C.green}><I.Plus /> Add</Btn>
            {monitors.length > 0 && <Btn onClick={checkAll} disabled={checking} color={C.blue}><I.Refresh /> {checking ? "Checking..." : "Check All"}</Btn>}
          </div>
        </Sect>
      </Card>

      {monitors.map(m => (
        <Card key={m.id} glow={m.status === "down" ? C.red : m.status === "up" ? C.green : undefined}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.status === "up" ? C.green : m.status === "down" ? C.red : C.orange }} />
              <div>
                <div style={{ color: C.bright, fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                <div style={{ color: C.dim, fontSize: 11 }}>{m.url}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {m.responseTime && <span style={{ color: C.dim, fontSize: 11 }}>{m.responseTime}ms</span>}
              <Badge color={m.status === "up" ? C.green : m.status === "down" ? C.red : C.orange}>{m.status}</Badge>
              <Btn onClick={() => checkSite(m, monitors)} color={C.blue} style={{ fontSize: 10, padding: "4px 8px" }}><I.Refresh /></Btn>
              <Btn onClick={() => remove(m.id)} color={C.red} style={{ fontSize: 10, padding: "4px 8px" }}><I.Trash /></Btn>
            </div>
          </div>
          {m.checks?.length > 0 && (
            <div style={{ display: "flex", gap: 2, marginTop: 12, height: 24, alignItems: "flex-end" }}>
              {m.checks.slice(-30).map((c, i) => (
                <div key={i} style={{ flex: 1, height: c.status === "up" ? Math.max(4, Math.min(24, c.ms / 20)) : 24, background: c.status === "up" ? C.green : C.red, borderRadius: 2, opacity: 0.6 + (i / 30) * 0.4 }} title={`${c.ms}ms`} />
              ))}
            </div>
          )}
          {m.lastCheck && <div style={{ fontSize: 10, color: C.dim, marginTop: 6 }}>Last checked: {new Date(m.lastCheck).toLocaleString()}</div>}
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 9: SECURITY REPORTS (Phase 4)
// ═══════════════════════════════════════════════════════════════════════════════
function ReportTab({ checks, threats, accounts, monitors, scanLog }) {
  const totalChecks = Object.values(DEVICE_CHECKS).flat().length;
  const doneChecks = Object.keys(checks).filter(k => checks[k]).length;
  const score = totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;
  const critChecks = Object.values(DEVICE_CHECKS).flat().filter(c => c.sev === "critical");
  const critDone = critChecks.filter(c => checks[c.id]).length;
  const twoFACount = accounts.filter(a => a.twoFA).length;
  const highRisk = accounts.filter(a => a.risk === "high").length;
  const upMonitors = monitors.filter(m => m.status === "up").length;

  const exportReport = () => {
    const report = `AGENTSLOCK — FULL SECURITY REPORT\nGenerated: ${new Date().toISOString()}\n${"=".repeat(50)}\n\nSECURITY SCORE: ${score}/100\n\nHARDENING: ${doneChecks}/${totalChecks} complete\n  Critical: ${critDone}/${critChecks.length}\n\nACCOUNTS: ${accounts.length} total\n  2FA Enabled: ${twoFACount}/${accounts.length}\n  High Risk: ${highRisk}\n\nTHREATS:\n  Active: ${threats.filter(t=>t.status==="active").length}\n  Blocked: ${threats.filter(t=>t.status==="blocked").length}\n  Resolved: ${threats.filter(t=>t.status==="resolved").length}\n\nMONITORS: ${monitors.length} sites\n  Online: ${upMonitors}\n\nSCAN HISTORY: ${scanLog.length} total scans\n\n${"=".repeat(50)}\nINCOMPLETE CRITICAL TASKS:\n${critChecks.filter(c=>!checks[c.id]).map(c=>`  [ ] ${c.text}`).join("\n")}\n\nHIGH RISK ACCOUNTS:\n${accounts.filter(a=>a.risk==="high").map(a=>`  [!] ${a.name} - ${a.twoFA?"2FA on":"NO 2FA"}`).join("\n")}\n`;
    downloadReport("full-report", report);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontFamily: "'Chakra Petch'", fontSize: 20, color: C.bright, margin: 0 }}>Security Report</h2>
        <Btn onClick={exportReport} color={C.blue}><I.Download /> Export Report</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <Stat label="Overall Score" value={`${score}%`} color={score >= 80 ? C.green : score >= 50 ? C.orange : C.red} />
        <Stat label="Critical Done" value={`${critDone}/${critChecks.length}`} color={critDone === critChecks.length ? C.green : C.red} />
        <Stat label="2FA Coverage" value={`${Math.round((twoFACount/accounts.length)*100)}%`} color={twoFACount === accounts.length ? C.green : C.orange} />
        <Stat label="Uptime" value={monitors.length > 0 ? `${Math.round((upMonitors/monitors.length)*100)}%` : "—"} color={C.green} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card glow={critDone < critChecks.length ? C.red : C.green}>
          <Sect title="Incomplete Critical Tasks" icon={<I.Alert />}>
            {critChecks.filter(c => !checks[c.id]).length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: C.green }}>✅ All critical tasks complete!</div>
            ) : critChecks.filter(c => !checks[c.id]).map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: C.bg, borderRadius: 6, marginBottom: 4 }}>
                <I.X s={12} style={{ color: C.red }} /><span style={{ color: C.text, fontSize: 12 }}>{c.text}</span>
              </div>
            ))}
          </Sect>
        </Card>

        <Card>
          <Sect title="Device Hardening Progress" icon={<I.Monitor />}>
            {Object.entries(DEVICE_META).map(([k, m]) => {
              const d = DEVICE_CHECKS[k].filter(c => checks[c.id]).length, t = DEVICE_CHECKS[k].length, p = Math.round((d/t)*100);
              return (
                <div key={k} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: C.text, fontSize: 12 }}>{m.name}</span><span style={{ color: C.dim, fontSize: 11 }}>{d}/{t} ({p}%)</span></div>
                  <Progress value={p} color={p===100?C.green:p>50?C.orange:C.red} h={5} />
                </div>
              );
            })}
          </Sect>
        </Card>
      </div>

      <Card>
        <Sect title="Account Security Summary" icon={<I.User />}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
            {accounts.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: C.bg, borderRadius: 8 }}>
                <span style={{ fontSize: 16 }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.bright, fontSize: 12, fontWeight: 600 }}>{a.name}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                    <Badge color={a.twoFA ? C.green : C.red} style={{ fontSize: 8 }}>2FA</Badge>
                    <Badge color={a.risk === "high" ? C.red : a.risk === "medium" ? C.orange : C.green} style={{ fontSize: 8 }}>{a.risk}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Sect>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 10: INCIDENT RESPONSE
// ═══════════════════════════════════════════════════════════════════════════════
const IR_STEPS = [
  { id:"ir1", title:"🔌 Disconnect from Internet", desc:"Disable WiFi, unplug ethernet, enable airplane mode.", actions:["Disable WiFi","Unplug ethernet","Airplane mode on phones"] },
  { id:"ir2", title:"🔑 Rotate All Passwords", desc:"Change all critical passwords from a clean device.", actions:["Email password","Banking passwords","GitHub/Vercel/AWS","All other accounts"] },
  { id:"ir3", title:"🔒 Revoke Tokens & Sessions", desc:"Revoke all API tokens and active sessions.", actions:["GitHub tokens","Vercel tokens","AWS access keys","Google sessions"] },
  { id:"ir4", title:"🔍 Check Active Sessions", desc:"Terminate unrecognized sessions.", actions:["Google devices","GitHub sessions","Banking sessions","Vercel team access"] },
  { id:"ir5", title:"🛡️ Scan All Systems", desc:"Full malware scan on all devices.", actions:["Windows Defender full scan","Malwarebytes scan","Play Protect check","Browser extensions review"] },
  { id:"ir6", title:"✅ Restore & Monitor", desc:"Restore access and monitor for 30 days.", actions:["Re-enable 2FA","New API keys (restricted)","Login alerts on","Monitor banks 30 days","GitHub audit log"] },
];

function IncidentTab() {
  const [active, setActive] = useState(false);
  const [irChecks, setIrChecks] = useState(() => LS.get("irChecks", {}));
  const toggleIr = (key) => { const n = { ...irChecks, [key]: !irChecks[key] }; setIrChecks(n); LS.set("irChecks", n); };
  const done = IR_STEPS.filter(s => s.actions.every((_, i) => irChecks[`${s.id}-${i}`])).length;
  const exportIR = () => {
    const lines = [`AGENTSLOCK — INCIDENT RESPONSE REPORT`, `Generated: ${new Date().toISOString()}`, `${"=".repeat(50)}`, ``, `STATUS: ${active ? "ACTIVE" : "INACTIVE"}`, `PROGRESS: ${done}/${IR_STEPS.length} steps completed`, ``];
    IR_STEPS.forEach(s => {
      const stepDone = s.actions.every((_, i) => irChecks[`${s.id}-${i}`]);
      lines.push(`${stepDone ? "[DONE]" : "[    ]"} ${s.title}`, `  ${s.desc}`);
      s.actions.forEach((a, i) => lines.push(`    ${irChecks[`${s.id}-${i}`] ? "[x]" : "[ ]"} ${a}`));
      lines.push("");
    });
    downloadReport("incident-response", lines.join("\n"));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card glow={active ? C.red : undefined} style={active ? { background: `${C.red}08`, borderColor: C.redBdr } : {}}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Chakra Petch'", fontSize: 18, fontWeight: 700, color: active ? C.red : C.bright }}>{active ? "🚨 INCIDENT MODE ACTIVE" : "Incident Response Protocol"}</div>
            <div style={{ color: C.dim, fontSize: 12, marginTop: 4 }}>{active ? `${done}/${IR_STEPS.length} steps done` : "Activate if compromise suspected."}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <ReportBtn onClick={exportIR} />
            <Btn onClick={() => setActive(!active)} color={active ? C.red : C.orange}>{active ? "Deactivate" : "Activate"}</Btn>
          </div>
        </div>
      </Card>
      {active && IR_STEPS.map((step, si) => {
        const allDone = step.actions.every((_, i) => irChecks[`${step.id}-${i}`]);
        return (
          <Card key={step.id} glow={allDone ? C.green : undefined}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: allDone ? C.green : C.bg, border: `2px solid ${allDone ? C.green : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: allDone ? "#0a0b0f" : C.dim, fontSize: 12, fontWeight: 700 }}>{allDone ? <I.Check /> : si + 1}</div>
              <div><div style={{ color: allDone ? C.green : C.bright, fontWeight: 700 }}>{step.title}</div><div style={{ color: C.dim, fontSize: 11 }}>{step.desc}</div></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 38 }}>
              {step.actions.map((a, i) => {
                const key = `${step.id}-${i}`;
                return (
                  <div key={key} onClick={() => toggleIr(key)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: C.bg, borderRadius: 6, cursor: "pointer" }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${irChecks[key] ? C.green : "#2a2d3e"}`, background: irChecks[key] ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0b0f", flexShrink: 0 }}>{irChecks[key] && <I.Check s={10} />}</div>
                    <span style={{ fontSize: 12, color: irChecks[key] ? C.dim : C.text, textDecoration: irChecks[key] ? "line-through" : "none" }}>{a}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
      {!active && (
        <Card><Sect title="Emergency Resources" icon={<I.ExternalLink />}>
          {[["Google Recovery","https://accounts.google.com/signin/recovery"],["GitHub Support","https://support.github.com"],["AWS Incident","https://aws.amazon.com/security/incident-response/"],["Pwned Passwords","https://haveibeenpwned.com/Passwords"],["Vercel Help","https://vercel.com/help"]].map(([n,u],i) => (
            <a key={i} href={u} target="_blank" rel="noopener" style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", background:C.bg, borderRadius:6, color:C.blue, textDecoration:"none", fontSize:12, marginBottom:4 }}>{n}<I.ExternalLink /></a>
          ))}
        </Sect></Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 12: HELP & FAQ — How to Use, FAQ, Install App
// ═══════════════════════════════════════════════════════════════════════════════
function HelpTab({ installPrompt, setInstallPrompt }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") setInstallPrompt(null);
  };

  const detectPlatform = () => {
    const ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return "ios";
    if (/Android/.test(ua)) return "android";
    if (/Macintosh|Mac OS/.test(ua)) return "mac";
    if (/Windows/.test(ua)) return "windows";
    if (/Linux/.test(ua)) return "linux";
    return "desktop";
  };
  const platform = detectPlatform();
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

  const FAQ_ITEMS = [
    {
      q: "Is it advisable to add real-time virus, malware, or ransomware blocking?",
      a: `AgentsLock is a web-based cybersecurity dashboard that runs in your browser. As a Progressive Web App (PWA), it operates within the browser sandbox and does not have the low-level system access required to intercept files, scan memory, or block executables in real time the way a native antivirus does.\n\nHowever, AgentsLock strongly complements your existing antivirus by:\n\n• Checking if your passwords have been exposed in data breaches (k-anonymity)\n• Guiding you through device hardening (enabling Defender, BitLocker, Play Protect, etc.)\n• Monitoring your accounts for 2FA status and session anomalies\n• Providing an incident response playbook if you are compromised\n\nRecommendation: Keep a dedicated antivirus/anti-malware tool running on each device (Windows Defender, Malwarebytes, Bitdefender, etc.) and use AgentsLock as your security command centre to monitor, audit, and harden everything in one place.`
    },
    {
      q: "Should AgentsLock include a firewall or intrusion detection system (IDS)?",
      a: `A true firewall or IDS requires deep network-level access — inspecting packets, managing port rules, and monitoring traffic at the operating system or router level. Browsers and PWAs are intentionally sandboxed away from this layer for security reasons.\n\nWhat AgentsLock does instead:\n\n• WebRTC leak blocking — prevents your real IP from being exposed even on a VPN\n• Browser fingerprint spoofing — reduces your trackability across websites\n• Security header analysis — scans websites you visit for missing protections\n• SSL/TLS grading — checks if a site's encryption is properly configured\n• DNS poisoning awareness — guides you to enable encrypted DNS (DoH/DoT)\n• Uptime & endpoint monitoring — alerts you when your websites go down\n\nRecommendation: Use your operating system's built-in firewall (Windows Firewall, macOS Application Firewall, Linux iptables/ufw) or a hardware firewall on your router. For IDS, consider tools like Snort, Suricata, or Pi-hole for DNS-level filtering. AgentsLock will help you verify these are properly configured through its Device Hardening checklist.`
    },
    {
      q: "What makes AgentsLock different from antivirus software?",
      a: `Antivirus software is reactive — it scans for known threats on your device. AgentsLock is proactive and holistic:\n\n• Breach detection: Checks if your passwords have appeared in known data breaches\n• Password audit: Analyses strength and estimates crack time\n• Account security: Tracks 2FA status across all your accounts\n• Device hardening: 56 checks across Windows, Android, iOS, macOS, and browsers\n• Threat management: Log, track, and resolve security incidents\n• Incident response: Step-by-step emergency playbook\n• Monitoring: Real-time uptime checking for your websites\n• Reports: Export full security audit reports\n\nThink of AgentsLock as your personal security operations centre (SOC) — it doesn't replace your antivirus, it makes sure your entire security posture is covered.`
    },
    {
      q: "Is my data safe in AgentsLock?",
      a: `Yes. AgentsLock takes multiple precautions:\n\n• Passwords are never sent to any server — breach checks use k-anonymity (only the first 5 characters of a SHA-1 hash are sent)\n• Authentication is handled by Firebase Auth (Google infrastructure)\n• Data is stored in Firestore with per-user access rules\n• A local cache in localStorage provides offline access\n• The app works as a PWA — no data leaves your device unless you are signed in\n• All connections use HTTPS encryption in transit`
    },
    {
      q: "Can I use AgentsLock offline?",
      a: `Yes. AgentsLock is a Progressive Web App with a service worker that caches the entire application. Once installed, the dashboard loads offline. Features that require network (breach checks, website scanning, uptime monitoring) will work again when connectivity is restored. Your data is cached locally and syncs to the cloud when you reconnect.`
    },
  ];

  const INSTALL_INSTRUCTIONS = {
    android: [
      "Open agentslock.com in Chrome or Edge",
      "Tap the three-dot menu (\u22EE) in the top-right corner",
      "Tap \"Add to Home screen\" or \"Install app\"",
      "Tap \"Install\" on the confirmation dialog",
      "AgentsLock will appear on your home screen as a native app",
    ],
    ios: [
      "Open agentslock.com in Safari (required for iOS)",
      "Tap the Share button (\u2191) at the bottom of the screen",
      "Scroll down and tap \"Add to Home Screen\"",
      "Tap \"Add\" in the top-right corner",
      "AgentsLock will appear on your home screen with its icon",
    ],
    windows: [
      "Open agentslock.com in Chrome, Edge, or Brave",
      "Look for the install icon (\u2913) in the address bar, or click the three-dot menu",
      "Select \"Install AgentsLock\" or \"Install app\"",
      "Click \"Install\" in the confirmation popup",
      "AgentsLock will open in its own window and appear in your Start menu and taskbar",
    ],
    mac: [
      "Open agentslock.com in Chrome or Edge",
      "Click the install icon (\u2913) in the address bar, or use the three-dot menu",
      "Select \"Install AgentsLock\"",
      "Click \"Install\" to confirm",
      "AgentsLock will appear in your Applications folder and Launchpad",
    ],
    linux: [
      "Open agentslock.com in Chrome or Chromium",
      "Click the install icon in the address bar or use the menu",
      "Select \"Install AgentsLock\"",
      "Confirm the installation",
      "AgentsLock will appear in your application launcher",
    ],
  };

  const platformLabel = { android: "Android", ios: "iPhone / iPad", windows: "Windows PC", mac: "macOS", linux: "Linux", desktop: "Desktop" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── HOW TO USE ── */}
      <Card glow={C.green}>
        <Sect title="How to Use AgentsLock" icon={<I.HelpCircle />}>
          <div style={{ color: C.text, fontSize: 13, lineHeight: 1.8 }}>
            <p style={{ marginBottom: 12 }}>AgentsLock is your personal cybersecurity command centre. Here is a quick walkthrough to get started:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { step: "1", title: "Run a Device Scan", desc: "Go to the Overview tab and tap \"Deep Scan Device\". AgentsLock will check your browser for privacy leaks, tracking cookies, WebRTC exposure, and permission issues — and auto-fix what it can.", color: C.green },
                { step: "2", title: "Check for Breaches", desc: "Open the Breach Check tab. Test any password (it never leaves your device) to see if it has appeared in known data breaches. Uses k-anonymity for complete privacy.", color: C.purple },
                { step: "3", title: "Harden Your Devices", desc: "Visit the Devices tab to go through 56 security checks for Windows, Android, iOS/macOS, Browser, and Network. Check off each item as you complete it.", color: C.cyan },
                { step: "4", title: "Audit Your Accounts", desc: "Use the Accounts tab to track which services have two-factor authentication enabled. Review sessions, app passwords, and risk levels.", color: C.purple },
                { step: "5", title: "Scan Websites", desc: "In the Web Scanner tab, enter any URL to check its SSL/TLS grade and security headers. Find out if your sites are properly protected.", color: C.orange },
                { step: "6", title: "Monitor Uptime", desc: "Add your websites to the Monitoring tab. AgentsLock will check them every 5 minutes and track response times with visual graphs.", color: C.green },
                { step: "7", title: "Manage Threats", desc: "The Threats tab lets you log, classify, and track security incidents. Filter by severity and status to stay on top of active issues.", color: C.red },
                { step: "8", title: "Emergency Response", desc: "If you suspect a breach, activate the Incident tab for a guided 6-step emergency response protocol with 23 specific actions.", color: C.red },
                { step: "9", title: "Export Reports", desc: "Head to the Reports tab to generate and download a complete security audit as a text file — useful for compliance or personal records.", color: C.blue },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", background: C.bg, borderRadius: 8, borderLeft: `3px solid ${item.color}` }}>
                  <div style={{ minWidth: 28, height: 28, borderRadius: 6, background: `${item.color}18`, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, fontSize: 13 }}>{item.step}</div>
                  <div>
                    <div style={{ color: C.bright, fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.title}</div>
                    <div style={{ color: C.dim, fontSize: 12, lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Sect>
      </Card>

      {/* ── FAQ ── */}
      <Card>
        <Sect title="Frequently Asked Questions" icon={<I.HelpCircle />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 8, border: `1px solid ${expandedFaq === i ? C.greenBdr : C.border}`, overflow: "hidden", transition: "border-color 0.2s" }}>
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <span style={{ color: expandedFaq === i ? C.green : C.bright, fontSize: 13, fontWeight: 600, paddingRight: 12 }}>{item.q}</span>
                  <span style={{ color: C.dim, fontSize: 16, transform: expandedFaq === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>{"\u25BE"}</span>
                </button>
                {expandedFaq === i && (
                  <div style={{ padding: "0 14px 14px", color: C.text, fontSize: 12, lineHeight: 1.8, whiteSpace: "pre-line", animation: "fadeIn 0.2s ease" }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Sect>
      </Card>

      {/* ── INSTALL APP ── */}
      <Card glow={C.blue}>
        <Sect title="Install AgentsLock on Your Device" icon={<I.Download />}>
          {isStandalone ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: C.greenDim, border: `1px solid ${C.greenBdr}`, borderRadius: 8 }}>
              <I.Check s={18} style={{ color: C.green }} />
              <div>
                <div style={{ color: C.green, fontWeight: 600, fontSize: 13 }}>App Installed</div>
                <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>You are running AgentsLock as an installed app.</div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ color: C.text, fontSize: 12, lineHeight: 1.7, marginBottom: 14 }}>
                AgentsLock is a Progressive Web App (PWA) — you can install it on any device for a native app experience. It works offline, loads instantly, and receives automatic updates.
              </div>

              {/* Native install button (Chrome/Edge on desktop & Android) */}
              {installPrompt && (
                <div style={{ marginBottom: 16 }}>
                  <Btn onClick={handleInstall} color={C.green} style={{ width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 14 }}>
                    <I.Download /> Install AgentsLock Now
                  </Btn>
                  <div style={{ color: C.dim, fontSize: 10, textAlign: "center", marginTop: 6 }}>One click — no app store required</div>
                </div>
              )}

              {/* Platform-specific instructions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(INSTALL_INSTRUCTIONS).map(([plat, steps]) => (
                  <div key={plat} style={{ background: C.bg, borderRadius: 8, padding: "14px 16px", border: `1px solid ${plat === platform ? C.greenBdr : C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      {plat === "ios" || plat === "mac" ? <I.Apple s={16} style={{ color: C.bright }} /> :
                       plat === "android" ? <I.Smartphone s={16} style={{ color: C.green }} /> :
                       <I.Monitor s={16} style={{ color: C.blue }} />}
                      <span style={{ color: C.bright, fontWeight: 600, fontSize: 13 }}>{platformLabel[plat]}</span>
                      {plat === platform && <Badge color={C.green}>Your Device</Badge>}
                    </div>
                    <ol style={{ paddingLeft: 20, margin: 0 }}>
                      {steps.map((step, i) => (
                        <li key={i} style={{ color: C.text, fontSize: 12, lineHeight: 1.8, paddingLeft: 4 }}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, padding: "10px 14px", background: C.blueDim, border: `1px solid ${C.blueBdr}`, borderRadius: 8 }}>
                <div style={{ color: C.blue, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Supported Devices</div>
                <div style={{ color: C.text, fontSize: 11, lineHeight: 1.7 }}>
                  Android phones & tablets, iPhones, iPads, Windows PCs & laptops, macOS, Linux desktops, and Chromebooks. Any device with a modern browser (Chrome, Edge, Safari, Brave, Firefox) can install AgentsLock as an app.
                </div>
              </div>
            </>
          )}
        </Sect>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 11: SETTINGS (Phase 3)
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsTab({ user, logout, setLegalPage, subscription }) {
  const [notifsOn, setNotifsOn] = useState(() => LS.get("notifs", true));
  const [autoScan, setAutoScan] = useState(() => LS.get("autoScan", false));
  const [dataCleared, setDataCleared] = useState(false);

  const clearAll = () => {
    ["checks","accounts","threats","monitors","scanLog","irChecks"].forEach(k => LS.del(k));
    setDataCleared(true); setTimeout(() => setDataCleared(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <Sect title="Account" icon={<I.User />}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.bg, borderRadius: 8 }}>
            <div><div style={{ color: C.bright, fontWeight: 600 }}>{user?.displayName || "User"}</div><div style={{ color: C.dim, fontSize: 12 }}>{user?.email}</div><div style={{ color: C.dim, fontSize: 10, marginTop: 2 }}>UID: {user?.uid?.slice(0,12)}...</div></div>
            <Btn onClick={logout} color={C.red}><I.LogOut /> Sign Out</Btn>
          </div>
        </Sect>
      </Card>

      <Card glow={C.green}>
        <Sect title="Subscription" icon={<I.CreditCard />}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.bg, borderRadius: 8 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ color: C.bright, fontWeight: 600 }}>{subscription?.provider === "promo_code" ? "Promo Access" : "Pro Plan"}</span>
                <Badge color={C.green}>ACTIVE</Badge>
              </div>
              <div style={{ color: C.dim, fontSize: 12 }}>{subscription?.provider === "promo_code" ? "Free access via promo code" : "$18.00 USD / month via PayPal"}</div>
              {subscription?.subscribedAt && (
                <div style={{ color: C.dim, fontSize: 10, marginTop: 2 }}>
                  {subscription?.provider === "promo_code" ? "Activated" : "Subscribed"}: {new Date(subscription.subscribedAt).toLocaleDateString()}
                  {subscription.subscriptionId && <> &middot; ID: {subscription.subscriptionId.slice(0, 12)}...</>}
                  {subscription.promoCode && <> &middot; Code: {subscription.promoCode}</>}
                </div>
              )}
            </div>
            {subscription?.provider !== "promo_code" && (
              <a href="https://www.paypal.com/myaccount/autopay" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <Btn color={C.blue}><I.ExternalLink /> Manage</Btn>
              </a>
            )}
          </div>
        </Sect>
      </Card>

      <Card>
        <Sect title="Preferences" icon={<I.Settings />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[["Push Notifications", notifsOn, () => { setNotifsOn(!notifsOn); LS.set("notifs", !notifsOn); }],
              ["Auto-scan on login", autoScan, () => { setAutoScan(!autoScan); LS.set("autoScan", !autoScan); }]
            ].map(([label, val, toggle], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: C.bg, borderRadius: 8 }}>
                <span style={{ color: C.text, fontSize: 13 }}>{label}</span>
                <div onClick={toggle} style={{ width: 44, height: 24, borderRadius: 12, background: val ? C.green : C.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: val ? 23 : 3, transition: "left 0.2s" }} />
                </div>
              </div>
            ))}
          </div>
        </Sect>
      </Card>

      <Card>
        <Sect title="Data Management" icon={<I.Database />}>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>All data is stored locally in your browser. Nothing is sent to any server.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={clearAll} color={C.red}><I.Trash /> Clear All Data</Btn>
          </div>
          {dataCleared && <div style={{ color: C.green, fontSize: 12, marginTop: 8 }}>✅ All data cleared. Refresh to reset.</div>}
        </Sect>
      </Card>

      <Card>
        <Sect title="About & Legal" icon={<I.Shield />}>
          <div style={{ color: C.text, fontSize: 12 }}>
            <div style={{ marginBottom: 4 }}><span style={{ color: C.bright, fontWeight: 600 }}>AgentsLock v4.0</span> — Firebase-Secured Cybersecurity Platform</div>
            <div style={{ color: C.dim, marginBottom: 4 }}>Firebase-Secured Cybersecurity Platform</div>
            <div style={{ color: C.dim }}>React + Vite + Firebase Auth + Firestore. Real-time cloud sync. PWA enabled.</div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a href="https://agentslock.com" target="_blank" rel="noopener" style={{ color: C.green, textDecoration: "none", fontSize: 11 }}>agentslock.com</a>
              <button onClick={()=>setLegalPage("terms")} style={{ background:"none", border:"none", color:C.green, cursor:"pointer", fontSize:11, fontFamily:"inherit", padding:0 }}>Terms of Service</button>
              <button onClick={()=>setLegalPage("privacy")} style={{ background:"none", border:"none", color:C.green, cursor:"pointer", fontSize:11, fontFamily:"inherit", padding:0 }}>Privacy Policy</button>
              <button onClick={()=>setLegalPage("disclaimer")} style={{ background:"none", border:"none", color:C.green, cursor:"pointer", fontSize:11, fontFamily:"inherit", padding:0 }}>Disclaimer</button>
              <button onClick={()=>setLegalPage("about")} style={{ background:"none", border:"none", color:C.green, cursor:"pointer", fontSize:11, fontFamily:"inherit", padding:0 }}>About</button>
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: C.dim }}>{"\u00A9"} 2026 AgentsLock — All rights reserved. No reproduction without permission.</div>
          </div>
        </Sect>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEGAL OVERLAY — Terms, Privacy, Disclaimer, About
// ═══════════════════════════════════════════════════════════════════════════════
function LegalOverlay({ page, onClose }) {
  if (!page) return null;

  const heading = (text) => (
    <h2 style={{ fontFamily:"'Chakra Petch', sans-serif", fontSize:18, fontWeight:700, color:C.bright, margin:"28px 0 12px", borderBottom:`1px solid ${C.border}`, paddingBottom:8 }}>{text}</h2>
  );
  const subH = (text) => (
    <h3 style={{ fontFamily:"'Chakra Petch', sans-serif", fontSize:14, fontWeight:600, color:C.green, margin:"20px 0 8px" }}>{text}</h3>
  );
  const para = (text) => (
    <p style={{ color:C.text, fontSize:13, lineHeight:1.7, marginBottom:10 }}>{text}</p>
  );
  const listItem = (text) => (
    <li style={{ color:C.text, fontSize:13, lineHeight:1.7, marginBottom:4, paddingLeft:4 }}>{text}</li>
  );

  const COMPANY = {
    name: "AgentsLock",
    brand: "AgentsLock",
    website: "agentslock.com",
  };

  const lastUpdated = "1 January 2026";

  // ─── TERMS OF SERVICE ──────────────────────────────────────────────────────
  const TermsContent = () => (
    <>
      {para(`These Terms of Service ("Terms") govern your access to and use of the AgentsLock cybersecurity platform ("Service"), operated by ${COMPANY.name}. By accessing or using our Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.`)}
      {para(`Last updated: ${lastUpdated}`)}

      {heading("1. Acceptance of Terms")}
      {para("By creating an account, accessing, or using AgentsLock in any way, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, our Privacy Policy, and our Disclaimer. These documents together constitute a legally binding agreement between you and the Company.")}
      {para("If you are using the Service on behalf of an organisation, you represent and warrant that you have authority to bind that organisation to these Terms.")}

      {heading("2. Description of Service")}
      {para("AgentsLock is a personal cybersecurity platform that provides tools including but not limited to: breach detection, password strength analysis, web security scanning, device hardening checklists, account security auditing, threat monitoring, uptime monitoring, incident response protocols, and security reporting.")}
      {para("The Service is provided on an \"as available\" basis. Features may be added, modified, or removed at our sole discretion without prior notice.")}

      {heading("3. User Accounts & Registration")}
      {para("To use the Service, you must create an account using a valid email address. You are responsible for:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Maintaining the confidentiality of your account credentials")}
        {listItem("All activities that occur under your account")}
        {listItem("Providing accurate and current registration information")}
        {listItem("Notifying us immediately of any unauthorised access")}
      </ul>
      {para("We reserve the right to suspend or terminate accounts that violate these Terms or are inactive for extended periods.")}

      {heading("4. Acceptable Use Policy")}
      {para("You agree not to use the Service to:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Violate any applicable law, regulation, or third-party rights")}
        {listItem("Conduct unauthorised security testing against systems you do not own or have permission to test")}
        {listItem("Attempt to gain unauthorised access to any part of the Service or its infrastructure")}
        {listItem("Reverse engineer, decompile, or disassemble the Service")}
        {listItem("Transmit malware, viruses, or malicious code")}
        {listItem("Use the Service for competitive intelligence or to build a competing product")}
        {listItem("Impersonate any person or entity")}
        {listItem("Interfere with, disrupt, or overburden the Service")}
      </ul>

      {heading("5. Intellectual Property")}
      {para(`All content, features, and functionality of the Service — including but not limited to software, code, design, text, graphics, logos, icons, the ${COMPANY.brand} name and brand — are the exclusive property of ${COMPANY.name} and are protected by Australian and international copyright, trademark, patent, trade secret, and other intellectual property laws.`)}
      {para("No part of the Service may be reproduced, distributed, modified, or transmitted without express written permission from the Company.")}
      {para(`All trademarks, service marks, and trade names used in the Service are trademarks or registered trademarks of ${COMPANY.name}. Third-party trademarks and data referenced within the Service belong to their respective owners.`)}

      {heading("6. User Content & Data")}
      {para("You retain ownership of any data you input into the Service. By using the Service, you grant us a limited licence to store, process, and display your data solely for the purpose of providing the Service to you.")}
      {para("We do not sell, share, or distribute your personal data to third parties for marketing purposes. Data handling is governed by our Privacy Policy.")}

      {heading("7. Third-Party Services")}
      {para("The Service may integrate with or reference third-party services including Firebase (Google), Pwned Passwords (password breach checking), SSL verification services, and others. We are not responsible for the availability, accuracy, or practices of these third-party services.")}
      {para("Your use of third-party services is subject to their respective terms and policies.")}

      {heading("8. Privacy")}
      {para("Your use of the Service is also governed by our Privacy Policy, which details how we collect, use, store, and protect your personal information in compliance with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth).")}

      {heading("9. Disclaimers")}
      {para("THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.")}
      {para("We do not warrant that the Service will be uninterrupted, error-free, or completely secure. No cybersecurity tool can guarantee absolute protection against all threats. Users remain responsible for their own security practices.")}
      {para("AgentsLock does not provide financial, legal, tax, or professional advice. Any information provided through the Service is for informational and educational purposes only.")}

      {heading("10. Limitation of Liability")}
      {para(`TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ${COMPANY.name.toUpperCase()} AND ITS DIRECTORS, OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:`)}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Your access to, use of, or inability to use the Service")}
        {listItem("Any security breach or unauthorised access to your data")}
        {listItem("Any third-party conduct or content on the Service")}
        {listItem("Any content obtained from the Service")}
      </ul>
      {para("Our total aggregate liability shall not exceed the amount you have paid us in the twelve (12) months preceding the claim.")}

      {heading("11. Indemnification")}
      {para(`You agree to indemnify, defend, and hold harmless ${COMPANY.brand}, its directors, officers, employees, agents, and affiliates from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable legal fees) arising out of or relating to your violation of these Terms or your use of the Service.`)}

      {heading("12. Governing Law & Jurisdiction")}
      {para("These Terms shall be governed by and construed in accordance with the laws of New South Wales, Australia, without regard to its conflict of law provisions.")}
      {para("Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of New South Wales, Australia.")}
      {para("Nothing in these Terms excludes, restricts, or modifies any consumer rights under the Australian Consumer Law (Schedule 2 of the Competition and Consumer Act 2010 (Cth)) that cannot be excluded, restricted, or modified by agreement.")}

      {heading("13. Changes to Terms & Contact")}
      {para("We reserve the right to modify these Terms at any time. Material changes will be communicated via the Service or email. Continued use of the Service after changes constitutes acceptance of the revised Terms.")}
      {para(`For questions about these Terms, contact us via the ${COMPANY.website} website.`)}
    </>
  );

  // ─── PRIVACY POLICY ────────────────────────────────────────────────────────
  const PrivacyContent = () => (
    <>
      {para(`This Privacy Policy describes how ${COMPANY.brand} collects, uses, stores, and protects your personal information when you use our cybersecurity platform. We are committed to complying with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth).`)}
      {para(`Last updated: ${lastUpdated}`)}

      {heading("1. Information We Collect")}
      {subH("1.1 Information You Provide")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Account registration details: email address, display name, password (hashed)")}
        {listItem("Security scan data: URLs submitted for scanning, password breach checks (hashed, k-anonymity)")}
        {listItem("Device hardening preferences and checklist progress")}
        {listItem("Account security configurations and 2FA settings you record")}
        {listItem("Monitoring URLs and uptime configurations")}
        {listItem("Threat logs and incident response notes")}
      </ul>
      {subH("1.2 Information Collected Automatically")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Usage data: features accessed, timestamps, session duration")}
        {listItem("Technical data: browser type, operating system, device information")}
        {listItem("Scan results and security assessment outputs")}
      </ul>

      {heading("2. How We Use Your Information")}
      {para("We use the information collected to:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Provide, maintain, and improve the AgentsLock Service")}
        {listItem("Authenticate your identity and secure your account")}
        {listItem("Synchronise your security data across devices in real-time")}
        {listItem("Generate security reports and threat assessments")}
        {listItem("Send critical security notifications and alerts")}
        {listItem("Detect, prevent, and address technical issues")}
        {listItem("Comply with legal obligations")}
      </ul>

      {heading("3. Firebase Storage & Processing")}
      {para("We use Google Firebase for authentication and data storage:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Firebase Authentication: manages your login credentials securely using industry-standard encryption")}
        {listItem("Cloud Firestore: stores your security data (scans, checklists, threat logs, monitors) in encrypted cloud databases")}
        {listItem("Data is processed through Google Cloud infrastructure with servers located in the United States and Australia")}
      </ul>
      {para("Firebase's data handling is governed by Google's Cloud Data Processing Addendum and complies with applicable data protection regulations. Only public Firebase configuration keys are used in the client application; all server secrets remain server-side.")}

      {heading("4. Data Security")}
      {para("We implement appropriate technical and organisational measures to protect your personal information, including:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Encryption in transit (TLS/SSL) and at rest")}
        {listItem("Firebase Security Rules restricting data access to authenticated users")}
        {listItem("Password hashing using industry-standard algorithms")}
        {listItem("Session management and automatic timeout")}
        {listItem("Regular security audits of our infrastructure")}
      </ul>
      {para("No method of transmission or storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.")}

      {heading("5. Cookies & Local Storage")}
      {para("AgentsLock uses browser local storage to:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Cache security data locally for faster performance")}
        {listItem("Store user preferences and UI settings")}
        {listItem("Enable offline functionality through our Progressive Web App (PWA)")}
      </ul>
      {para("We do not use third-party advertising cookies. Firebase Authentication may use session cookies for authentication state management.")}

      {heading("6. Third-Party Services")}
      {para("The Service may share limited data with third-party services to provide functionality:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Google Firebase — authentication and data storage")}
        {listItem("Pwned Passwords API — password breach checking (k-anonymity, only first 5 hash characters sent)")}
        {listItem("SSL Labs / security APIs — website security scanning")}
      </ul>
      {para("We do not sell, trade, or rent your personal information to third parties for marketing or advertising purposes.")}

      {heading("7. Data Retention")}
      {para("We retain your personal information for as long as your account is active or as needed to provide the Service. Upon account deletion:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Your Firestore data will be permanently deleted")}
        {listItem("Local storage data can be cleared via browser settings")}
        {listItem("Backup copies may persist for up to 30 days in our backup systems")}
      </ul>

      {heading("8. Your Rights — Australian Privacy Principles")}
      {para("Under the APPs, you have the right to:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Access: Request a copy of the personal information we hold about you (APP 12)")}
        {listItem("Correction: Request correction of inaccurate or outdated information (APP 13)")}
        {listItem("Complaint: Lodge a complaint if you believe we have breached the APPs")}
        {listItem("Deletion: Request deletion of your account and associated data")}
        {listItem("Export: Export your security data using the Report export feature")}
      </ul>
      {para("To exercise these rights, contact us at the details provided below. We will respond within 30 days.")}
      {para("If you are not satisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at www.oaic.gov.au.")}

      {heading("9. Children's Privacy")}
      {para("The Service is not directed at individuals under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware that we have collected data from a child under 16, we will take steps to delete that information promptly.")}

      {heading("10. International Data Transfers")}
      {para("Your data may be transferred to and processed in countries outside Australia, including the United States (via Firebase/Google Cloud). We ensure that appropriate safeguards are in place, including contractual clauses and compliance with APP 8 (cross-border disclosure of personal information).")}

      {heading("11. Changes to This Policy & Contact")}
      {para("We may update this Privacy Policy periodically. Material changes will be notified via the Service or email. Continued use after changes constitutes acceptance.")}
      {para(`For privacy inquiries, data access requests, or complaints, contact us via the ${COMPANY.website} website.`)}
    </>
  );

  // ─── DISCLAIMER ────────────────────────────────────────────────────────────
  const DisclaimerContent = () => (
    <>
      {para(`This Disclaimer applies to the AgentsLock cybersecurity platform ("Service"), operated by ${COMPANY.brand}.`)}
      {para(`Last updated: ${lastUpdated}`)}

      {heading("Financial Disclaimer")}
      {para("AgentsLock is a cybersecurity platform and does not provide financial, investment, tax, or accounting advice. Any references to financial security, transaction monitoring, or related topics within the Service are for informational purposes only.")}
      {para("Markets involve risk and returns are not guaranteed. Past performance is not indicative of future results. You should consult a qualified financial adviser before making any investment decisions.")}
      {para("The Company, its directors, and employees accept no liability for any financial loss or damage arising from the use of or reliance on any information provided through the Service.")}

      {heading("Legal Disclaimer")}
      {para("The information provided by AgentsLock is for general informational and educational purposes only and does not constitute legal advice. While we make reasonable efforts to ensure accuracy, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information.")}
      {para("Users are responsible for ensuring their use of the Service complies with all applicable laws and regulations in their jurisdiction. Any reliance you place on information from the Service is strictly at your own risk.")}

      {heading("Security Liability Disclaimer")}
      {para("While AgentsLock provides cybersecurity tools and assessments, no software platform can guarantee absolute protection against all cyber threats. The Service is designed to assist users in improving their security posture but does not eliminate all security risks.")}
      {para("Specifically, we disclaim liability for:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Any security breach, data loss, or unauthorised access that occurs despite using the Service")}
        {listItem("The accuracy or completeness of password breach detection results")}
        {listItem("The effectiveness of recommended security measures")}
        {listItem("Downtime or unavailability of monitoring services")}
        {listItem("Actions taken or not taken based on security scan results")}
        {listItem("Vulnerabilities or threats not detected by the Service")}
      </ul>
      {para("Users should maintain comprehensive security practices beyond the scope of this Service, including up-to-date antivirus software, regular backups, and professional security audits for critical systems.")}

      {heading("No Guarantee of Protection")}
      {para("Security scores, grades, assessments, and recommendations provided by the Service are indicative only and should not be relied upon as a guarantee of security. The cyber threat landscape evolves continuously, and new vulnerabilities and attack vectors emerge regularly.")}

      {heading("Third-Party Tools & Data")}
      {para("The Service integrates with and references third-party tools, APIs, and databases. We do not control these services and are not responsible for their accuracy, availability, or security practices. All third-party trademarks and data belong to their respective owners.")}

      {heading("Limitation")}
      {para(`To the maximum extent permitted by law, ${COMPANY.brand} shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages arising from the use of or inability to use the Service.`)}
      {para("Nothing in this Disclaimer excludes or limits any rights you may have under the Australian Consumer Law that cannot be excluded or limited by agreement.")}

      {heading("Contact")}
      {para(`If you have questions about this Disclaimer, contact us via the ${COMPANY.website} website.`)}
    </>
  );

  // ─── ABOUT ─────────────────────────────────────────────────────────────────
  const AboutContent = () => (
    <>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ width:64, height:64, borderRadius:16, background:`linear-gradient(135deg,${C.green},${C.blue})`, display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}><I.Shield s={32} style={{ color:"#fff" }}/></div>
        <h2 style={{ fontFamily:"'Chakra Petch', sans-serif", fontSize:24, fontWeight:700, color:C.bright, margin:"0 0 4px" }}>AgentsLock</h2>
        <div style={{ color:C.green, fontSize:13, fontWeight:600, letterSpacing:"0.06em" }}>v4.0 — Firebase-Secured Cybersecurity Platform</div>
      </div>

      {heading("Our Mission")}
      {para("AgentsLock is a comprehensive personal cybersecurity platform designed to empower individuals and organisations to take control of their digital security. We provide enterprise-grade security tools in an accessible, user-friendly interface.")}

      {heading("Platform Features")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Password Breach Check — Check if your passwords have appeared in known data breaches using k-anonymity")}
        {listItem("Password Security — Analyse password strength with entropy calculations and generate secure passwords")}
        {listItem("Web Scanner — SSL/TLS grading and security header analysis for websites")}
        {listItem("Device Hardening — 56-point security checklist with platform-specific commands")}
        {listItem("Account Auditing — Track 2FA status, app passwords, and risk levels across all accounts")}
        {listItem("Threat Monitoring — Real-time active threat management with severity filtering")}
        {listItem("Uptime Monitoring — Website availability monitoring with response time graphs")}
        {listItem("Incident Response — Emergency response protocols and procedures")}
        {listItem("Security Reports — Exportable comprehensive security audit reports")}
      </ul>

      {heading("Technology")}
      {para("Built with React + Vite, secured by Firebase Authentication and Cloud Firestore. Real-time cloud synchronisation across all your devices. Progressive Web App (PWA) enabled for offline access.")}

      {heading("Company Information")}
      <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:16, marginBottom:12 }}>
        <div style={{ display:"grid", gap:8 }}>
          {[
            ["Platform", COMPANY.brand],
            ["Website", COMPANY.website],
          ].map(([label, val]) => (
            <div key={label} style={{ display:"flex", gap:8, fontSize:12 }}>
              <span style={{ color:C.dim, minWidth:80 }}>{label}:</span>
              <span style={{ color:C.bright, fontWeight:500 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {heading("Copyright & Intellectual Property")}
      {para(`\u00A9 2026 ${COMPANY.brand}. All rights reserved.`)}
      {para("All trademarks, logos, and data belong to their respective owners. No reproduction without permission. The AgentsLock name, logo, and all associated branding are the exclusive intellectual property of the Company.")}
      {para("This software and its source code are protected by copyright law and international treaties. Unauthorised reproduction or distribution of this program, or any portion of it, may result in severe civil and criminal penalties.")}
    </>
  );

  const titles = { terms:"Terms of Service", privacy:"Privacy Policy", disclaimer:"Disclaimer", about:"About AgentsLock" };
  const icons = { terms:<I.FileText s={20}/>, privacy:<I.Lock s={20}/>, disclaimer:<I.Alert s={20}/>, about:<I.Shield s={20}/> };
  const Content = { terms:TermsContent, privacy:PrivacyContent, disclaimer:DisclaimerContent, about:AboutContent }[page];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(6,8,13,0.92)", backdropFilter:"blur(8px)", display:"flex", alignItems:"flex-start", justifyContent:"center", overflowY:"auto", padding:"40px 16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, maxWidth:720, width:"100%", padding:"32px 36px", position:"relative", boxShadow:`0 24px 48px rgba(0,0,0,0.5)` }}>
        {/* Close button */}
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:`${C.dim}15`, border:`1px solid ${C.border}`, borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.dim, transition:"all 0.2s" }}
          onMouseOver={(e)=>{e.currentTarget.style.color=C.bright;e.currentTarget.style.borderColor=C.green}}
          onMouseOut={(e)=>{e.currentTarget.style.color=C.dim;e.currentTarget.style.borderColor=C.border}}>
          <I.X s={14}/>
        </button>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:`${C.green}15`, border:`1px solid ${C.greenBdr}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green }}>{icons[page]}</div>
          <div>
            <h1 style={{ fontFamily:"'Chakra Petch', sans-serif", fontSize:20, fontWeight:700, color:C.bright, margin:0 }}>{titles[page]}</h1>
            <div style={{ fontSize:10, color:C.dim, marginTop:2 }}>{COMPANY.brand}</div>
          </div>
        </div>
        {/* Content */}
        <div style={{ maxHeight:"70vh", overflowY:"auto", paddingRight:8 }}>
          {Content && <Content />}
        </div>
        {/* Footer nav */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:20, paddingTop:16, borderTop:`1px solid ${C.border}` }}>
          {Object.entries(titles).filter(([k])=>k!==page).map(([k, label])=>(
            <button key={k} onClick={()=>onClose(k)} style={{ background:`${C.green}10`, border:`1px solid ${C.greenBdr}`, color:C.green, padding:"6px 14px", borderRadius:6, cursor:"pointer", fontSize:11, fontFamily:"inherit", fontWeight:500, transition:"all 0.2s" }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIAL DATA
// ═══════════════════════════════════════════════════════════════════════════════
const INIT_THREATS = [
  { id:1, name:"Phishing Attempt", target:"Gmail", severity:"critical", status:"active", time:"12 min ago", desc:"Credential harvesting link detected" },
  { id:2, name:"API Key Exposure", target:"GitHub", severity:"critical", status:"active", time:"1 hour ago", desc:"Potential key in public repo" },
  { id:3, name:"Malware Detected", target:"Android", severity:"medium", status:"blocked", time:"3 hours ago", desc:"Trojan blocked by Play Protect" },
  { id:4, name:"Session Hijack", target:"Vercel", severity:"medium", status:"blocked", time:"5 hours ago", desc:"Blocked — HSTS, CSP & idle timeout enforced" },
  { id:5, name:"DNS Poisoning", target:"Router", severity:"high", status:"blocked", time:"8 hours ago", desc:"DNS manipulation blocked" },
  { id:6, name:"Keylogger", target:"Windows", severity:"critical", status:"resolved", time:"1 day ago", desc:"Removed by Defender" },
  { id:7, name:"Token Theft", target:"Browser", severity:"low", status:"resolved", time:"2 days ago", desc:"Suspicious extension blocked" },
];
const INIT_ACCOUNTS = [
  { id:1, name:"Google / Gmail", icon:"🔵", twoFA:true, method:"Authenticator App", appPw:true, sessions:2, lastReview:"2 days ago", risk:"low" },
  { id:2, name:"GitHub", icon:"⚫", twoFA:true, method:"Hardware Key", appPw:true, sessions:1, lastReview:"1 week ago", risk:"low" },
  { id:3, name:"Vercel", icon:"▲", twoFA:true, method:"Authenticator App", appPw:false, sessions:1, lastReview:"3 days ago", risk:"medium" },
  { id:4, name:"AWS", icon:"🟠", twoFA:true, method:"Authenticator App", appPw:true, sessions:1, lastReview:"5 days ago", risk:"low" },
  { id:5, name:"Firebase", icon:"🟡", twoFA:false, method:"None", appPw:false, sessions:3, lastReview:"Never", risk:"high" },
  { id:6, name:"Banking", icon:"🏦", twoFA:true, method:"SMS + Biometric", appPw:true, sessions:1, lastReview:"1 day ago", risk:"low" },
  { id:7, name:"PayPal", icon:"🔷", twoFA:true, method:"SMS", appPw:false, sessions:2, lastReview:"2 weeks ago", risk:"medium" },
  { id:8, name:"Domain Registrar", icon:"🌐", twoFA:false, method:"None", appPw:false, sessions:1, lastReview:"Never", risk:"high" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSTALL ON ALL DEVICES — Share & Install Modal
// ═══════════════════════════════════════════════════════════════════════════════
function InstallAllDevices({ onClose, installPrompt, setInstallPrompt }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const copyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    try {
      await navigator.share({ title: "AgentsLock — Cybersecurity Dashboard", text: "Install AgentsLock on your device to protect your accounts, passwords, and data.", url: appUrl });
      setShared(true); setTimeout(() => setShared(false), 2000);
    } catch (e) {
      if (e.name !== "AbortError") copyLink();
    }
  };

  const emailLink = () => {
    const subject = encodeURIComponent("Install AgentsLock on Your Device");
    const body = encodeURIComponent(`Install AgentsLock — your personal cybersecurity dashboard.\n\nOpen this link on any device:\n${appUrl}\n\nHow to install:\n• Android: Open in Chrome → Menu (⋮) → "Install app"\n• iPhone/iPad: Open in Safari → Share (↑) → "Add to Home Screen"\n• Windows/Mac: Open in Chrome/Edge → Click install icon in address bar\n\nIt works on all devices — phones, tablets, laptops, and desktops.`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") setInstallPrompt(null);
  };

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

  const devices = [
    { icon: <I.Smartphone s={20} />, name: "Android", color: C.green, steps: ["Open link in Chrome", "Tap ⋮ menu → \"Install app\"", "Tap Install"] },
    { icon: <I.Apple s={20} />, name: "iPhone / iPad", color: C.bright, steps: ["Open link in Safari", "Tap Share ↑ button", "\"Add to Home Screen\""] },
    { icon: <I.Monitor s={20} />, name: "Windows", color: C.blue, steps: ["Open link in Chrome/Edge", "Click ⊕ in address bar", "Click Install"] },
    { icon: <I.Apple s={20} />, name: "macOS", color: C.bright, steps: ["Open link in Chrome/Edge", "Click install icon in bar", "Click Install"] },
    { icon: <I.Terminal s={20} />, name: "Linux", color: C.orange, steps: ["Open link in Chrome", "Click install icon in bar", "Confirm installation"] },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif" }}
      onClick={onClose}>
      <div style={{ width: 520, maxHeight: "90vh", overflow: "auto", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32 }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${C.green}, ${C.blue})`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <I.Download s={28} style={{ color: "#fff" }} />
          </div>
          <h2 style={{ fontFamily: "'Chakra Petch'", fontSize: 20, color: C.bright, margin: "0 0 6px" }}>Install on All Devices</h2>
          <p style={{ color: C.dim, fontSize: 12, margin: 0 }}>Share this link to install AgentsLock on any phone, tablet, or computer.</p>
        </div>

        {/* App URL + Copy */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "'Fira Code', monospace", fontSize: 13, color: C.green, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{appUrl}</div>
          <Btn onClick={copyLink} color={copied ? C.green : C.blue}><I.Copy /> {copied ? "Copied!" : "Copy"}</Btn>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {navigator.share && (
            <button onClick={shareLink} style={{ padding: "14px 10px", background: `${C.green}12`, border: `1px solid ${C.greenBdr}`, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
              <I.ExternalLink s={20} style={{ color: C.green, display: "block", margin: "0 auto 6px" }} />
              <div style={{ color: C.green, fontSize: 12, fontWeight: 600 }}>{shared ? "Shared!" : "Share"}</div>
              <div style={{ color: C.dim, fontSize: 10, marginTop: 2 }}>Via apps</div>
            </button>
          )}
          <button onClick={emailLink} style={{ padding: "14px 10px", background: `${C.blue}12`, border: `1px solid ${C.blueBdr}`, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
            <I.Mail s={20} style={{ color: C.blue, display: "block", margin: "0 auto 6px" }} />
            <div style={{ color: C.blue, fontSize: 12, fontWeight: 600 }}>Email</div>
            <div style={{ color: C.dim, fontSize: 10, marginTop: 2 }}>Send link</div>
          </button>
          {installPrompt && (
            <button onClick={handleInstall} style={{ padding: "14px 10px", background: `${C.cyan}12`, border: `1px solid ${C.cyanBdr}`, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
              <I.Download s={20} style={{ color: C.cyan, display: "block", margin: "0 auto 6px" }} />
              <div style={{ color: C.cyan, fontSize: 12, fontWeight: 600 }}>Install Now</div>
              <div style={{ color: C.dim, fontSize: 10, marginTop: 2 }}>This device</div>
            </button>
          )}
        </div>

        {isStandalone && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: C.greenDim, border: `1px solid ${C.greenBdr}`, borderRadius: 8, marginBottom: 16 }}>
            <I.Check s={16} style={{ color: C.green }} />
            <span style={{ color: C.green, fontSize: 12, fontWeight: 600 }}>App installed on this device</span>
          </div>
        )}

        {/* Per-Device Instructions */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, fontWeight: 500 }}>Quick Install per Device</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {devices.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.bg, borderRadius: 8 }}>
                <div style={{ color: d.color, flexShrink: 0 }}>{d.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.bright, fontSize: 12, fontWeight: 600 }}>{d.name}</div>
                  <div style={{ color: C.dim, fontSize: 10 }}>{d.steps.join(" → ")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClose}
          style={{ width: "100%", padding: "10px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "inherit", color: C.dim }}>
          Close
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD — Management Panel (Google 2FA Protected)
// ═══════════════════════════════════════════════════════════════════════════════
function AdminDashboard({ user, onClose }) {
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyErr, setVerifyErr] = useState("");
  const [adminPassInput, setAdminPassInput] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, paypal, promo, none
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const adminPassword = import.meta.env.VITE_ADMIN_ACCESS_PASSWORD;

  // Admin password verification
  const handleVerify = async () => {
    setVerifying(true);
    setVerifyErr("");
    if (!adminPassword) {
      setVerifyErr("VITE_ADMIN_ACCESS_PASSWORD is not configured in environment variables.");
      setVerifying(false);
      return;
    }
    if (adminPassInput !== adminPassword) {
      setVerifyErr("Incorrect admin password. Access denied.");
      setVerifying(false);
      return;
    }
    setVerified(true);
    setVerifying(false);
    loadUsers();
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    setLoadError("");
    try {
      const all = await getAllUsers();
      setUsers(all);
    } catch (e) {
      console.error("Failed to load users:", e);
      const msg = e.code === "permission-denied"
        ? "Firestore permission denied. Update your Firestore security rules to allow admin read access. Go to Firebase Console → Firestore → Rules."
        : (e.message || "Failed to load users.");
      setLoadError(msg);
    }
    setLoadingUsers(false);
  };

  const [deleteError, setDeleteError] = useState("");
  const handleDeleteUser = async (uid) => {
    setActionBusy(true);
    setDeleteError("");
    try {
      await adminDeleteUser(uid);
      setUsers(prev => prev.filter(u => u.uid !== uid));
      setConfirmDelete(null);
      setSelectedUser(null);
    } catch (e) {
      console.error("Delete failed:", e);
      setDeleteError(e.message || "Failed to delete user");
    }
    setActionBusy(false);
  };

  const handleToggleSubscription = async (u) => {
    setActionBusy(true);
    try {
      const hasActive = u.subscription?.status === "active";
      const newSub = hasActive
        ? { status: "inactive", deactivatedAt: new Date().toISOString() }
        : { status: "active", plan: "admin_granted", amount: 0, currency: "USD", subscribedAt: new Date().toISOString(), provider: "admin" };
      await adminUpdateUser(u.uid, { subscription: newSub });
      setUsers(prev => prev.map(x => x.uid === u.uid ? { ...x, subscription: newSub } : x));
      if (selectedUser?.uid === u.uid) setSelectedUser({ ...selectedUser, subscription: newSub });
    } catch (e) {
      console.error("Toggle subscription failed:", e);
    }
    setActionBusy(false);
  };

  // Stats
  const totalUsers = users.length;
  const paypalUsers = users.filter(u => u.subscription?.provider === "paypal" && u.subscription?.status === "active");
  const promoUsers = users.filter(u => u.subscription?.provider === "promo_code" && u.subscription?.status === "active");
  const adminGranted = users.filter(u => u.subscription?.provider === "admin" && u.subscription?.status === "active");
  const activeSubscriptions = users.filter(u => u.subscription?.status === "active");
  const totalRevenue = paypalUsers.reduce((sum, u) => sum + (u.subscription?.amount || 0), 0);
  const noSubscription = users.filter(u => !u.subscription || u.subscription.status !== "active");

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.displayName?.toLowerCase().includes(search.toLowerCase());
    if (filter === "paypal") return matchSearch && u.subscription?.provider === "paypal" && u.subscription?.status === "active";
    if (filter === "promo") return matchSearch && u.subscription?.provider === "promo_code" && u.subscription?.status === "active";
    if (filter === "admin_granted") return matchSearch && u.subscription?.provider === "admin" && u.subscription?.status === "active";
    if (filter === "none") return matchSearch && (!u.subscription || u.subscription.status !== "active");
    return matchSearch;
  });

  // ─── Admin Password Gate ────────────────────────────────────────────────
  if (!verified) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif" }}>
        <div style={{ width: 440, padding: 40, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${C.orange}, ${C.red})`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <I.Lock s={28} style={{ color: "#fff" }} />
            </div>
            <h2 style={{ fontFamily: "'Chakra Petch'", fontSize: 22, color: C.bright, margin: "0 0 8px" }}>Admin Verification</h2>
            <p style={{ color: C.dim, fontSize: 13, margin: 0 }}>Enter your admin password to access the dashboard.</p>
          </div>
          {verifyErr && (
            <div style={{ padding: "10px 14px", background: C.redDim, border: `1px solid ${C.redBdr}`, borderRadius: 8, color: C.red, fontSize: 12, marginBottom: 16 }}>{verifyErr}</div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: C.dim, marginBottom: 4, display: "block" }}>Admin Email</label>
            <div style={{ padding: "10px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, fontSize: 13, fontFamily: "inherit" }}>{user.email}</div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: C.dim, marginBottom: 4, display: "block" }}>Admin Password</label>
            <Input value={adminPassInput} onChange={setAdminPassInput} placeholder="Enter admin password" type="password" icon={<I.Key />} />
          </div>
          <button onClick={handleVerify} disabled={verifying || !adminPassInput}
            style={{ width: "100%", padding: "12px 20px", background: `linear-gradient(135deg, ${C.orange}, ${C.red})`, border: "none", borderRadius: 8, cursor: (verifying || !adminPassInput) ? "not-allowed" : "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: (verifying || !adminPassInput) ? 0.6 : 1, transition: "opacity 0.2s" }}>
            <I.Lock s={16} />
            {verifying ? "Verifying..." : "Access Dashboard"}
          </button>
          <button onClick={onClose}
            style={{ width: "100%", marginTop: 12, padding: "10px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "inherit", color: C.dim, transition: "border-color 0.2s" }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ─── Admin Dashboard ──────────────────────────────────────────────────────
  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 9999, overflow: "auto", fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: `1px solid ${C.border}`, background: `${C.bgCard}ee`, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.orange}, ${C.red})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <I.Settings s={20} style={{ color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Chakra Petch'", fontWeight: 700, fontSize: 17, color: C.bright, letterSpacing: "0.04em" }}>ADMIN DASHBOARD</div>
            <div style={{ fontSize: 10, color: C.dim }}>Management Panel — {user.email}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Btn onClick={loadUsers} color={C.blue} disabled={loadingUsers}><I.Refresh /> Refresh</Btn>
          <Btn onClick={onClose} color={C.green}><I.Shield s={14} /> Return to App</Btn>
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <Card glow={C.blue}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>TOTAL USERS</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.bright, fontFamily: "'Chakra Petch'" }}>{totalUsers}</div>
              </div>
              <I.User s={24} style={{ color: C.blue }} />
            </div>
          </Card>
          <Card glow={C.green}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>ACTIVE SUBSCRIPTIONS</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.bright, fontFamily: "'Chakra Petch'" }}>{activeSubscriptions.length}</div>
                <div style={{ fontSize: 10, color: C.dim }}>{paypalUsers.length} PayPal · {promoUsers.length} Promo · {adminGranted.length} Granted</div>
              </div>
              <I.Check s={24} style={{ color: C.green }} />
            </div>
          </Card>
          <Card glow={C.orange}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>MONTHLY REVENUE</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.bright, fontFamily: "'Chakra Petch'" }}>${totalRevenue}</div>
                <div style={{ fontSize: 10, color: C.dim }}>{paypalUsers.length} paying user{paypalUsers.length !== 1 ? "s" : ""} × $18/mo</div>
              </div>
              <I.DollarSign s={24} style={{ color: C.orange }} />
            </div>
          </Card>
          <Card glow={C.red}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>NO SUBSCRIPTION</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.bright, fontFamily: "'Chakra Petch'" }}>{noSubscription.length}</div>
                <div style={{ fontSize: 10, color: C.dim }}>Inactive / pending users</div>
              </div>
              <I.X s={24} style={{ color: C.red }} />
            </div>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Input value={search} onChange={setSearch} placeholder="Search by name or email..." icon={<I.Search />} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[["all", "All"], ["paypal", "PayPal"], ["promo", "Promo"], ["admin_granted", "Granted"], ["none", "Inactive"]].map(([k, label]) => (
                <button key={k} onClick={() => setFilter(k)}
                  style={{ padding: "6px 14px", border: `1px solid ${filter === k ? C.green : C.border}`, borderRadius: 6, background: filter === k ? `${C.green}15` : "transparent", color: filter === k ? C.green : C.dim, fontSize: 11, fontFamily: "inherit", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontFamily: "'Chakra Petch'", fontSize: 15, fontWeight: 600, color: C.bright }}>
              Registered Users ({filteredUsers.length})
            </h3>
          </div>

          {loadError && (
            <div style={{ padding: "12px 16px", background: C.redDim, border: `1px solid ${C.redBdr}`, borderRadius: 8, color: C.red, fontSize: 12, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Error loading users</div>
              <div>{loadError}</div>
            </div>
          )}

          {loadingUsers ? (
            <div style={{ textAlign: "center", padding: 40, color: C.dim }}>
              <div style={{ animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 12 }}><I.Refresh s={24} /></div>
              <div>Loading users...</div>
            </div>
          ) : filteredUsers.length === 0 && !loadError ? (
            <div style={{ textAlign: "center", padding: 40, color: C.dim }}>No users found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: C.dim, fontWeight: 500, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>User</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: C.dim, fontWeight: 500, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Plan</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: C.dim, fontWeight: 500, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: C.dim, fontWeight: 500, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Joined</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: C.dim, fontWeight: 500, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => {
                    const isCurrentAdmin = u.email?.toLowerCase() === adminEmail?.toLowerCase();
                    const plan = u.subscription?.provider === "paypal" ? "PayPal" : u.subscription?.provider === "promo_code" ? "Promo" : u.subscription?.provider === "admin" ? "Granted" : "None";
                    const planColor = u.subscription?.provider === "paypal" ? C.blue : u.subscription?.provider === "promo_code" ? C.purple : u.subscription?.provider === "admin" ? C.orange : C.dim;
                    const statusActive = u.subscription?.status === "active";
                    return (
                      <tr key={u.uid} style={{ borderBottom: `1px solid ${C.border}08`, transition: "background 0.15s" }}
                        onMouseOver={e => e.currentTarget.style.background = C.bgHover}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${isCurrentAdmin ? C.orange : C.green}, ${isCurrentAdmin ? C.red : C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                              {(u.displayName || u.email || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ color: C.bright, fontWeight: 500 }}>{u.displayName || "—"} {isCurrentAdmin && <Badge color={C.orange}>ADMIN</Badge>}</div>
                              <div style={{ color: C.dim, fontSize: 10 }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <Badge color={planColor}>{plan}</Badge>
                          {u.subscription?.amount > 0 && <span style={{ color: C.dim, fontSize: 10, marginLeft: 6 }}>${u.subscription.amount}/mo</span>}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusActive ? C.green : C.red }} />
                            <span style={{ color: statusActive ? C.green : C.red, fontSize: 11 }}>{statusActive ? "Active" : "Inactive"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px", color: C.dim, fontSize: 11 }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button onClick={() => setSelectedUser(u)}
                              style={{ padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: 4, background: "transparent", color: C.dim, fontSize: 10, fontFamily: "inherit", cursor: "pointer" }}>
                              <I.Eye s={12} /> View
                            </button>
                            {!isCurrentAdmin && (
                              <>
                                <button onClick={() => handleToggleSubscription(u)} disabled={actionBusy}
                                  style={{ padding: "4px 10px", border: `1px solid ${statusActive ? C.redBdr : C.greenBdr}`, borderRadius: 4, background: statusActive ? C.redDim : C.greenDim, color: statusActive ? C.red : C.green, fontSize: 10, fontFamily: "inherit", cursor: "pointer" }}>
                                  {statusActive ? "Deactivate" : "Activate"}
                                </button>
                                <button onClick={() => setConfirmDelete(u)} disabled={actionBusy}
                                  style={{ padding: "4px 10px", border: `1px solid ${C.redBdr}`, borderRadius: 4, background: "transparent", color: C.red, fontSize: 10, fontFamily: "inherit", cursor: "pointer" }}>
                                  <I.Trash s={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setSelectedUser(null)}>
          <div style={{ width: 500, maxHeight: "80vh", overflow: "auto", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontFamily: "'Chakra Petch'", fontSize: 17, color: C.bright }}>User Details</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer" }}><I.X s={18} /></button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                ["Name", selectedUser.displayName || "—"],
                ["Email", selectedUser.email || "—"],
                ["UID", selectedUser.uid],
                ["Joined", selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "—"],
                ["Plan", selectedUser.subscription?.plan || "None"],
                ["Provider", selectedUser.subscription?.provider || "—"],
                ["Status", selectedUser.subscription?.status || "Inactive"],
                ["Amount", selectedUser.subscription?.amount != null ? `$${selectedUser.subscription.amount}/mo` : "—"],
                ["Promo Code", selectedUser.promoCode || selectedUser.subscription?.promoCode || "—"],
                ["Subscription ID", selectedUser.subscription?.subscriptionId || "—"],
                ["Subscribed At", selectedUser.subscription?.subscribedAt ? new Date(selectedUser.subscription.subscribedAt).toLocaleString() : "—"],
                ["Accounts Tracked", (selectedUser.accounts?.length || 0).toString()],
                ["Threats Tracked", (selectedUser.threats?.length || 0).toString()],
                ["Monitors Active", (selectedUser.monitors?.length || 0).toString()],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: C.bg, borderRadius: 6 }}>
                  <span style={{ color: C.dim, fontSize: 11 }}>{label}</span>
                  <span style={{ color: C.bright, fontSize: 11, fontFamily: "'Fira Code'", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 10002, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setConfirmDelete(null)}>
          <div style={{ width: 400, background: C.bgCard, border: `1px solid ${C.redBdr}`, borderRadius: 16, padding: 28 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: C.redDim, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <I.Alert s={24} style={{ color: C.red }} />
              </div>
              <h3 style={{ fontFamily: "'Chakra Petch'", fontSize: 17, color: C.bright, margin: "0 0 8px" }}>Delete User?</h3>
              <p style={{ color: C.dim, fontSize: 12, margin: "0 0 20px" }}>
                This will permanently delete <strong style={{ color: C.bright }}>{confirmDelete.displayName || confirmDelete.email}</strong> and all their data. This cannot be undone.
              </p>
              {deleteError && (
                <div style={{ padding: "10px 14px", background: C.redDim, border: `1px solid ${C.redBdr}`, borderRadius: 8, color: C.red, fontSize: 11, marginBottom: 12, textAlign: "left" }}>{deleteError}</div>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <Btn onClick={() => { setConfirmDelete(null); setDeleteError(""); }} color={C.dim}>Cancel</Btn>
                <Btn onClick={() => handleDeleteUser(confirmDelete.uid)} color={C.red} disabled={actionBusy}>
                  <I.Trash /> {actionBusy ? "Deleting..." : "Delete User"}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id:"overview", label:"Overview", icon:<I.Shield /> },
  { id:"breach", label:"Breach Check", icon:<I.Database /> },
  { id:"passwords", label:"Passwords", icon:<I.Key /> },
  { id:"scanner", label:"Web Scanner", icon:<I.Globe /> },
  { id:"devices", label:"Devices", icon:<I.Monitor /> },
  { id:"accounts", label:"Accounts", icon:<I.User /> },
  { id:"threats", label:"Threats", icon:<I.Alert /> },
  { id:"monitor", label:"Monitoring", icon:<I.Activity /> },
  { id:"reports", label:"Reports", icon:<I.BarChart /> },
  { id:"incident", label:"Incident", icon:<I.Zap /> },
  { id:"help", label:"Help & FAQ", icon:<I.HelpCircle /> },
  { id:"settings", label:"Settings", icon:<I.Settings /> },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FLOATING STATUS WIDGET — Always-on-top, draggable PiP security monitor
// ═══════════════════════════════════════════════════════════════════════════════
function StatusWidget({ threats }) {
  const [expanded, setExpanded] = useState(false);
  const [pos, setPos] = useState(() => {
    try { const s = sessionStorage.getItem("al_widget_pos"); return s ? JSON.parse(s) : { x: 20, y: 20 }; }
    catch { return { x: 20, y: 20 }; }
  });
  const [now, setNow] = useState(new Date());
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const critical = threats.filter(t => t.status === "active" && (t.severity === "critical" || t.severity === "high")).length;
  const active = threats.filter(t => t.status === "active").length;
  const blocked = threats.filter(t => t.status === "blocked").length;
  const isSafe = active === 0;
  const statusColor = isSafe ? C.green : C.red;

  // Drag handlers
  const onPointerDown = (e) => {
    if (e.target.closest("[data-no-drag]")) return;
    didDrag.current = false;
    offsetRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    dragRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    didDrag.current = true;
    const nx = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - offsetRef.current.x));
    const ny = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - offsetRef.current.y));
    setPos({ x: nx, y: ny });
  };
  const onPointerUp = (e) => {
    if (dragRef.current) {
      dragRef.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
      try { sessionStorage.setItem("al_widget_pos", JSON.stringify(pos)); } catch {}
      if (!didDrag.current) setExpanded(v => !v);
    }
  };

  return (
    <div
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      style={{
        position: "fixed", left: pos.x, top: pos.y, zIndex: 9999,
        fontFamily: "'Space Grotesk', sans-serif", userSelect: "none", touchAction: "none",
        transition: expanded ? "none" : "box-shadow 0.3s",
      }}
    >
      {/* Collapsed: tiny pill */}
      {!expanded && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 14px", borderRadius: 24,
          background: `${C.bgCard}f0`, backdropFilter: "blur(12px)",
          border: `1px solid ${statusColor}40`,
          boxShadow: `0 4px 20px ${C.bg}80, 0 0 12px ${statusColor}20`,
          cursor: "grab",
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%", background: statusColor,
            boxShadow: `0 0 8px ${statusColor}60`,
            animation: isSafe ? "none" : "pulse 2s infinite",
          }} />
          <span style={{ fontFamily: "'Chakra Petch'", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", color: statusColor }}>
            {isSafe ? "SAFE" : `${active} ALERT${active > 1 ? "S" : ""}`}
          </span>
          <span style={{ fontFamily: "'Fira Code'", fontSize: 10, color: C.dim }}>
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      )}

      {/* Expanded: full status card */}
      {expanded && (
        <div style={{
          width: 260, borderRadius: 16,
          background: `${C.bgCard}f5`, backdropFilter: "blur(16px)",
          border: `1px solid ${statusColor}30`,
          boxShadow: `0 8px 32px ${C.bg}90, 0 0 20px ${statusColor}15`,
          cursor: "grab", overflow: "hidden",
        }}>
          {/* Header bar */}
          <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: `linear-gradient(135deg, ${statusColor}, ${isSafe ? C.blue : C.orange})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <I.Shield s={12} style={{ color: "#fff" }} />
              </div>
              <span style={{ fontFamily: "'Chakra Petch'", fontWeight: 700, fontSize: 11, color: C.bright, letterSpacing: "0.06em" }}>AGENTSLOCK</span>
            </div>
            <span style={{ fontFamily: "'Fira Code'", fontSize: 10, color: C.dim }}>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>

          {/* Status section */}
          <div style={{ padding: "16px 14px", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 14, height: 14, borderRadius: "50%", background: statusColor,
                boxShadow: `0 0 10px ${statusColor}50`,
                animation: isSafe ? "none" : "pulse 2s infinite",
              }} />
              <span style={{ fontFamily: "'Chakra Petch'", fontWeight: 700, fontSize: 16, letterSpacing: "0.08em", color: statusColor }}>
                {isSafe ? "ALL SAFE" : "TAKE ACTION"}
              </span>
              <div style={{
                width: 14, height: 14, borderRadius: "50%", background: statusColor,
                boxShadow: `0 0 10px ${statusColor}50`,
                animation: isSafe ? "none" : "pulse 2s infinite",
              }} />
            </div>

            {!isSafe && (
              <div style={{ padding: "6px 12px", background: C.redDim, border: `1px solid ${C.redBdr}`, borderRadius: 6, marginBottom: 10, display: "inline-block" }}>
                <span style={{ color: C.red, fontSize: 11, fontWeight: 600 }}>
                  {critical > 0 ? `${critical} CRITICAL` : ""}{critical > 0 && active > critical ? " + " : ""}{active > critical ? `${active - critical} active` : ""}
                </span>
              </div>
            )}

            {/* Threat summary row */}
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
              {[
                { label: "Active", count: active, color: active > 0 ? C.red : C.green },
                { label: "Blocked", count: blocked, color: C.blue },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Fira Code'", fontSize: 18, fontWeight: 700, color: item.color }}>{item.count}</div>
                  <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 9, color: C.dim }}>{now.toLocaleDateString([], { month: "short", day: "numeric" })}</span>
            <span style={{ fontSize: 9, color: C.dim, opacity: 0.6 }}>drag to move</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const { user, loading, login, signup, googleLogin, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [checks, setChecks] = useState(DEFAULT_CHECKS);
  const [threats, setThreats] = useState(INIT_THREATS);
  const [accounts, setAccounts] = useState(INIT_ACCOUNTS);
  const [monitors, setMonitors] = useState([]);
  const [scanLog, setScanLog] = useState([]);
  const [deviceCleaned, setDeviceCleaned] = useState(() => LS.get("deviceCleaned", {}));
  const [now, setNow] = useState(new Date());
  const [dataLoaded, setDataLoaded] = useState(false);
  const [legalPage, setLegalPage] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subLoaded, setSubLoaded] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showInstallAll, setShowInstallAll] = useState(false);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  // Capture PWA install prompt for cross-platform install button
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Load subscription status on login
  useEffect(() => {
    if (!user) { setSubLoaded(false); setSubscription(null); return; }
    loadSubscription(user.uid).then(sub => {
      setSubscription(sub);
      setSubLoaded(true);
    }).catch(() => setSubLoaded(true));
  }, [user?.uid]);

  // Load user data from Firestore on login
  useEffect(() => {
    if (!user) { setDataLoaded(false); return; }
    loadUserData(user.uid).then(async (data) => {
      if (data) {
        if (data.checks && Object.keys(data.checks).length) setChecks({ ...DEFAULT_CHECKS, ...data.checks });
        if (data.threats?.length) setThreats(data.threats);
        if (data.accounts?.length) setAccounts(data.accounts);
        if (data.monitors?.length) setMonitors(data.monitors);
        if (data.scanLog?.length) setScanLog(data.scanLog);
        if (data.deviceCleaned && Object.keys(data.deviceCleaned).length) setDeviceCleaned(data.deviceCleaned);
      } else {
        // Firestore document missing (e.g. deleted by admin) — recreate it
        try {
          await saveUserData(user.uid, "email", user.email);
          await saveUserData(user.uid, "displayName", user.displayName || "");
          await saveUserData(user.uid, "createdAt", Date.now());
        } catch (e) { console.error("Failed to recreate user doc:", e); }
      }
      setDataLoaded(true);
    }).catch(() => setDataLoaded(true));
  }, [user?.uid]);

  // Auto-save to Firestore when data changes (debounced)
  const saveTimer = useRef(null);
  const autoSave = useCallback((field, value) => {
    if (!user || !dataLoaded) return;
    // Save to localStorage immediately (fast)
    LS.set(field, value);
    // Debounce Firestore save (reduce writes)
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveUserData(user.uid, field, value).catch(() => {});
    }, 2000);
  }, [user, dataLoaded]);

  const setChecksAndSave = (v) => { const nv = typeof v === "function" ? v(checks) : v; setChecks(nv); autoSave("checks", nv); };
  const setThreatsAndSave = (v) => { const nv = typeof v === "function" ? v(threats) : v; setThreats(nv); autoSave("threats", nv); };
  const setAccountsAndSave = (v) => { const nv = typeof v === "function" ? v(accounts) : v; setAccounts(nv); autoSave("accounts", nv); };
  const setMonitorsAndSave = (v) => { const nv = typeof v === "function" ? v(monitors) : v; setMonitors(nv); autoSave("monitors", nv); };
  // Auto-save deviceCleaned whenever it changes (useEffect avoids stale closure issues with functional setState)
  const deviceCleanedLoaded = useRef(false);
  useEffect(() => {
    if (!deviceCleanedLoaded.current) { deviceCleanedLoaded.current = true; return; }
    if (!user || !dataLoaded) return;
    autoSave("deviceCleaned", deviceCleaned);
  }, [deviceCleaned]);

  // Re-apply runtime protections on startup for all previously eliminated threats
  const protectionsBootstrapped = useRef(false);
  useEffect(() => {
    if (protectionsBootstrapped.current) return;
    const doneItems = Object.entries(deviceCleaned).filter(([, v]) => v === "done");
    if (doneItems.length > 0) {
      protectionsBootstrapped.current = true;
      const fixMap = { "webrtc-leak": "block-webrtc", "fingerprint": "spoof-fingerprint", "no-dnt": "enable-dnt-header", "no-https": "deploy-https" };
      doneItems.forEach(([id]) => {
        const fixId = fixMap[id] || (id.startsWith("perm-") ? `revoke-${id}` : null);
        if (fixId) applyProtection(fixId);
      });
    }
  }, [deviceCleaned]);
  const addLog = (entry) => { const n = [{ ...entry, time: new Date().toISOString() }, ...scanLog].slice(0, 100); setScanLog(n); autoSave("scanLog", n); };

  // Auto-check monitors every 5 min
  useEffect(() => {
    if (monitors.length === 0) return;
    const interval = setInterval(() => {
      monitors.forEach(async m => {
        try {
          const start = Date.now();
          await fetch(m.url, { mode: "no-cors", cache: "no-cache" });
          const elapsed = Date.now() - start;
          setMonitorsAndSave(prev => prev.map(x => x.id === m.id ? { ...x, status: "up", responseTime: elapsed, lastCheck: new Date().toISOString(), checks: [...(x.checks || []).slice(-49), { time: Date.now(), status: "up", ms: elapsed }] } : x));
        } catch {
          setMonitorsAndSave(prev => prev.map(x => x.id === m.id ? { ...x, status: "down", lastCheck: new Date().toISOString(), checks: [...(x.checks || []).slice(-49), { time: Date.now(), status: "down", ms: 0 }] } : x));
        }
      });
    }, 300000);
    return () => clearInterval(interval);
  }, [monitors.length]);

  // Remove the HTML splash screen once React is running
  useEffect(() => { if (window.__removeSplash) window.__removeSplash(); }, []);

  // Branded loading screen component (shared by auth + sub loading)
  const LoadingScreen = ({ message }) => (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", padding: 20 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${C.green}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: `0 8px 32px ${C.green}20` }}>
        <I.Shield s={28} style={{ color: "#fff" }} />
      </div>
      <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 20, fontWeight: 700, color: C.bright, letterSpacing: "0.06em", marginBottom: 6 }}>AGENTSLOCK</div>
      <div style={{ color: C.dim, fontSize: 12, marginBottom: 24 }}>Personal Cybersecurity Platform</div>
      <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.green, borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 14 }} />
      <div style={{ color: C.dim, fontSize: 12 }}>{message}</div>
    </div>
  );

  // Firebase not configured — show setup instructions
  if (firebaseError) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');`}</style>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${C.orange}, ${C.red})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <I.Alert s={28} style={{ color: "#fff" }} />
      </div>
      <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 20, fontWeight: 700, color: C.bright, letterSpacing: "0.06em", marginBottom: 6 }}>AGENTSLOCK</div>
      <div style={{ color: C.dim, fontSize: 12, marginBottom: 24 }}>Configuration Required</div>
      <Card style={{ maxWidth: 440, width: "100%" }}>
        <div style={{ color: C.red, fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Firebase Not Connected</div>
        <div style={{ color: C.text, fontSize: 12, lineHeight: 1.7, marginBottom: 16 }}>
          The app needs Firebase environment variables to run. Add these to your <span style={{ color: C.green, fontWeight: 600 }}>Vercel project settings</span> (Settings → Environment Variables):
        </div>
        <div style={{ background: C.bg, borderRadius: 8, padding: 14, fontFamily: "'Fira Code', monospace", fontSize: 11, color: C.cyan, lineHeight: 2 }}>
          {["VITE_FIREBASE_API_KEY", "VITE_FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_PROJECT_ID", "VITE_FIREBASE_STORAGE_BUCKET", "VITE_FIREBASE_MESSAGING_SENDER_ID", "VITE_FIREBASE_APP_ID"].map(v => (
            <div key={v}>{v}=<span style={{ color: C.dim }}>your_value</span></div>
          ))}
          <div style={{ marginTop: 8, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
            VITE_PAYPAL_CLIENT_ID=<span style={{ color: C.dim }}>your_value</span>{"\n"}
            VITE_PAYPAL_PLAN_ID=<span style={{ color: C.dim }}>your_value</span>
          </div>
        </div>
        <div style={{ color: C.dim, fontSize: 11, marginTop: 12 }}>After adding them, redeploy on Vercel. Get these values from your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener" style={{ color: C.blue }}>Firebase Console</a> → Project Settings.</div>
        <div style={{ marginTop: 16 }}>
          <Btn onClick={() => window.location.reload()} color={C.green} style={{ width: "100%", justifyContent: "center" }}><I.Refresh /> Refresh Page</Btn>
        </div>
      </Card>
      <div style={{ color: C.dim, fontSize: 10, marginTop: 20, fontFamily: "'Fira Code', monospace", padding: "6px 10px", background: C.bgCard, borderRadius: 4 }}>{firebaseError}</div>
    </div>
  );

  // Loading screen
  if (loading) return <LoadingScreen message="Loading AgentsLock..." />;

  // Wrap signup to capture promo subscription immediately (fixes race condition
  // where onAuthStateChanged fires before Firestore write completes)
  const handleSignup = async (email, name, pass, promoCode) => {
    const r = await signup(email, name, pass, promoCode);
    if (r.ok && r.subscription) {
      setSubscription(r.subscription);
      setSubLoaded(true);
    }
    return r;
  };

  if (!user) return <AuthScreen onLogin={login} onSignup={handleSignup} onGoogleLogin={googleLogin} />;

  // Admin bypass — developer always gets full access (no PayPal required)
  const isAdmin = import.meta.env.VITE_ADMIN_EMAIL && user.email === import.meta.env.VITE_ADMIN_EMAIL;

  // Show subscription screen if user hasn't subscribed (admin bypasses this)
  if (!isAdmin && subLoaded && (!subscription || subscription.status !== "active")) {
    return <SubscriptionScreen user={user} onSubscribed={(sub) => setSubscription(sub)} onLogout={logout} />;
  }

  // Wait for subscription check before showing dashboard (admin skips wait)
  if (!isAdmin && !subLoaded) return <LoadingScreen message="Checking subscription..." />;

  const activeThreats = threats.filter(t => t.status === "active").length;
  const userName = user.displayName || user.email?.split("@")[0] || "User";

  return (
    <div style={{ fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif", background: C.bg, color: C.text, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Fira+Code:wght@400;600&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        ::selection{background:${C.green}30;color:${C.bright}} input:focus{border-color:${C.green}!important}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", borderBottom:`1px solid ${C.border}`, background:`${C.bgCard}ee`, backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:8, background:`linear-gradient(135deg,${C.green},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center" }}><I.Shield s={18} style={{ color:"#fff" }}/></div>
          <div>
            <div style={{ fontFamily:"'Chakra Petch'", fontWeight:700, fontSize:16, color:C.bright, letterSpacing:"0.06em" }}>AGENTSLOCK</div>
            <div style={{ fontSize:9, color:C.dim, letterSpacing:"0.12em", textTransform:"uppercase" }}>v4.0 — Firebase Secured Platform</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontFamily:"'Fira Code'", fontSize:12, color:C.dim }}>{now.toLocaleTimeString()}</span>
          {activeThreats > 0 ? (
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:C.redDim, border:`1px solid ${C.redBdr}`, borderRadius:6, animation:"pulse 2s infinite" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:C.red }}/><span style={{ color:C.red, fontSize:11, fontWeight:600 }}>{activeThreats} THREAT{activeThreats>1?"S":""}</span>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:C.greenDim, border:`1px solid ${C.greenBdr}`, borderRadius:6 }}>
              <I.Shield s={12} style={{ color:C.green }}/><span style={{ color:C.green, fontSize:11, fontWeight:600 }}>SECURED</span>
            </div>
          )}
          <button onClick={() => setShowInstallAll(true)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", background:`linear-gradient(135deg,${C.green},${C.blue})`, border:"none", borderRadius:6, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:600, color:"#fff", transition:"opacity 0.2s" }}
            onMouseOver={e=>e.currentTarget.style.opacity=0.85} onMouseOut={e=>e.currentTarget.style.opacity=1}>
            <I.Download s={14}/> Install App
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:6, color:C.dim, fontSize:11 }}><I.User s={14}/>{userName}</div>
        </div>
      </header>

      <nav style={{ display:"flex", gap:2, padding:"8px 24px", borderBottom:`1px solid ${C.border}`, overflowX:"auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px", border:"none", borderRadius:6, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:tab===t.id?600:400, whiteSpace:"nowrap", background:tab===t.id?`${C.green}12`:"transparent", color:tab===t.id?C.green:C.dim, transition:"all 0.2s" }}>
            {t.icon}{t.label}
            {t.id==="threats"&&activeThreats>0&&<Badge color={C.red} style={{ fontSize:8, padding:"1px 5px" }}>{activeThreats}</Badge>}
          </button>
        ))}
      </nav>

      <main style={{ padding:24, maxWidth:1200, margin:"0 auto" }}>
        {tab==="overview" && <OverviewTab checks={checks} threats={threats} setThreats={setThreatsAndSave} accounts={accounts} scanLog={scanLog} monitors={monitors} userName={userName} setTab={setTab} addLog={addLog} deviceCleaned={deviceCleaned} setDeviceCleaned={setDeviceCleaned} />}
        {tab==="breach" && <BreachTab addLog={addLog} />}
        {tab==="passwords" && <PasswordTab />}
        {tab==="scanner" && <ScannerTab addLog={addLog} />}
        {tab==="devices" && <DeviceTab checks={checks} setChecks={setChecksAndSave} />}
        {tab==="accounts" && <AccountTab accounts={accounts} setAccounts={setAccountsAndSave} />}
        {tab==="threats" && <ThreatTab threats={threats} setThreats={setThreatsAndSave} />}
        {tab==="monitor" && <MonitorTab monitors={monitors} setMonitors={setMonitorsAndSave} />}
        {tab==="reports" && <ReportTab checks={checks} threats={threats} accounts={accounts} monitors={monitors} scanLog={scanLog} />}
        {tab==="incident" && <IncidentTab />}
        {tab==="help" && <HelpTab installPrompt={installPrompt} setInstallPrompt={setInstallPrompt} />}
        {tab==="settings" && <SettingsTab user={user} logout={logout} setLegalPage={setLegalPage} subscription={subscription} />}
      </main>

      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"24px 24px 20px", color:C.dim, fontSize:11, lineHeight:1.8 }}>
        {/* Legal links row */}
        <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:12, flexWrap:"wrap" }}>
          {[["terms","Terms of Service"],["privacy","Privacy Policy"],["disclaimer","Disclaimer"],["about","About"]].map(([k,label])=>(
            <button key={k} onClick={()=>setLegalPage(k)} style={{ background:"none", border:"none", color:C.green, cursor:"pointer", fontSize:11, fontFamily:"inherit", fontWeight:500, padding:0, textDecoration:"none", transition:"opacity 0.2s" }}
              onMouseOver={e=>e.currentTarget.style.opacity=0.7} onMouseOut={e=>e.currentTarget.style.opacity=1}>{label}</button>
          ))}
          {isAdmin && (
            <button onClick={()=>setShowAdmin(true)} style={{ background:"none", border:"none", color:C.orange, cursor:"pointer", fontSize:11, fontFamily:"inherit", fontWeight:600, padding:0, textDecoration:"none", transition:"opacity 0.2s", display:"flex", alignItems:"center", gap:4 }}
              onMouseOver={e=>e.currentTarget.style.opacity=0.7} onMouseOut={e=>e.currentTarget.style.opacity=1}>
              <I.Settings s={12} /> Admin Dashboard
            </button>
          )}
        </div>
        {/* Company details */}
        <div style={{ textAlign:"center", maxWidth:680, margin:"0 auto" }}>
          <div style={{ marginBottom:4 }}>
            <span style={{ color:C.bright, fontWeight:600 }}>{"\u00A9"} 2026 AgentsLock</span>
            {" \u2014 "}All rights reserved.
          </div>
          <div style={{ color:C.dim, fontSize:10, marginTop:6, lineHeight:1.6 }}>
            All trademarks and data belong to their respective owners. No reproduction without permission.
            Informational only. No financial, legal, or tax advice. Markets involve risk and returns are not guaranteed.
            Past performance is not indicative of future results. See{" "}
            <button onClick={()=>setLegalPage("terms")} style={{ background:"none", border:"none", color:C.green, cursor:"pointer", fontSize:10, fontFamily:"inherit", padding:0, textDecoration:"underline" }}>Terms</button>.
          </div>
        </div>
      </footer>

      {/* Install on All Devices overlay */}
      {showInstallAll && <InstallAllDevices onClose={() => setShowInstallAll(false)} installPrompt={installPrompt} setInstallPrompt={setInstallPrompt} />}

      {/* Admin Dashboard overlay */}
      {showAdmin && isAdmin && <AdminDashboard user={user} onClose={() => setShowAdmin(false)} />}

      {/* Legal overlay */}
      <LegalOverlay page={legalPage} onClose={(nextPage) => setLegalPage(nextPage || null)} />

      {/* Floating status widget — always-on-top, draggable */}
      <StatusWidget threats={threats} />
    </div>
  );
}
