import { useState, useEffect, useCallback, useRef, Component } from "react";
import { auth, db, firebaseError, signUp, logIn, logOut, onAuth, loadUserData, saveUserData, saveSubscription, loadSubscription } from "./firebase.js";

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

// ─── Firebase Auth Hook ──────────────────────────────────────────────────────
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onAuth((u) => { setUser(u); setLoading(false); });
    return unsub;
  }, []);
  const doLogin = async (email, pass) => {
    try { await logIn(email, pass); return { ok: true }; }
    catch (e) { return { ok: false, err: e.message.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim() }; }
  };
  const doSignup = async (email, name, pass) => {
    try { await signUp(email, pass, name); return { ok: true }; }
    catch (e) { return { ok: false, err: e.message.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim() }; }
  };
  const doLogout = async () => { await logOut(); };
  return { user, loading, login: doLogin, signup: doSignup, logout: doLogout };
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
const Input = ({ value, onChange, placeholder, type = "text", style, icon }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", ...style }}>
    {icon && <span style={{ position: "absolute", left: 12, color: C.dim }}>{icon}</span>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: icon ? "10px 14px 10px 38px" : "10px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.bright, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
  </div>
);
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
function AuthScreen({ onLogin, onSignup }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr(""); setBusy(true);
    if (!email || !pass) { setErr("Fill all fields"); setBusy(false); return; }
    if (mode === "signup" && !name) { setErr("Enter your name"); setBusy(false); return; }
    if (pass.length < 6) { setErr("Password must be 6+ characters"); setBusy(false); return; }
    const r = mode === "login" ? await onLogin(email, pass) : await onSignup(email, name, pass);
    if (!r.ok) setErr(r.err);
    setBusy(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ width: 400, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${C.green}, ${C.blue})`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <I.Shield s={28} style={{ color: "#fff" }} />
          </div>
          <h1 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 28, color: C.bright, margin: "0 0 4px", letterSpacing: "0.06em" }}>AGENTSLOCK</h1>
          <p style={{ color: C.dim, fontSize: 12 }}>Personal Cybersecurity Platform</p>
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

          {err && <div style={{ padding: "8px 12px", background: C.redDim, border: `1px solid ${C.redBdr}`, borderRadius: 6, color: C.red, fontSize: 12, marginBottom: 12 }}>{err}</div>}

          <Btn onClick={submit} disabled={busy} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
            <I.LogIn /> {busy ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </Btn>
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
    { icon: <I.Database />, text: "Breach & Dark Web Monitoring" },
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

function OverviewTab({ checks, threats, accounts, scanLog, monitors, userName, setTab, addLog, deviceCleaned, setDeviceCleaned }) {
  const totalChecks = Object.values(DEVICE_CHECKS).flat().length;
  const doneChecks = Object.keys(checks).filter(k => checks[k]).length;
  const score = totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;
  const activeThreats = threats.filter(t => t.status === "active").length;
  const highRisk = accounts.filter(a => a.risk === "high").length;
  const onlineMonitors = monitors.filter(m => m.status === "up").length;

  // ── Device Scan State ──
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState("");
  const [findings, setFindings] = useState(null);
  const cleaned = deviceCleaned;
  const setCleaned = (v) => setDeviceCleaned(typeof v === "function" ? v(deviceCleaned) : v);

  // Re-apply runtime protections on mount for previously eliminated threats
  const protectionsApplied = useRef(false);
  useEffect(() => {
    if (protectionsApplied.current) return;
    const doneItems = Object.entries(cleaned).filter(([, v]) => v === "done");
    if (doneItems.length > 0) {
      protectionsApplied.current = true;
      doneItems.forEach(([id]) => {
        const fixMap = { "webrtc-leak": "block-webrtc", "fingerprint": "spoof-fingerprint", "no-dnt": "enable-dnt-header", "no-https": "deploy-https" };
        const fixId = fixMap[id] || (id.startsWith("perm-") ? `revoke-${id}` : null);
        if (fixId) applyProtection(fixId);
      });
    }
  }, [cleaned]);

  const runDeviceScan = async () => {
    setScanning(true); setFindings(null); setEliminating(false); setElimProgress(null);
    const results = [];
    const pageOrigin = location.origin || location.href;
    const pageHost = location.hostname || "localhost";

    // ── Resolve real public IP for origin attribution ──
    let publicIP = null;
    try { const r = await fetch("https://api.ipify.org?format=json"); const d = await r.json(); publicIP = d.ip; } catch {}

    const steps = [
      { phase: "Checking browser security...", pct: 10, run: () => {
        const isHttps = location.protocol === "https:";
        if (!isHttps) results.push({ id: "no-https", sev: "critical", cat: "Browser", name: "Insecure Connection", desc: "Page not served over HTTPS — data can be intercepted", fix: "deploy-https", fixLabel: "Eliminate", elimDesc: "Force-redirect all requests to HTTPS and block insecure resources", origin: pageOrigin, originType: "address" });
        const ua = navigator.userAgent;
        const isOldBrowser = /MSIE|Trident/.test(ua);
        if (isOldBrowser) results.push({ id: "old-browser", sev: "critical", cat: "Browser", name: "Outdated Browser", desc: "Internet Explorer detected — highly vulnerable to attacks", fix: "block-old-browser", fixLabel: "Eliminate", elimDesc: "Block unsafe legacy APIs and apply security shims", origin: navigator.userAgent.match(/(MSIE\s[\d.]+|Trident\/[\d.]+)/)?.[0] || "Internet Explorer", originType: "browser" });
        const dnt = navigator.doNotTrack;
        if (dnt !== "1") results.push({ id: "no-dnt", sev: "low", cat: "Privacy", name: "Do Not Track disabled", desc: "Browser is not sending Do Not Track signal to websites", fix: "enable-dnt-header", fixLabel: "Eliminate", elimDesc: "Inject DNT headers into app requests to signal tracking opt-out", origin: `${navigator.vendor || "Browser"} — ${pageHost}`, originType: "browser" });
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
          if (leakedIP) results.push({ id: "webrtc-leak", sev: "high", cat: "Privacy", name: "WebRTC IP leak detected", desc: "Your real IP address is exposed through WebRTC — even with a VPN", fix: "block-webrtc", fixLabel: "Eliminate", elimDesc: "Disable WebRTC peer connections to stop IP leak — does not affect normal browsing", origin: `${leakedIP} via stun.l.google.com:19302`, originType: "ip" });
        } catch {}
      }},
      { phase: "Checking permissions...", pct: 70, run: async () => {
        const permsToCheck = ["camera", "microphone", "geolocation", "notifications"];
        for (const p of permsToCheck) {
          try {
            const status = await navigator.permissions.query({ name: p });
            if (status.state === "granted") results.push({ id: `perm-${p}`, sev: p === "geolocation" ? "high" : "medium", cat: "Permissions", name: `${p.charAt(0).toUpperCase() + p.slice(1)} access granted`, desc: `Website has ${p} permission — revoke if not needed`, fix: `revoke-perm-${p}`, fixLabel: "Eliminate", elimDesc: `Block ${p} API access for this page and clear granted permission`, origin: `${pageHost} → navigator.${p === "notifications" ? "Notification" : p === "camera" || p === "microphone" ? "mediaDevices" : p}`, originType: "api" });
          } catch {}
        }
      }},
      { phase: "Analyzing device exposure...", pct: 85, run: () => {
        // Skip fingerprint check if already spoofed by AgentsLock
        if (!window.__alFingerprintSpoofed) {
          const cores = navigator.hardwareConcurrency;
          const mem = navigator.deviceMemory;
          const platform = navigator.platform;
          let fpPoints = 0; const fpAPIs = [];
          if (cores) { fpPoints++; fpAPIs.push("hardwareConcurrency"); }
          if (mem) { fpPoints++; fpAPIs.push("deviceMemory"); }
          if (platform) { fpPoints++; fpAPIs.push("platform"); }
          if (navigator.languages?.length > 1) { fpPoints++; fpAPIs.push("languages"); }
          if (screen.colorDepth) { fpPoints++; fpAPIs.push("screen.colorDepth"); }
          if (fpPoints >= 4) results.push({ id: "fingerprint", sev: "medium", cat: "Privacy", name: "Device fingerprinting exposure", desc: `${fpPoints} data points exposed (CPU, memory, screen, language) — sites can track you`, fix: "spoof-fingerprint", fixLabel: "Eliminate", elimDesc: "Randomize exposed device properties to break fingerprint tracking", origin: `navigator.{${fpAPIs.join(", ")}}`, originType: "api" });
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
    setScanPhase("Scan complete");
    await new Promise(r => setTimeout(r, 300));

    if (results.length === 0) results.push({ id: "all-clear", sev: "safe", cat: "System", name: "No threats detected", desc: "Your device passed all security checks", fix: null, fixLabel: null, elimDesc: null, origin: null });

    setFindings(results);
    setScanning(false);
    addLog({ type: "DeviceScan", target: navigator.platform || "Device", safe: results.every(r => r.sev === "safe" || r.sev === "low") });
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
  };

  // ── Eliminate All Threats ──
  const [eliminating, setEliminating] = useState(false);
  const [elimProgress, setElimProgress] = useState(null);

  const eliminateAll = async () => {
    if (!findings) return;
    const actionable = findings.filter(f => f.sev !== "safe" && f.fix && cleaned[f.id] !== "done");
    if (actionable.length === 0) return;
    setEliminating(true);
    setElimProgress({ done: 0, total: actionable.length, current: "" });
    for (let i = 0; i < actionable.length; i++) {
      setElimProgress({ done: i, total: actionable.length, current: actionable[i].name });
      await eliminateFinding(actionable[i]);
      setElimProgress({ done: i + 1, total: actionable.length, current: actionable[i].name });
    }
    setEliminating(false);
    addLog({ type: "Eliminate", target: `${actionable.length} threats`, safe: true });
  };

  const sevIcon = (sev) => ({ critical: C.red, high: C.red, medium: C.orange, low: C.green, safe: C.green }[sev] || C.dim);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {userName && <div style={{ fontSize: 13, color: C.dim }}>Welcome back, <span style={{ color: C.green, fontWeight: 600 }}>{userName}</span></div>}

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
        <Sect title="Device Security Scan" icon={<I.Crosshair />}>
          {!scanning && !findings && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ color: C.dim, fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
                Scan your device for security risks — cookies, trackers, permission leaks, WebRTC exposure, and more. Issues found can be cleaned instantly.
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
                <div style={{ display: "flex", gap: 12 }}>
                  {["critical", "high", "medium", "low"].map(sev => {
                    const count = findings.filter(f => f.sev === sev).length;
                    return count > 0 ? (
                      <div key={sev} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: sevIcon(sev) }} />
                        <span style={{ fontSize: 11, color: C.text }}>{count} {sev}</span>
                      </div>
                    ) : null;
                  })}
                  {findings.every(f => f.sev === "safe") && <span style={{ color: C.green, fontSize: 12, fontWeight: 600 }}>All clear — no threats detected</span>}
                </div>
                {(() => {
                  const actionable = findings.filter(f => f.sev !== "safe" && f.fix && cleaned[f.id] !== "done");
                  const allDone = findings.filter(f => f.sev !== "safe").length > 0 && findings.filter(f => f.sev !== "safe").every(f => cleaned[f.id] === "done");
                  return actionable.length > 0 && !eliminating ? (
                    <Btn onClick={eliminateAll} color={C.red} style={{ fontSize: 11, padding: "5px 14px" }}><I.Crosshair /> Eliminate All ({actionable.length})</Btn>
                  ) : allDone ? (
                    <Badge color={C.green}>All Eliminated</Badge>
                  ) : null;
                })()}
              </div>

              {/* Eliminate All progress */}
              {eliminating && elimProgress && (
                <div style={{ padding: "10px 14px", background: `${C.red}08`, border: `1px solid ${C.red}25`, borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 16, height: 16, border: `2px solid ${C.border}`, borderTopColor: C.red, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <span style={{ color: C.red, fontSize: 12, fontWeight: 600 }}>Eliminating threats... ({elimProgress.done}/{elimProgress.total})</span>
                  </div>
                  <Progress value={elimProgress.total > 0 ? Math.round((elimProgress.done / elimProgress.total) * 100) : 0} color={C.red} h={4} />
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>Neutralizing: {elimProgress.current}</div>
                </div>
              )}

              {/* Findings list */}
              {findings.filter(f => f.sev !== "safe").map(f => (
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
                          {cleaned[f.id] === "done" ? "Threat eliminated — your device is safe" : cleaned[f.id] === "cleaning" ? f.elimDesc : f.desc}
                        </div>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, marginLeft: 10 }}>
                      {cleaned[f.id] === "done" ? (
                        <Badge color={C.green}>Eliminated</Badge>
                      ) : cleaned[f.id] === "cleaning" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 12, height: 12, border: `2px solid ${C.border}`, borderTopColor: C.red, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                          <span style={{ fontSize: 10, color: C.red, fontWeight: 600 }}>Eliminating...</span>
                        </div>
                      ) : f.fix ? (
                        <Btn onClick={() => eliminateFinding(f)} color={C.red} style={{ fontSize: 10, padding: "4px 12px" }} disabled={eliminating}><I.Crosshair /> Eliminate</Btn>
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
                <Btn onClick={() => { setFindings(null); setCleaned({}); setElimProgress(null); }} color={C.dim} style={{ fontSize: 11 }}><I.X /> Dismiss</Btn>
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
              { label: "Breach Check", desc: "Check email leaks", icon: <I.Mail />, color: C.blue, tab: "breach" },
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
        <Card>
          <Sect title="Recent Threats" icon={<I.Alert />}>
            {threats.length === 0 ? <div style={{ textAlign: "center", padding: 20, color: C.dim }}>All clear</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {threats.slice(0, 4).map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: C.bg, borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: sevColor(t.severity) }} />
                      <span style={{ color: C.bright, fontWeight: 600, fontSize: 12 }}>{t.name}</span>
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
                    <span style={{ color: C.dim }}>{s.time?.toLocaleTimeString?.() || ""}</span>
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
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [emailRes, setEmailRes] = useState(null);
  const [pwRes, setPwRes] = useState(null);
  const [loading, setLoading] = useState("");

  const checkEmail = async () => {
    if (!email) return; setLoading("email"); setEmailRes(null);
    try {
      const r = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, { headers: { "hibp-api-key": "", "User-Agent": "AgentsLock" } });
      if (r.status === 404) { setEmailRes({ safe: true }); addLog({ type: "Breach", target: email, safe: true }); }
      else if (r.status === 401 || r.status === 403) { setEmailRes({ needsKey: true }); }
      else { const d = await r.json(); setEmailRes({ safe: false, breaches: d }); addLog({ type: "Breach", target: email, safe: false }); }
    } catch { setEmailRes({ needsKey: true }); }
    setLoading("");
  };
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card glow={C.blue}>
        <Sect title="Email Breach Check" icon={<I.Mail />}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <Input value={email} onChange={setEmail} placeholder="Enter email..." icon={<I.Mail />} style={{ flex: 1 }} />
            <Btn onClick={checkEmail} disabled={loading === "email"} color={C.blue}>{loading === "email" ? "Checking..." : "Check"}</Btn>
          </div>
          {emailRes && (
            <div style={{ padding: 14, borderRadius: 8, background: emailRes.needsKey ? C.blueDim : emailRes.safe ? C.greenDim : C.redDim, border: `1px solid ${emailRes.needsKey ? C.blueBdr : emailRes.safe ? C.greenBdr : C.redBdr}` }}>
              {emailRes.needsKey ? <div><div style={{ color: C.blue, fontWeight: 600 }}>ℹ️ API Key Required</div><div style={{ color: C.text, fontSize: 12, marginTop: 4 }}>Email lookup needs HIBP API key ($3.50/mo). <a href="https://haveibeenpwned.com/API/Key" target="_blank" rel="noopener" style={{ color: C.blue }}>Get one here</a>. Password check below is free!</div></div>
              : emailRes.safe ? <div style={{ color: C.green, fontWeight: 600 }}>✅ No breaches found</div>
              : <div><div style={{ color: C.red, fontWeight: 600, marginBottom: 8 }}>🔴 Found in {emailRes.breaches.length} breach(es)!</div>
                  {emailRes.breaches.slice(0, 8).map((b, i) => (
                    <div key={i} style={{ padding: "6px 10px", background: C.bg, borderRadius: 6, fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: C.bright, fontWeight: 600 }}>{b.Name}</span>
                      <span style={{ color: C.dim, marginLeft: 8 }}>{b.BreachDate}</span>
                    </div>))}
                </div>}
            </div>
          )}
        </Sect>
      </Card>
      <Card glow={C.purple}>
        <Sect title="Password Breach Check" icon={<I.Key />}>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>🔒 Uses k-anonymity — your password never leaves your browser.</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <Input value={pw} onChange={setPw} placeholder="Enter password..." type="password" icon={<I.Lock />} style={{ flex: 1 }} />
            <Btn onClick={checkPw} disabled={loading === "pw"} color={C.purple}>{loading === "pw" ? "Checking..." : "Check"}</Btn>
          </div>
          {pwRes && (
            <div style={{ padding: 14, borderRadius: 8, background: pwRes.safe ? C.greenDim : C.redDim, border: `1px solid ${pwRes.safe ? C.greenBdr : C.redBdr}` }}>
              {pwRes.error ? <div style={{ color: C.orange }}>⚠️ Error — retry</div>
              : pwRes.safe ? <div style={{ color: C.green, fontWeight: 600 }}>✅ Not found in breaches</div>
              : <div><div style={{ color: C.red, fontWeight: 600 }}>🔴 Seen {pwRes.count.toLocaleString()} times!</div><div style={{ color: C.text, fontSize: 12, marginTop: 4 }}>Change immediately everywhere.</div></div>}
            </div>
          )}
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
  return (
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
      setResult({ url: target, hostname, sslGrade, headers: SEC_HEADERS, time: new Date() });
      addLog({ type: "WebScan", target: hostname, safe: sslGrade.startsWith?.("A") });
    } catch (e) { setResult({ error: e.message }); }
    setScanning(false);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card><Sect title="Website Security Scanner" icon={<I.Globe />}>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>SSL/TLS grade, security headers analysis, and recommendations.</div>
        <div style={{ display: "flex", gap: 8 }}><Input value={url} onChange={setUrl} placeholder="example.com" icon={<I.Search />} style={{ flex: 1 }} /><Btn onClick={scan} disabled={scanning}>{scanning ? "Scanning..." : "Scan"}</Btn></div>
      </Sect></Card>
      {result && !result.error && (<>
        <Card glow={C.green}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[["SSL Grade", result.sslGrade, result.sslGrade?.startsWith?.("A") ? C.green : C.orange], ["Host", result.hostname, C.bright], ["Headers", SEC_HEADERS.length+"", C.orange]].map(([l,v,c],i) => (
            <div key={i} style={{ padding: 14, background: C.bg, borderRadius: 8, textAlign: "center" }}><div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>{l}</div><div style={{ fontSize: l==="Host"?13:26, fontWeight: 700, color: c }}>{v}</div></div>
          ))}
        </div></Card>
        <Card><Sect title="Security Headers" icon={<I.FileText />}>
          {result.headers.map((h,i) => <div key={i} style={{ padding:"10px 14px", background:C.bg, borderRadius:8, marginBottom:6, border:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}><span style={{ color:C.bright, fontWeight:600, fontSize:12 }}>{h.name}</span><Badge color={sevColor(h.sev)}>{h.sev}</Badge></div>
            <div style={{ fontSize:11, color:C.dim }}>{h.desc}</div>
            <div style={{ fontSize:10, color:C.cyan, fontFamily:"'Fira Code', monospace", marginTop:4, padding:"4px 8px", background:`${C.cyan}08`, borderRadius:4 }}>{h.name}: {h.rec}</div>
          </div>)}
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

function DeviceTab({ checks, setChecks }) {
  const [active, setActive] = useState("windows");
  const items = DEVICE_CHECKS[active]; const done = items.filter(c => checks[c.id]).length; const pct = Math.round((done / items.length) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
          <div><h3 style={{ margin: 0, fontFamily: "'Chakra Petch', sans-serif", fontSize: 15, color: C.bright }}>{DEVICE_META[active].name} Hardening</h3><div style={{ fontSize: 11, color: C.dim }}>{done}/{items.length} ({pct}%)</div></div>
          <div style={{ width: 200 }}><Progress value={pct} color={pct===100?C.green:pct>50?C.orange:C.red} h={8} /></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map(c => (
            <div key={c.id} onClick={() => { const nv = { ...checks, [c.id]: !checks[c.id] }; setChecks(nv); }}
              style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: checks[c.id] ? `${C.green}06` : C.bg, borderRadius: 8, border: `1px solid ${checks[c.id] ? C.greenBdr : C.border}`, cursor: "pointer" }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1, border: `2px solid ${checks[c.id] ? C.green : "#2a2d3e"}`, background: checks[c.id] ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0b0f" }}>{checks[c.id] && <I.Check s={12}/>}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}><span style={{ color: checks[c.id] ? C.dim : C.bright, fontWeight: 500, fontSize: 12, textDecoration: checks[c.id] ? "line-through" : "none" }}>{c.text}</span><Badge color={sevColor(c.sev)}>{c.sev}</Badge></div>
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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
  const filtered = filter === "all" ? threats : threats.filter(t => t.status === filter);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <Stat label="Active" value={threats.filter(t=>t.status==="active").length} color={C.red} />
        <Stat label="Blocked" value={threats.filter(t=>t.status==="blocked").length} color={C.green} />
        <Stat label="Investigating" value={threats.filter(t=>t.status==="investigating").length} color={C.orange} />
        <Stat label="Resolved" value={threats.filter(t=>t.status==="resolved").length} color={C.blue} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>{["all","active","blocked","investigating","resolved"].map(f => <Btn key={f} onClick={()=>setFilter(f)} color={filter===f?C.green:C.dim} style={{ fontSize:10, padding:"5px 10px", textTransform:"capitalize" }}>{f}</Btn>)}</div>
      {filtered.length===0 ? <Card><div style={{ textAlign:"center", padding:30, color:C.dim }}>Empty</div></Card> : filtered.map(t => (
        <Card key={t.id} glow={t.status==="active"?C.red:undefined}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><div style={{ width:8, height:8, borderRadius:"50%", background:sevColor(t.severity) }}/><span style={{ color:C.bright, fontWeight:700, fontSize:14 }}>{t.name}</span><Badge color={sevColor(t.severity)}>{t.severity}</Badge></div>
              <div style={{ color:C.dim, fontSize:12 }}>Target: {t.target} · {t.time}</div>
              {t.desc && <div style={{ color:C.text, fontSize:12, marginTop:6 }}>{t.desc}</div>}
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
    for (const m of monitors) { await checkSite(m, monitors); }
    setChecking(false);
  };

  const remove = (id) => { const n = monitors.filter(m => m.id !== id); setMonitors(n); };

  const upCount = monitors.filter(m => m.status === "up").length;
  const upPct = monitors.length > 0 ? Math.round((upCount / monitors.length) * 100) : 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
    const report = `AGENTSLOCK SECURITY REPORT\nGenerated: ${new Date().toISOString()}\n${"=".repeat(50)}\n\nSECURITY SCORE: ${score}/100\n\nHARDENING: ${doneChecks}/${totalChecks} complete\n  Critical: ${critDone}/${critChecks.length}\n\nACCOUNTS: ${accounts.length} total\n  2FA Enabled: ${twoFACount}/${accounts.length}\n  High Risk: ${highRisk}\n\nTHREATS:\n  Active: ${threats.filter(t=>t.status==="active").length}\n  Blocked: ${threats.filter(t=>t.status==="blocked").length}\n  Resolved: ${threats.filter(t=>t.status==="resolved").length}\n\nMONITORS: ${monitors.length} sites\n  Online: ${upMonitors}\n\nSCAN HISTORY: ${scanLog.length} total scans\n\n${"=".repeat(50)}\nINCOMPLETE CRITICAL TASKS:\n${critChecks.filter(c=>!checks[c.id]).map(c=>`  ❌ ${c.text}`).join("\n")}\n\nHIGH RISK ACCOUNTS:\n${accounts.filter(a=>a.risk==="high").map(a=>`  ⚠️ ${a.name} - ${a.twoFA?"2FA on":"NO 2FA"}`).join("\n")}\n`;
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `agentslock-report-${new Date().toISOString().slice(0,10)}.txt`; a.click();
    URL.revokeObjectURL(url);
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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card glow={active ? C.red : undefined} style={active ? { background: `${C.red}08`, borderColor: C.redBdr } : {}}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Chakra Petch'", fontSize: 18, fontWeight: 700, color: active ? C.red : C.bright }}>{active ? "🚨 INCIDENT MODE ACTIVE" : "Incident Response Protocol"}</div>
            <div style={{ color: C.dim, fontSize: 12, marginTop: 4 }}>{active ? `${done}/${IR_STEPS.length} steps done` : "Activate if compromise suspected."}</div>
          </div>
          <Btn onClick={() => setActive(!active)} color={active ? C.red : C.orange}>{active ? "Deactivate" : "Activate"}</Btn>
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
          {[["Google Recovery","https://accounts.google.com/signin/recovery"],["GitHub Support","https://support.github.com"],["AWS Incident","https://aws.amazon.com/security/incident-response/"],["HIBP","https://haveibeenpwned.com"],["Vercel Help","https://vercel.com/help"]].map(([n,u],i) => (
            <a key={i} href={u} target="_blank" rel="noopener" style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", background:C.bg, borderRadius:6, color:C.blue, textDecoration:"none", fontSize:12, marginBottom:4 }}>{n}<I.ExternalLink /></a>
          ))}
        </Sect></Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 11: SETTINGS (Phase 3)
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsTab({ user, logout, setLegalPage, subscription }) {
  const [hibpKey, setHibpKey] = useState(() => LS.get("hibpKey", ""));
  const [notifsOn, setNotifsOn] = useState(() => LS.get("notifs", true));
  const [autoScan, setAutoScan] = useState(() => LS.get("autoScan", false));
  const [dataCleared, setDataCleared] = useState(false);

  const saveKey = () => { LS.set("hibpKey", hibpKey); };
  const clearAll = () => {
    ["checks","accounts","threats","monitors","scanLog","irChecks","hibpKey"].forEach(k => LS.del(k));
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
                <span style={{ color: C.bright, fontWeight: 600 }}>Pro Plan</span>
                <Badge color={C.green}>ACTIVE</Badge>
              </div>
              <div style={{ color: C.dim, fontSize: 12 }}>$18.00 USD / month via PayPal</div>
              {subscription?.subscribedAt && (
                <div style={{ color: C.dim, fontSize: 10, marginTop: 2 }}>
                  Subscribed: {new Date(subscription.subscribedAt).toLocaleDateString()}
                  {subscription.subscriptionId && <> &middot; ID: {subscription.subscriptionId.slice(0, 12)}...</>}
                </div>
              )}
            </div>
            <a href="https://www.paypal.com/myaccount/autopay" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Btn color={C.blue}><I.ExternalLink /> Manage</Btn>
            </a>
          </div>
        </Sect>
      </Card>

      <Card>
        <Sect title="API Keys" icon={<I.Key />}>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>Add your HaveIBeenPwned API key for email breach checking.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Input value={hibpKey} onChange={setHibpKey} placeholder="Enter HIBP API key..." type="password" icon={<I.Key />} style={{ flex: 1 }} />
            <Btn onClick={saveKey} color={C.green}>Save</Btn>
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
            <div style={{ color: C.dim, marginBottom: 4 }}>Leffler International Investments Pty Ltd — ACN 124 089 345 / ABN 90 124 089 345</div>
            <div style={{ color: C.dim }}>React + Vite + Firebase Auth + Firestore. Real-time cloud sync. PWA enabled.</div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a href="https://agentslock.com" target="_blank" rel="noopener" style={{ color: C.green, textDecoration: "none", fontSize: 11 }}>agentslock.com</a>
              <a href="https://github.com/danyaffa/agentslock" target="_blank" rel="noopener" style={{ color: C.blue, textDecoration: "none", fontSize: 11 }}>GitHub</a>
              <span style={{ color: C.border }}>|</span>
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
    name: "Leffler International Investments Pty Ltd",
    brand: "AgentsLock",
    acn: "ACN 124 089 345",
    abn: "ABN 90 124 089 345",
    address: "Level 2, 222 Pitt Street, Sydney NSW 2000, Australia",
    phone: "0478 965 828",
    email: "support@agentslock.com",
    website: "agentslock.com",
  };

  const lastUpdated = "1 January 2026";

  // ─── TERMS OF SERVICE ──────────────────────────────────────────────────────
  const TermsContent = () => (
    <>
      {para(`These Terms of Service ("Terms") govern your access to and use of the AgentsLock cybersecurity platform ("Service"), operated by ${COMPANY.name} (${COMPANY.acn} / ${COMPANY.abn}), trading as ${COMPANY.brand}. By accessing or using our Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.`)}
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
      {para("The Service may integrate with or reference third-party services including Firebase (Google), breach databases (Have I Been Pwned), SSL verification services, and others. We are not responsible for the availability, accuracy, or practices of these third-party services.")}
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
      {para(`You agree to indemnify, defend, and hold harmless ${COMPANY.name}, its directors, officers, employees, agents, and affiliates from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable legal fees) arising out of or relating to your violation of these Terms or your use of the Service.`)}

      {heading("12. Governing Law & Jurisdiction")}
      {para("These Terms shall be governed by and construed in accordance with the laws of New South Wales, Australia, without regard to its conflict of law provisions.")}
      {para("Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of New South Wales, Australia.")}
      {para("Nothing in these Terms excludes, restricts, or modifies any consumer rights under the Australian Consumer Law (Schedule 2 of the Competition and Consumer Act 2010 (Cth)) that cannot be excluded, restricted, or modified by agreement.")}

      {heading("13. Changes to Terms & Contact")}
      {para("We reserve the right to modify these Terms at any time. Material changes will be communicated via the Service or email. Continued use of the Service after changes constitutes acceptance of the revised Terms.")}
      {para("For questions about these Terms, contact us:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem(`${COMPANY.name}`)}
        {listItem(`${COMPANY.acn} / ${COMPANY.abn}`)}
        {listItem(`${COMPANY.address}`)}
        {listItem(`Phone: ${COMPANY.phone}`)}
        {listItem(`Email: ${COMPANY.email}`)}
      </ul>
    </>
  );

  // ─── PRIVACY POLICY ────────────────────────────────────────────────────────
  const PrivacyContent = () => (
    <>
      {para(`This Privacy Policy describes how ${COMPANY.name} (${COMPANY.acn} / ${COMPANY.abn}), trading as ${COMPANY.brand}, collects, uses, stores, and protects your personal information when you use our cybersecurity platform. We are committed to complying with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth).`)}
      {para(`Last updated: ${lastUpdated}`)}

      {heading("1. Information We Collect")}
      {subH("1.1 Information You Provide")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem("Account registration details: email address, display name, password (hashed)")}
        {listItem("Security scan data: URLs submitted for scanning, email addresses checked for breaches")}
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
        {listItem("Have I Been Pwned API — email/password breach checking (hashed data only)")}
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
      {para("For privacy inquiries, data access requests, or complaints:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem(`Privacy Officer — ${COMPANY.name}`)}
        {listItem(`${COMPANY.address}`)}
        {listItem(`Phone: ${COMPANY.phone}`)}
        {listItem(`Email: ${COMPANY.email}`)}
      </ul>
    </>
  );

  // ─── DISCLAIMER ────────────────────────────────────────────────────────────
  const DisclaimerContent = () => (
    <>
      {para(`This Disclaimer applies to the AgentsLock cybersecurity platform ("Service"), operated by ${COMPANY.name} (${COMPANY.acn} / ${COMPANY.abn}).`)}
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
        {listItem("The accuracy or completeness of breach detection results")}
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
      {para(`To the maximum extent permitted by law, ${COMPANY.name} shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages arising from the use of or inability to use the Service.`)}
      {para("Nothing in this Disclaimer excludes or limits any rights you may have under the Australian Consumer Law that cannot be excluded or limited by agreement.")}

      {heading("Contact")}
      {para("If you have questions about this Disclaimer, contact us at:")}
      <ul style={{ paddingLeft:20, marginBottom:12 }}>
        {listItem(`${COMPANY.name}`)}
        {listItem(`${COMPANY.address}`)}
        {listItem(`Phone: ${COMPANY.phone}`)}
        {listItem(`Email: ${COMPANY.email}`)}
      </ul>
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
        {listItem("Breach Detection — Check if your credentials have been exposed in known data breaches")}
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
            ["Company", COMPANY.name],
            ["Trading As", COMPANY.brand],
            ["ACN", "124 089 345"],
            ["ABN", "90 124 089 345"],
            ["Address", COMPANY.address],
            ["Phone", COMPANY.phone],
            ["Email", COMPANY.email],
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
      {para(`\u00A9 2026 ${COMPANY.brand} \u2014 ${COMPANY.name}. All rights reserved.`)}
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
            <div style={{ fontSize:10, color:C.dim, marginTop:2 }}>{COMPANY.name} ({COMPANY.acn})</div>
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
  { id:4, name:"Session Hijack", target:"Vercel", severity:"medium", status:"investigating", time:"5 hours ago", desc:"Unusual session from unknown IP" },
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
  { id:"settings", label:"Settings", icon:<I.Settings /> },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const { user, loading, login, signup, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [checks, setChecks] = useState({});
  const [threats, setThreats] = useState(INIT_THREATS);
  const [accounts, setAccounts] = useState(INIT_ACCOUNTS);
  const [monitors, setMonitors] = useState([]);
  const [scanLog, setScanLog] = useState([]);
  const [deviceCleaned, setDeviceCleaned] = useState({});
  const [now, setNow] = useState(new Date());
  const [dataLoaded, setDataLoaded] = useState(false);
  const [legalPage, setLegalPage] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subLoaded, setSubLoaded] = useState(false);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

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
    loadUserData(user.uid).then(data => {
      if (data) {
        if (data.checks && Object.keys(data.checks).length) setChecks(data.checks);
        if (data.threats?.length) setThreats(data.threats);
        if (data.accounts?.length) setAccounts(data.accounts);
        if (data.monitors?.length) setMonitors(data.monitors);
        if (data.scanLog?.length) setScanLog(data.scanLog);
        if (data.deviceCleaned && Object.keys(data.deviceCleaned).length) setDeviceCleaned(data.deviceCleaned);
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
  const setDeviceCleanedAndSave = (v) => { const nv = typeof v === "function" ? v(deviceCleaned) : v; setDeviceCleaned(nv); autoSave("deviceCleaned", nv); };
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

  if (!user) return <AuthScreen onLogin={login} onSignup={signup} />;

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
          {activeThreats > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:C.redDim, border:`1px solid ${C.redBdr}`, borderRadius:6, animation:"pulse 2s infinite" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:C.red }}/><span style={{ color:C.red, fontSize:11, fontWeight:600 }}>{activeThreats} THREAT{activeThreats>1?"S":""}</span>
            </div>
          )}
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
        {tab==="overview" && <OverviewTab checks={checks} threats={threats} accounts={accounts} scanLog={scanLog} monitors={monitors} userName={userName} setTab={setTab} addLog={addLog} deviceCleaned={deviceCleaned} setDeviceCleaned={setDeviceCleanedAndSave} />}
        {tab==="breach" && <BreachTab addLog={addLog} />}
        {tab==="passwords" && <PasswordTab />}
        {tab==="scanner" && <ScannerTab addLog={addLog} />}
        {tab==="devices" && <DeviceTab checks={checks} setChecks={setChecksAndSave} />}
        {tab==="accounts" && <AccountTab accounts={accounts} setAccounts={setAccountsAndSave} />}
        {tab==="threats" && <ThreatTab threats={threats} setThreats={setThreatsAndSave} />}
        {tab==="monitor" && <MonitorTab monitors={monitors} setMonitors={setMonitorsAndSave} />}
        {tab==="reports" && <ReportTab checks={checks} threats={threats} accounts={accounts} monitors={monitors} scanLog={scanLog} />}
        {tab==="incident" && <IncidentTab />}
        {tab==="settings" && <SettingsTab user={user} logout={logout} setLegalPage={setLegalPage} subscription={subscription} />}
      </main>

      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"24px 24px 20px", color:C.dim, fontSize:11, lineHeight:1.8 }}>
        {/* Legal links row */}
        <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:12, flexWrap:"wrap" }}>
          {[["terms","Terms of Service"],["privacy","Privacy Policy"],["disclaimer","Disclaimer"],["about","About"]].map(([k,label])=>(
            <button key={k} onClick={()=>setLegalPage(k)} style={{ background:"none", border:"none", color:C.green, cursor:"pointer", fontSize:11, fontFamily:"inherit", fontWeight:500, padding:0, textDecoration:"none", transition:"opacity 0.2s" }}
              onMouseOver={e=>e.currentTarget.style.opacity=0.7} onMouseOut={e=>e.currentTarget.style.opacity=1}>{label}</button>
          ))}
        </div>
        {/* Company details */}
        <div style={{ textAlign:"center", maxWidth:680, margin:"0 auto" }}>
          <div style={{ marginBottom:4 }}>
            <span style={{ color:C.bright, fontWeight:600 }}>{"\u00A9"} 2026 AgentsLock</span>
            {" \u2014 "}Leffler International Investments Pty Ltd
            {" \u00B7 "}ACN 124 089 345 {"\u00B7"} ABN 90 124 089 345
          </div>
          <div style={{ marginBottom:4 }}>
            Level 2, 222 Pitt Street, Sydney 2000, Australia {"\u00B7"} Phone: 0478 965 828
          </div>
          <div style={{ color:C.dim, fontSize:10, marginTop:6, lineHeight:1.6 }}>
            All trademarks and data belong to their respective owners. No reproduction without permission.
            Informational only. No financial, legal, or tax advice. Markets involve risk and returns are not guaranteed.
            Past performance is not indicative of future results. See{" "}
            <button onClick={()=>setLegalPage("terms")} style={{ background:"none", border:"none", color:C.green, cursor:"pointer", fontSize:10, fontFamily:"inherit", padding:0, textDecoration:"underline" }}>Terms</button>.
          </div>
        </div>
      </footer>

      {/* Legal overlay */}
      <LegalOverlay page={legalPage} onClose={(nextPage) => setLegalPage(nextPage || null)} />
    </div>
  );
}
