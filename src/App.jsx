import { useState, useEffect, useCallback, useRef } from "react";
import { auth, db, signUp, logIn, logOut, onAuth, loadUserData, saveUserData } from "../firebase.js";

// ═══════════════════════════════════════════════════════════════════════════════
// AGENTSLOCK v4.0 — Full-Stack Personal Cybersecurity Platform
// Firebase Auth + Firestore | Real-Time Monitoring | PWA
// ═══════════════════════════════════════════════════════════════════════════════

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
  LogIn: icon(<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></>),
  LogOut: icon(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>),
  Settings: icon(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
  Map: icon(<><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>),
  Cpu: icon(<><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></>),
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
// TAB 1: OVERVIEW DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ checks, threats, accounts, scanLog, monitors, userName }) {
  const totalChecks = Object.values(DEVICE_CHECKS).flat().length;
  const doneChecks = Object.keys(checks).filter(k => checks[k]).length;
  const score = totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;
  const activeThreats = threats.filter(t => t.status === "active").length;
  const highRisk = accounts.filter(a => a.risk === "high").length;
  const onlineMonitors = monitors.filter(m => m.status === "up").length;

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
                      <span style={{ color: C.dim, fontSize: 11 }}>→ {t.target}</span>
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
          {scanLog.length === 0 ? <div style={{ textAlign: "center", padding: 20, color: C.dim, fontSize: 12 }}>No scans yet — try Breach Check or Web Scanner</div> : (
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
const DEVICE_META = { windows: { name:"Windows", icon:<I.Monitor/> }, android: { name:"Android", icon:<I.Phone/> }, browser: { name:"Browsers", icon:<I.Globe/> }, network: { name:"Network", icon:<I.Wifi/> }, developer: { name:"Developer", icon:<I.Terminal/> } };

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
function SettingsTab({ user, logout }) {
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
        <Sect title="About" icon={<I.Shield />}>
          <div style={{ color: C.text, fontSize: 12 }}>
            <div style={{ marginBottom: 4 }}><span style={{ color: C.bright, fontWeight: 600 }}>AgentsLock v4.0</span> — Firebase-Secured Cybersecurity Platform</div>
            <div style={{ color: C.dim }}>React + Vite + Firebase Auth + Firestore. Real-time cloud sync. PWA enabled.</div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <a href="https://agentslock.com" target="_blank" rel="noopener" style={{ color: C.green, textDecoration: "none", fontSize: 11 }}>agentslock.com</a>
              <a href="https://github.com/danyaffa/agentslock" target="_blank" rel="noopener" style={{ color: C.blue, textDecoration: "none", fontSize: 11 }}>GitHub</a>
            </div>
          </div>
        </Sect>
      </Card>
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
  const [now, setNow] = useState(new Date());
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

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

  // Loading screen
  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${C.border}`, borderTopColor: C.green, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: C.dim, fontSize: 13 }}>Loading AgentsLock...</div>
      </div>
    </div>
  );

  if (!user) return <AuthScreen onLogin={login} onSignup={signup} />;

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
        {tab==="overview" && <OverviewTab checks={checks} threats={threats} accounts={accounts} scanLog={scanLog} monitors={monitors} userName={userName} />}
        {tab==="breach" && <BreachTab addLog={addLog} />}
        {tab==="passwords" && <PasswordTab />}
        {tab==="scanner" && <ScannerTab addLog={addLog} />}
        {tab==="devices" && <DeviceTab checks={checks} setChecks={setChecksAndSave} />}
        {tab==="accounts" && <AccountTab accounts={accounts} setAccounts={setAccountsAndSave} />}
        {tab==="threats" && <ThreatTab threats={threats} setThreats={setThreatsAndSave} />}
        {tab==="monitor" && <MonitorTab monitors={monitors} setMonitors={setMonitorsAndSave} />}
        {tab==="reports" && <ReportTab checks={checks} threats={threats} accounts={accounts} monitors={monitors} scanLog={scanLog} />}
        {tab==="incident" && <IncidentTab />}
        {tab==="settings" && <SettingsTab user={user} logout={logout} />}
      </main>

      <footer style={{ textAlign:"center", padding:"20px 24px", borderTop:`1px solid ${C.border}`, color:C.dim, fontSize:11 }}>
        AgentsLock v4.0 — <a href="https://agentslock.com" style={{ color:C.green, textDecoration:"none" }}>agentslock.com</a> — Firebase Secured
      </footer>
    </div>
  );
}
