import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// AGENTSLOCK — Full-Featured Personal Cybersecurity Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const icon = (d, s = 18) => (p) => (
  <svg width={p?.s || s} height={p?.s || s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {d}
  </svg>
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
  Settings: icon(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
  Copy: icon(<><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>, 16),
  Clock: icon(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, 14),
  Activity: icon(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />),
  FileText: icon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>),
  ExternalLink: icon(<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>, 14),
  Trash: icon(<><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>, 16),
  ChevRight: icon(<polyline points="9 18 15 12 9 6" />, 14),
  ChevDown: icon(<polyline points="6 9 12 15 18 9" />, 14),
  Plus: icon(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>, 16),
  Server: icon(<><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></>),
  Download: icon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>),
  Crosshair: icon(<><circle cx="12" cy="12" r="10" /><line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" /><line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" /></>),
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
  purple: "#a855f7", purpleDim: "#a855f718",
  cyan: "#06b6d4", cyanDim: "#06b6d418",
};
const sevColor = (s) => ({ critical: C.red, high: C.red, medium: C.orange, low: C.green }[s] || C.dim);

// ─── Crypto Utils ────────────────────────────────────────────────────────────
async function sha1(str) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function calcPwStrength(pw) {
  if (!pw) return { score: 0, label: "Empty", color: C.dim, entropy: 0, crack: "—", issues: [] };
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  const entropy = Math.round(pw.length * Math.log2(pool || 1));
  const issues = [];
  if (pw.length < 8) issues.push("Too short (min 8)");
  if (pw.length < 12) issues.push("Use 12+ characters");
  if (!/[A-Z]/.test(pw)) issues.push("Add uppercase");
  if (!/[a-z]/.test(pw)) issues.push("Add lowercase");
  if (!/[0-9]/.test(pw)) issues.push("Add numbers");
  if (!/[^a-zA-Z0-9]/.test(pw)) issues.push("Add symbols");
  if (/(.)\1{2,}/.test(pw)) issues.push("Avoid repeats");
  const common = ["password", "123456", "12345678", "qwerty", "abc123", "admin", "letmein", "welcome"];
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
  if (secs > 3.154e13) crack = "Millions of years";
  else if (secs > 3.154e10) crack = "Thousands of years";
  else if (secs > 3.154e9) crack = "Centuries";
  else if (secs > 3.154e7) crack = Math.round(secs / 3.154e7) + " years";
  else if (secs > 86400) crack = Math.round(secs / 86400) + " days";
  else if (secs > 3600) crack = Math.round(secs / 3600) + " hours";
  else if (secs > 60) crack = Math.round(secs / 60) + " min";
  else if (secs > 1) crack = Math.round(secs) + " sec";
  return { score, label, color, entropy, crack, issues };
}

function genPassword(len = 20, opts = {}) {
  const { upper = true, lower = true, nums = true, syms = true } = opts;
  let chars = "";
  if (lower) chars += "abcdefghijkmnopqrstuvwxyz";
  if (upper) chars += "ABCDEFGHJKLMNPQRSTUVWXYZ";
  if (nums) chars += "23456789";
  if (syms) chars += "!@#$%^&*_+-=?";
  if (!chars) chars = "abcdefghijkmnopqrstuvwxyz";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, v => chars[v % chars.length]).join("");
}

// ─── Shared UI Components ────────────────────────────────────────────────────
const Card = ({ children, style, glow, onClick }) => (
  <div onClick={onClick} style={{
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20,
    ...(glow ? { boxShadow: `0 0 25px ${glow}10`, borderColor: `${glow}30` } : {}),
    ...(onClick ? { cursor: "pointer", transition: "border-color 0.2s" } : {}), ...style,
  }}>{children}</div>
);
const Badge = ({ children, color, style }) => (
  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", background: `${color}18`, color, ...style }}>{children}</span>
);
const Btn = ({ children, onClick, color = C.green, disabled, style }) => (
  <button disabled={disabled} onClick={onClick} style={{
    background: `${color}15`, border: `1px solid ${color}40`, color,
    padding: "8px 16px", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 12, fontFamily: "inherit", fontWeight: 600, opacity: disabled ? 0.5 : 1,
    display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.2s", ...style,
  }}>{children}</button>
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
        <h3 style={{ margin: 0, fontFamily: "'Chakra Petch', sans-serif", fontSize: 15, fontWeight: 600, color: C.bright, letterSpacing: "-0.01em" }}>{title}</h3>
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
// TAB 1: OVERVIEW DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ checks, threats, accounts, scanLog }) {
  const totalChecks = Object.values(DEVICE_CHECKS).flat().length;
  const doneChecks = Object.keys(checks).filter(k => checks[k]).length;
  const score = totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;
  const activeThreats = threats.filter(t => t.status === "active").length;
  const highRiskAcct = accounts.filter(a => a.risk === "high").length;
  const now = new Date();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <Card glow={score >= 80 ? C.green : score >= 50 ? C.orange : C.red}>
          <div style={{ textAlign: "center" }}>
            <svg width="100" height="100" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke={C.border} strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={score >= 80 ? C.green : score >= 50 ? C.orange : C.red}
                strokeWidth="8" strokeDasharray={`${score * 3.267} 326.7`} strokeLinecap="round"
                transform="rotate(-90 60 60)" style={{ transition: "stroke-dasharray 1s ease" }} />
              <text x="60" y="55" textAnchor="middle" fill={C.bright} fontSize="28" fontWeight="700" fontFamily="'Chakra Petch', sans-serif">{score}</text>
              <text x="60" y="72" textAnchor="middle" fill={C.dim} fontSize="8" textTransform="uppercase" letterSpacing="0.1em">SECURITY</text>
            </svg>
            <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{doneChecks}/{totalChecks} hardening tasks</div>
          </div>
        </Card>
        <Stat label="Active Threats" value={activeThreats} color={activeThreats > 0 ? C.red : C.green} sub={`${threats.filter(t => t.status === "blocked").length} blocked`} />
        <Stat label="Devices Monitored" value="4" color={C.bright} sub="2 fully hardened" />
        <Stat label="Accounts" value={accounts.length} color={C.bright} sub={highRiskAcct > 0 ? `${highRiskAcct} high risk` : "All secured"} />
      </div>

      <Card>
        <Sect title="Recent Threat Activity" icon={<I.Alert />}>
          {threats.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: C.dim }}>No threats detected — all clear</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {threats.slice(0, 5).map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: C.bg, borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: sevColor(t.severity) }} />
                    <span style={{ color: C.bright, fontWeight: 600, fontSize: 13 }}>{t.name}</span>
                    <span style={{ color: C.dim, fontSize: 11 }}>→ {t.target}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: C.dim, fontSize: 11 }}>{t.time}</span>
                    <Badge color={t.status === "active" ? C.red : t.status === "blocked" ? C.green : C.orange}>
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Sect>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <Sect title="Quick Actions" icon={<I.Zap />}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Check Email Breach", icon: <I.Mail />, color: C.blue },
                { label: "Audit Passwords", icon: <I.Key />, color: C.purple },
                { label: "Scan Website", icon: <I.Globe />, color: C.green },
                { label: "Review Devices", icon: <I.Monitor />, color: C.orange },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: C.bg, borderRadius: 8, cursor: "pointer", border: `1px solid ${C.border}` }}>
                  <span style={{ color: a.color }}>{a.icon}</span>
                  <span style={{ color: C.text, fontSize: 11 }}>{a.label}</span>
                </div>
              ))}
            </div>
          </Sect>
        </Card>
        <Card>
          <Sect title="Scan History" icon={<I.Clock />}>
            {scanLog.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: C.dim, fontSize: 12 }}>No scans yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {scanLog.slice(0, 5).map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: C.bg, borderRadius: 6, fontSize: 11 }}>
                    <span style={{ color: C.text }}>{s.type}: {s.target}</span>
                    <Badge color={s.safe ? C.green : C.red}>{s.safe ? "SAFE" : "RISK"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Sect>
        </Card>
      </div>
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
    if (!email) return;
    setLoading("email"); setEmailRes(null);
    try {
      const r = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, { headers: { "hibp-api-key": "", "User-Agent": "AgentsLock" } });
      if (r.status === 404) { setEmailRes({ safe: true }); addLog({ type: "Breach", target: email, safe: true }); }
      else if (r.status === 401 || r.status === 403) { setEmailRes({ needsKey: true }); }
      else { const d = await r.json(); setEmailRes({ safe: false, breaches: d }); addLog({ type: "Breach", target: email, safe: false }); }
    } catch { setEmailRes({ needsKey: true }); }
    setLoading("");
  };

  const checkPw = async () => {
    if (!pw) return;
    setLoading("pw"); setPwRes(null);
    try {
      const hash = await sha1(pw);
      const prefix = hash.slice(0, 5), suffix = hash.slice(5);
      const r = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await r.text();
      const match = text.split("\n").find(l => l.startsWith(suffix));
      const count = match ? parseInt(match.split(":")[1]) : 0;
      setPwRes({ count, safe: count === 0 });
      addLog({ type: "PwCheck", target: "••••••••", safe: count === 0 });
    } catch { setPwRes({ error: true }); }
    setLoading("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card glow={C.blue}>
        <Sect title="Email Breach Check" icon={<I.Mail />}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <Input value={email} onChange={setEmail} placeholder="Enter email to check..." icon={<I.Mail />} style={{ flex: 1 }} />
            <Btn onClick={checkEmail} disabled={loading === "email"} color={C.blue}>{loading === "email" ? "Checking..." : "Check Breaches"}</Btn>
          </div>
          {emailRes && (
            <div style={{ padding: 14, borderRadius: 8, background: emailRes.needsKey ? C.blueDim : emailRes.safe ? C.greenDim : C.redDim, border: `1px solid ${emailRes.needsKey ? C.blueBdr : emailRes.safe ? C.greenBdr : C.redBdr}` }}>
              {emailRes.needsKey ? (
                <div><div style={{ color: C.blue, fontWeight: 600, marginBottom: 4 }}>ℹ️ API Key Required</div>
                  <div style={{ color: C.text, fontSize: 12 }}>Email breach checking requires a HaveIBeenPwned API key ($3.50/mo). Get one at <a href="https://haveibeenpwned.com/API/Key" target="_blank" rel="noopener" style={{ color: C.blue }}>haveibeenpwned.com/API/Key</a>. Password checking below works free!</div>
                </div>
              ) : emailRes.safe ? (
                <div style={{ color: C.green, fontWeight: 600 }}>✅ No breaches found for this email</div>
              ) : (
                <div><div style={{ color: C.red, fontWeight: 600, marginBottom: 8 }}>🔴 Found in {emailRes.breaches.length} breach(es)!</div>
                  {emailRes.breaches.slice(0, 8).map((b, i) => (
                    <div key={i} style={{ padding: "6px 10px", background: C.bg, borderRadius: 6, fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: C.bright, fontWeight: 600 }}>{b.Name}</span>
                      <span style={{ color: C.dim, marginLeft: 8 }}>{b.BreachDate} — {b.DataClasses?.slice(0, 3).join(", ")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Sect>
      </Card>

      <Card glow={C.purple}>
        <Sect title="Password Breach Check" icon={<I.Key />}>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>Uses k-anonymity — your full password never leaves your browser.</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <Input value={pw} onChange={setPw} placeholder="Enter password to check..." type="password" icon={<I.Lock />} style={{ flex: 1 }} />
            <Btn onClick={checkPw} disabled={loading === "pw"} color={C.purple}>{loading === "pw" ? "Checking..." : "Check Password"}</Btn>
          </div>
          {pwRes && (
            <div style={{ padding: 14, borderRadius: 8, background: pwRes.safe ? C.greenDim : C.redDim, border: `1px solid ${pwRes.safe ? C.greenBdr : C.redBdr}` }}>
              {pwRes.error ? <div style={{ color: C.orange }}>⚠️ Error — try again</div>
                : pwRes.safe ? <div style={{ color: C.green, fontWeight: 600 }}>✅ Not found in any known breaches</div>
                : <div><div style={{ color: C.red, fontWeight: 600 }}>🔴 Seen {pwRes.count.toLocaleString()} times in breaches!</div><div style={{ color: C.text, fontSize: 12, marginTop: 4 }}>Change this password immediately everywhere it's used.</div></div>}
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
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [genLen, setGenLen] = useState(20);
  const [genOpts, setGenOpts] = useState({ upper: true, lower: true, nums: true, syms: true });
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);
  const str = calcPwStrength(pw);

  const doGen = () => { setGenerated(genPassword(genLen, genOpts)); setCopied(false); };
  const doCopy = () => { navigator.clipboard.writeText(generated); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  useEffect(() => { doGen(); }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card glow={pw ? str.color : undefined}>
        <Sect title="Password Strength Analyzer" icon={<I.Shield />}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Input value={pw} onChange={setPw} placeholder="Type or paste a password..." type={showPw ? "text" : "password"} icon={<I.Lock />} />
            <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.dim }}>
              {showPw ? <I.EyeOff /> : <I.Eye />}
            </button>
          </div>
          {pw && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: str.color, fontWeight: 700 }}>{str.label}</span>
                <span style={{ color: C.dim, fontSize: 11 }}>Entropy: {str.entropy} bits</span>
              </div>
              <Progress value={str.score} color={str.color} h={8} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                <div style={{ padding: "8px 12px", background: C.bg, borderRadius: 6 }}>
                  <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase" }}>Crack Time</div>
                  <div style={{ color: str.color, fontWeight: 600, marginTop: 2 }}>{str.crack}</div>
                </div>
                <div style={{ padding: "8px 12px", background: C.bg, borderRadius: 6 }}>
                  <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase" }}>Length</div>
                  <div style={{ color: C.bright, fontWeight: 600, marginTop: 2 }}>{pw.length} chars</div>
                </div>
              </div>
              {str.issues.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>Issues</div>
                  {str.issues.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontSize: 12, color: C.orange }}><I.Alert s={12} /> {s}</div>
                  ))}
                </div>
              )}
            </>
          )}
        </Sect>
      </Card>

      <Card glow={C.cyan}>
        <Sect title="Secure Password Generator" icon={<I.Zap />}>
          <div style={{ padding: 14, background: C.bg, borderRadius: 8, marginBottom: 14, fontFamily: "'Fira Code', monospace", fontSize: 14, color: C.bright, wordBreak: "break-all", minHeight: 48, display: "flex", alignItems: "center" }}>
            {generated || "Click Generate"}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <Btn onClick={doGen} color={C.cyan}><I.Refresh /> Generate</Btn>
            <Btn onClick={doCopy} color={copied ? C.green : C.blue}><I.Copy /> {copied ? "Copied!" : "Copy"}</Btn>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.dim, marginBottom: 4 }}><span>Length</span><span style={{ color: C.cyan, fontWeight: 600 }}>{genLen}</span></div>
            <input type="range" min="8" max="64" value={genLen} onChange={e => setGenLen(+e.target.value)} style={{ width: "100%", accentColor: C.cyan }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[["upper", "Uppercase A-Z"], ["lower", "Lowercase a-z"], ["nums", "Numbers 0-9"], ["syms", "Symbols !@#"]].map(([k, l]) => (
              <label key={k} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: C.bg, borderRadius: 6, cursor: "pointer", fontSize: 11, color: genOpts[k] ? C.bright : C.dim }}>
                <input type="checkbox" checked={genOpts[k]} onChange={() => setGenOpts({ ...genOpts, [k]: !genOpts[k] })} style={{ accentColor: C.cyan }} /> {l}
              </label>
            ))}
          </div>
          {generated && (() => { const g = calcPwStrength(generated); return (
            <div style={{ marginTop: 12, padding: "8px 12px", background: C.bg, borderRadius: 6 }}>
              <Progress value={g.score} color={g.color} />
              <div style={{ fontSize: 11, color: g.color, fontWeight: 600, marginTop: 4 }}>{g.label} — {g.crack}</div>
            </div>
          ); })()}
        </Sect>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: WEBSITE SCANNER
// ═══════════════════════════════════════════════════════════════════════════════
const SEC_HEADERS = [
  { name: "Content-Security-Policy", sev: "critical", desc: "Prevents XSS & injection", rec: "default-src 'self'; script-src 'self'" },
  { name: "Strict-Transport-Security", sev: "critical", desc: "Forces HTTPS", rec: "max-age=31536000; includeSubDomains; preload" },
  { name: "X-Content-Type-Options", sev: "medium", desc: "Prevents MIME sniffing", rec: "nosniff" },
  { name: "X-Frame-Options", sev: "medium", desc: "Prevents clickjacking", rec: "DENY" },
  { name: "Referrer-Policy", sev: "medium", desc: "Controls referrer info", rec: "strict-origin-when-cross-origin" },
  { name: "Permissions-Policy", sev: "medium", desc: "Controls browser features", rec: "camera=(), microphone=(), geolocation=()" },
  { name: "Cross-Origin-Opener-Policy", sev: "low", desc: "Isolates browsing context", rec: "same-origin" },
  { name: "Cross-Origin-Resource-Policy", sev: "low", desc: "Controls cross-origin loading", rec: "same-origin" },
];

function ScannerTab({ addLog }) {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const scan = async () => {
    if (!url) return;
    let target = url.trim();
    if (!target.startsWith("http")) target = "https://" + target;
    setScanning(true); setResult(null);
    try {
      const hostname = new URL(target).hostname;
      let sslGrade = "—";
      try {
        const r = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${hostname}&fromCache=on&maxAge=24`);
        if (r.ok) { const d = await r.json(); sslGrade = d.endpoints?.[0]?.grade || d.status || "Pending"; }
      } catch {}
      setResult({ url: target, hostname, sslGrade, headers: SEC_HEADERS, time: new Date() });
      addLog({ type: "WebScan", target: hostname, safe: sslGrade === "A+" || sslGrade === "A" });
    } catch (e) { setResult({ error: e.message }); }
    setScanning(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <Sect title="Website Security Scanner" icon={<I.Globe />}>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>Analyzes SSL/TLS, security headers, and provides hardening recommendations.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Input value={url} onChange={setUrl} placeholder="Enter URL (e.g., example.com)" icon={<I.Search />} style={{ flex: 1 }} />
            <Btn onClick={scan} disabled={scanning}>{scanning ? "Scanning..." : "Scan"}</Btn>
          </div>
        </Sect>
      </Card>

      {result && !result.error && (
        <>
          <Card glow={C.green}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div style={{ padding: 14, background: C.bg, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>SSL Grade</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: result.sslGrade?.startsWith("A") ? C.green : result.sslGrade === "B" ? C.orange : C.text }}>{result.sslGrade}</div>
              </div>
              <div style={{ padding: 14, background: C.bg, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>Host</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.bright }}>{result.hostname}</div>
              </div>
              <div style={{ padding: 14, background: C.bg, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>Headers to Add</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: C.orange }}>{SEC_HEADERS.length}</div>
              </div>
            </div>
          </Card>
          <Card>
            <Sect title="Recommended Security Headers" icon={<I.FileText />}>
              {result.headers.map((h, i) => (
                <div key={i} style={{ padding: "10px 14px", background: C.bg, borderRadius: 8, marginBottom: 6, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: C.bright, fontWeight: 600, fontSize: 12 }}>{h.name}</span>
                    <Badge color={sevColor(h.sev)}>{h.sev}</Badge>
                  </div>
                  <div style={{ fontSize: 11, color: C.dim }}>{h.desc}</div>
                  <div style={{ fontSize: 10, color: C.cyan, fontFamily: "'Fira Code', monospace", marginTop: 4, padding: "4px 8px", background: `${C.cyan}08`, borderRadius: 4 }}>
                    {h.name}: {h.rec}
                  </div>
                </div>
              ))}
            </Sect>
          </Card>
        </>
      )}
      {result?.error && <Card glow={C.red}><div style={{ color: C.red }}>Error: {result.error}</div></Card>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5: DEVICE HARDENING
// ═══════════════════════════════════════════════════════════════════════════════
const DEVICE_CHECKS = {
  windows: [
    { id: "w1", text: "Enable BitLocker full-disk encryption", sev: "critical", cmd: "manage-bde -on C: -RecoveryPassword", guide: "Settings → Privacy & Security → Device encryption" },
    { id: "w2", text: "Enable Windows Defender real-time protection", sev: "critical", cmd: "Set-MpPreference -DisableRealtimeMonitoring $false", guide: "Windows Security → Virus & threat protection" },
    { id: "w3", text: "Enable Windows Firewall on all profiles", sev: "critical", cmd: "Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True", guide: "Windows Security → Firewall & network protection" },
    { id: "w4", text: "Disable Remote Desktop if not needed", sev: "high", cmd: "Set-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' -Name fDenyTSConnections -Value 1", guide: "Settings → System → Remote Desktop → Off" },
    { id: "w5", text: "Enable automatic Windows updates", sev: "critical", guide: "Settings → Windows Update → Advanced options" },
    { id: "w6", text: "Disable SMBv1 protocol", sev: "high", cmd: "Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol", guide: "Turn Windows features on/off → uncheck SMB 1.0" },
    { id: "w7", text: "Enable Controlled Folder Access (ransomware)", sev: "medium", cmd: "Set-MpPreference -EnableControlledFolderAccess Enabled", guide: "Windows Security → Ransomware protection" },
    { id: "w8", text: "Account lockout after 5 failed attempts", sev: "medium", cmd: "net accounts /lockoutthreshold:5 /lockoutduration:30", guide: "Local Security Policy → Account Lockout" },
    { id: "w9", text: "Disable autorun for all drives", sev: "medium", guide: "Group Policy → AutoPlay Policies → Disable" },
    { id: "w10", text: "Enable Secure Boot in BIOS/UEFI", sev: "critical", guide: "Restart → BIOS → Security → Secure Boot → Enable" },
    { id: "w11", text: "Remove unknown startup programs", sev: "medium", cmd: "Get-CimInstance Win32_StartupCommand | Select Name, Command", guide: "Task Manager → Startup → Disable suspicious" },
    { id: "w12", text: "Enable credential guard", sev: "high", guide: "Group Policy → Device Guard → Enable Credential Guard" },
  ],
  android: [
    { id: "a1", text: "Enable biometric lock + 6-digit PIN", sev: "critical", guide: "Settings → Security → Screen lock" },
    { id: "a2", text: "Enable Find My Device", sev: "critical", guide: "Settings → Security → Find My Device" },
    { id: "a3", text: "Encrypt device storage", sev: "critical", guide: "Settings → Security → Encryption" },
    { id: "a4", text: "Disable install from unknown sources", sev: "critical", guide: "Settings → Security → Install unknown apps → All OFF" },
    { id: "a5", text: "Enable Google Play Protect", sev: "high", guide: "Play Store → Profile → Play Protect" },
    { id: "a6", text: "Review all app permissions", sev: "high", guide: "Settings → Privacy → Permission manager" },
    { id: "a7", text: "Disable USB debugging", sev: "high", guide: "Settings → Developer options → USB debugging → Off" },
    { id: "a8", text: "Enable automatic system updates", sev: "critical", guide: "Settings → System → System update" },
    { id: "a9", text: "Use Private DNS (dns.google)", sev: "medium", guide: "Settings → Network → Private DNS" },
    { id: "a10", text: "Disable NFC when not in use", sev: "low", guide: "Settings → Connected devices → NFC" },
    { id: "a11", text: "Remove unused apps", sev: "medium", guide: "Settings → Apps → Sort by last used" },
    { id: "a12", text: "Enable SIM card lock PIN", sev: "medium", guide: "Settings → Security → SIM card lock" },
  ],
  browser: [
    { id: "b1", text: "Enable HTTPS-Only mode", sev: "critical", guide: "Settings → Security → Always use secure connections" },
    { id: "b2", text: "Install uBlock Origin", sev: "high", guide: "Chrome Web Store → uBlock Origin" },
    { id: "b3", text: "Block third-party cookies", sev: "high", guide: "Settings → Privacy → Cookies → Block third-party" },
    { id: "b4", text: "Enable Enhanced Safe Browsing", sev: "critical", guide: "Settings → Security → Safe Browsing → Enhanced" },
    { id: "b5", text: "Remove unused extensions", sev: "high", guide: "chrome://extensions → Remove suspicious" },
    { id: "b6", text: "Use password manager instead of browser autofill", sev: "medium", guide: "Use Bitwarden/1Password instead" },
    { id: "b7", text: "Clear saved passwords from browser", sev: "high", guide: "Settings → Passwords → Remove all" },
    { id: "b8", text: "Enable DNS-over-HTTPS", sev: "medium", guide: "Settings → Security → Secure DNS → Cloudflare" },
    { id: "b9", text: "Block WebRTC leaks", sev: "medium", guide: "Install WebRTC Leak Prevent extension" },
    { id: "b10", text: "Review site permissions (cam, mic, location)", sev: "medium", guide: "Settings → Privacy → Site Settings" },
  ],
  network: [
    { id: "n1", text: "Change default router admin password", sev: "critical", guide: "192.168.1.1 → Admin → Change password" },
    { id: "n2", text: "Enable WPA3 (or WPA2-AES minimum)", sev: "critical", guide: "Router admin → Wireless → Security → WPA3" },
    { id: "n3", text: "Disable WPS", sev: "high", guide: "Router admin → Wireless → WPS → Disable" },
    { id: "n4", text: "Update router firmware", sev: "critical", guide: "Router admin → System → Firmware Update" },
    { id: "n5", text: "Change default SSID", sev: "medium", guide: "Don't include router brand or personal info" },
    { id: "n6", text: "Enable router firewall", sev: "high", guide: "Router admin → Security → Firewall → Enable" },
    { id: "n7", text: "Disable remote management", sev: "high", guide: "Router admin → Admin → Remote Management → Off" },
    { id: "n8", text: "Set up guest network for IoT", sev: "medium", guide: "Router admin → Wireless → Guest Network" },
    { id: "n9", text: "Use DNS 1.1.1.1 / 8.8.8.8", sev: "medium", guide: "Router admin → Network → DNS → 1.1.1.1" },
    { id: "n10", text: "Disable UPnP", sev: "high", guide: "Router admin → NAT → UPnP → Disable" },
  ],
  developer: [
    { id: "d1", text: "Store secrets in environment variables only", sev: "critical", cmd: "echo '.env*' >> .gitignore", guide: "Never hardcode secrets" },
    { id: "d2", text: "Enable GitHub secret scanning", sev: "critical", guide: "GitHub → Settings → Security → Secret scanning" },
    { id: "d3", text: "Enable Dependabot alerts", sev: "high", guide: "GitHub → Settings → Security → Dependabot" },
    { id: "d4", text: "Restrict API key scopes", sev: "critical", guide: "Review each key — minimum required permissions" },
    { id: "d5", text: "Enable branch protection on main", sev: "high", guide: "GitHub → Settings → Branches → Add rule" },
    { id: "d6", text: "Use SSH keys (ed25519)", sev: "medium", cmd: "ssh-keygen -t ed25519 -C 'you@email.com'", guide: "Add to GitHub → Settings → SSH keys" },
    { id: "d7", text: "Audit npm dependencies", sev: "high", cmd: "npm audit && npm audit fix", guide: "Run before every deployment" },
    { id: "d8", text: "2FA on GitHub, Vercel, AWS", sev: "critical", guide: "Use authenticator app, not SMS" },
    { id: "d9", text: "Rotate API keys quarterly", sev: "medium", guide: "Calendar reminder every 90 days" },
    { id: "d10", text: "Use Vercel env vars for secrets", sev: "critical", guide: "Vercel → Project → Settings → Env Variables" },
    { id: "d11", text: "Enable AWS CloudTrail", sev: "high", guide: "AWS → CloudTrail → Create trail → All regions" },
    { id: "d12", text: "Never commit .env files", sev: "critical", cmd: "git rm --cached .env 2>/dev/null; echo '.env' >> .gitignore", guide: "Verify with: git status" },
  ],
};

const DEVICE_META = {
  windows: { name: "Windows", icon: <I.Monitor /> },
  android: { name: "Android", icon: <I.Phone /> },
  browser: { name: "Browsers", icon: <I.Globe /> },
  network: { name: "Network", icon: <I.Wifi /> },
  developer: { name: "Developer", icon: <I.Terminal /> },
};

function DeviceTab({ checks, setChecks }) {
  const [active, setActive] = useState("windows");
  const items = DEVICE_CHECKS[active];
  const done = items.filter(c => checks[c.id]).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
        {Object.entries(DEVICE_META).map(([k, m]) => {
          const d = DEVICE_CHECKS[k].filter(c => checks[c.id]).length;
          const t = DEVICE_CHECKS[k].length;
          return (
            <Card key={k} onClick={() => setActive(k)} style={{
              minWidth: 120, padding: 14, textAlign: "center",
              borderColor: active === k ? C.green : C.border, background: active === k ? `${C.green}08` : C.bgCard,
            }}>
              <div style={{ color: active === k ? C.green : C.dim, marginBottom: 4 }}>{m.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: active === k ? C.bright : C.text }}>{m.name}</div>
              <div style={{ fontSize: 10, color: C.dim, margin: "4px 0" }}>{d}/{t}</div>
              <Progress value={(d / t) * 100} color={d === t ? C.green : C.orange} h={3} />
            </Card>
          );
        })}
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Chakra Petch', sans-serif", fontSize: 15, color: C.bright }}>{DEVICE_META[active].name} Hardening</h3>
            <div style={{ fontSize: 11, color: C.dim }}>{done}/{items.length} ({pct}%)</div>
          </div>
          <div style={{ width: 200 }}><Progress value={pct} color={pct === 100 ? C.green : pct > 50 ? C.orange : C.red} h={8} /></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map(c => (
            <div key={c.id} onClick={() => setChecks(p => ({ ...p, [c.id]: !p[c.id] }))} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
              background: checks[c.id] ? `${C.green}06` : C.bg, borderRadius: 8,
              border: `1px solid ${checks[c.id] ? C.greenBdr : C.border}`, cursor: "pointer",
            }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1, border: `2px solid ${checks[c.id] ? C.green : "#2a2d3e"}`, background: checks[c.id] ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0b0f" }}>
                {checks[c.id] && <I.Check s={12} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ color: checks[c.id] ? C.dim : C.bright, fontWeight: 500, fontSize: 12, textDecoration: checks[c.id] ? "line-through" : "none" }}>{c.text}</span>
                  <Badge color={sevColor(c.sev)}>{c.sev}</Badge>
                </div>
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
// TAB 6: ACCOUNT SECURITY
// ═══════════════════════════════════════════════════════════════════════════════
function AccountTab({ accounts, setAccounts }) {
  const toggleField = (id, field) => setAccounts(prev => prev.map(a => a.id === id ? { ...a, [field]: !a[field] } : a));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Stat label="Total Accounts" value={accounts.length} color={C.bright} />
        <Stat label="2FA Enabled" value={accounts.filter(a => a.twoFA).length} color={C.green} sub={`${accounts.filter(a => !a.twoFA).length} without 2FA`} />
        <Stat label="High Risk" value={accounts.filter(a => a.risk === "high").length} color={accounts.filter(a => a.risk === "high").length > 0 ? C.red : C.green} />
      </div>
      {accounts.map(a => (
        <Card key={a.id} glow={a.risk === "high" ? C.red : undefined}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div>
                <div style={{ color: C.bright, fontWeight: 600, fontSize: 14 }}>{a.name}</div>
                <div style={{ color: C.dim, fontSize: 11 }}>Method: {a.method} · Sessions: {a.sessions} · Last review: {a.lastReview}</div>
              </div>
            </div>
            <Badge color={a.risk === "high" ? C.red : a.risk === "medium" ? C.orange : C.green}>{a.risk} risk</Badge>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Btn onClick={() => toggleField(a.id, "twoFA")} color={a.twoFA ? C.green : C.red} style={{ fontSize: 11 }}>
              {a.twoFA ? <I.Check /> : <I.X />} 2FA {a.twoFA ? "On" : "Off"}
            </Btn>
            <Btn onClick={() => toggleField(a.id, "appPw")} color={a.appPw ? C.green : C.orange} style={{ fontSize: 11 }}>
              {a.appPw ? <I.Check /> : <I.X />} App Password
            </Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 7: THREAT LOG
// ═══════════════════════════════════════════════════════════════════════════════
function ThreatTab({ threats, setThreats }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? threats : threats.filter(t => t.status === filter);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
        <Stat label="Active" value={threats.filter(t => t.status === "active").length} color={C.red} />
        <Stat label="Blocked" value={threats.filter(t => t.status === "blocked").length} color={C.green} />
        <Stat label="Investigating" value={threats.filter(t => t.status === "investigating").length} color={C.orange} />
        <Stat label="Resolved" value={threats.filter(t => t.status === "resolved").length} color={C.blue} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {["all", "active", "blocked", "investigating", "resolved"].map(f => (
          <Btn key={f} onClick={() => setFilter(f)} color={filter === f ? C.green : C.dim} style={{ fontSize: 10, padding: "5px 10px", textTransform: "capitalize" }}>{f}</Btn>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Card><div style={{ textAlign: "center", padding: 30, color: C.dim }}>No threats in this category</div></Card>
      ) : filtered.map(t => (
        <Card key={t.id} glow={t.status === "active" ? C.red : undefined}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: sevColor(t.severity) }} />
                <span style={{ color: C.bright, fontWeight: 700, fontSize: 14 }}>{t.name}</span>
                <Badge color={sevColor(t.severity)}>{t.severity}</Badge>
              </div>
              <div style={{ color: C.dim, fontSize: 12 }}>Target: {t.target} · {t.time}</div>
              {t.desc && <div style={{ color: C.text, fontSize: 12, marginTop: 6 }}>{t.desc}</div>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Badge color={t.status === "active" ? C.red : t.status === "blocked" ? C.green : t.status === "investigating" ? C.orange : C.blue}>{t.status}</Badge>
              {t.status === "active" && (
                <Btn onClick={() => setThreats(prev => prev.map(x => x.id === t.id ? { ...x, status: "blocked" } : x))} color={C.green} style={{ fontSize: 10, padding: "3px 8px" }}>Block</Btn>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 8: INCIDENT RESPONSE
// ═══════════════════════════════════════════════════════════════════════════════
const INCIDENT_STEPS = [
  { id: "ir1", title: "🔌 Disconnect from Internet", desc: "Immediately disconnect all affected devices from WiFi and unplug ethernet cables. This prevents data exfiltration and further compromise.", actions: ["Disable WiFi on device", "Unplug ethernet cable", "Enable airplane mode on phones"] },
  { id: "ir2", title: "🔑 Rotate All Passwords", desc: "Change passwords on all critical accounts starting with email and banking. Use a clean, uncompromised device.", actions: ["Change email password first", "Change banking passwords", "Change GitHub/Vercel/AWS passwords", "Change all other account passwords"] },
  { id: "ir3", title: "🔒 Revoke API Tokens & Sessions", desc: "Immediately revoke all API tokens, access keys, and active sessions across all platforms.", actions: ["GitHub → Settings → Tokens → Revoke all", "Vercel → Settings → Tokens → Delete all", "AWS → IAM → Rotate access keys", "Google → Security → Sign out all sessions"] },
  { id: "ir4", title: "🔍 Check Active Sessions", desc: "Review all active sessions on every account and terminate any you don't recognize.", actions: ["Google → Security → Your devices → Review", "GitHub → Settings → Sessions", "Check banking app active sessions", "Review Vercel team access"] },
  { id: "ir5", title: "🛡️ Scan All Systems", desc: "Run full antivirus and malware scans on all devices. Check for RATs, keyloggers, and unauthorized software.", actions: ["Windows Defender full scan", "Run Malwarebytes scan", "Check Android with Play Protect", "Review installed browser extensions"] },
  { id: "ir6", title: "✅ Restore & Monitor", desc: "After cleaning, restore trusted access and set up enhanced monitoring for 30 days.", actions: ["Re-enable 2FA on all accounts", "Generate new API keys with restricted scopes", "Set up login alerts on all accounts", "Monitor bank statements for 30 days", "Enable GitHub audit log monitoring"] },
];

function IncidentTab() {
  const [incidentMode, setIncidentMode] = useState(false);
  const [irChecks, setIrChecks] = useState({});
  const doneSteps = INCIDENT_STEPS.filter(s => s.actions.every((_, i) => irChecks[`${s.id}-${i}`])).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card glow={incidentMode ? C.red : undefined} style={incidentMode ? { background: `${C.red}08`, borderColor: C.redBdr } : {}}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 18, fontWeight: 700, color: incidentMode ? C.red : C.bright }}>
              {incidentMode ? "🚨 INCIDENT MODE ACTIVE" : "Incident Response Protocol"}
            </div>
            <div style={{ color: C.dim, fontSize: 12, marginTop: 4 }}>
              {incidentMode ? `${doneSteps}/${INCIDENT_STEPS.length} steps complete — follow ALL steps in order` : "Activate if you suspect your accounts or devices have been compromised."}
            </div>
          </div>
          <Btn onClick={() => setIncidentMode(!incidentMode)} color={incidentMode ? C.red : C.orange}>
            {incidentMode ? "Deactivate" : "Activate Incident Mode"}
          </Btn>
        </div>
      </Card>

      {incidentMode && INCIDENT_STEPS.map((step, si) => {
        const allDone = step.actions.every((_, i) => irChecks[`${step.id}-${i}`]);
        return (
          <Card key={step.id} glow={allDone ? C.green : undefined} style={allDone ? { borderColor: C.greenBdr } : {}}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: allDone ? C.green : C.bg, border: `2px solid ${allDone ? C.green : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: allDone ? "#0a0b0f" : C.dim, fontSize: 12, fontWeight: 700 }}>
                {allDone ? <I.Check /> : si + 1}
              </div>
              <div>
                <div style={{ color: allDone ? C.green : C.bright, fontWeight: 700, fontSize: 14 }}>{step.title}</div>
                <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>{step.desc}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 38 }}>
              {step.actions.map((a, i) => {
                const key = `${step.id}-${i}`;
                return (
                  <div key={key} onClick={() => setIrChecks(p => ({ ...p, [key]: !p[key] }))} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: C.bg, borderRadius: 6, cursor: "pointer",
                  }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${irChecks[key] ? C.green : "#2a2d3e"}`, background: irChecks[key] ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0b0f", flexShrink: 0 }}>
                      {irChecks[key] && <I.Check s={10} />}
                    </div>
                    <span style={{ fontSize: 12, color: irChecks[key] ? C.dim : C.text, textDecoration: irChecks[key] ? "line-through" : "none" }}>{a}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      {!incidentMode && (
        <Card>
          <Sect title="Emergency Contacts & Resources" icon={<I.FileText />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { name: "Google Account Recovery", url: "https://accounts.google.com/signin/recovery" },
                { name: "GitHub Support", url: "https://support.github.com" },
                { name: "AWS Security Incident", url: "https://aws.amazon.com/security/incident-response/" },
                { name: "Have I Been Pwned", url: "https://haveibeenpwned.com" },
                { name: "Vercel Support", url: "https://vercel.com/help" },
              ].map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: C.bg, borderRadius: 6, color: C.blue, textDecoration: "none", fontSize: 12 }}>
                  {r.name} <I.ExternalLink />
                </a>
              ))}
            </div>
          </Sect>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
const INITIAL_THREATS = [
  { id: 1, name: "Phishing Attempt", target: "Gmail", severity: "critical", status: "active", time: "12 min ago", desc: "Suspicious email with credential harvesting link detected" },
  { id: 2, name: "API Key Exposure", target: "GitHub", severity: "critical", status: "active", time: "1 hour ago", desc: "Potential API key found in public repository commit" },
  { id: 3, name: "Malware Detected", target: "Android", severity: "medium", status: "blocked", time: "3 hours ago", desc: "Trojan app blocked by Play Protect" },
  { id: 4, name: "Session Hijack Attempt", target: "Vercel", severity: "medium", status: "investigating", time: "5 hours ago", desc: "Unusual session activity from unrecognized IP" },
  { id: 5, name: "DNS Poisoning", target: "Home Router", severity: "high", status: "blocked", time: "8 hours ago", desc: "DNS response manipulation attempt blocked" },
  { id: 6, name: "Keylogger Signature", target: "Windows", severity: "critical", status: "resolved", time: "1 day ago", desc: "Keylogger pattern detected and removed by Defender" },
  { id: 7, name: "Token Theft Attempt", target: "Browser", severity: "low", status: "resolved", time: "2 days ago", desc: "Suspicious extension attempting to access session tokens" },
];

const INITIAL_ACCOUNTS = [
  { id: 1, name: "Google / Gmail", icon: "🔵", twoFA: true, method: "Authenticator App", appPw: true, sessions: 2, lastReview: "2 days ago", risk: "low" },
  { id: 2, name: "GitHub", icon: "⚫", twoFA: true, method: "Hardware Key", appPw: true, sessions: 1, lastReview: "1 week ago", risk: "low" },
  { id: 3, name: "Vercel", icon: "▲", twoFA: true, method: "Authenticator App", appPw: false, sessions: 1, lastReview: "3 days ago", risk: "medium" },
  { id: 4, name: "AWS", icon: "🟠", twoFA: true, method: "Authenticator App", appPw: true, sessions: 1, lastReview: "5 days ago", risk: "low" },
  { id: 5, name: "Firebase", icon: "🟡", twoFA: false, method: "None", appPw: false, sessions: 3, lastReview: "Never", risk: "high" },
  { id: 6, name: "Banking Apps", icon: "🏦", twoFA: true, method: "SMS + Biometric", appPw: true, sessions: 1, lastReview: "1 day ago", risk: "low" },
  { id: 7, name: "PayPal", icon: "🔷", twoFA: true, method: "SMS", appPw: false, sessions: 2, lastReview: "2 weeks ago", risk: "medium" },
  { id: 8, name: "Domain Registrar", icon: "🌐", twoFA: false, method: "None", appPw: false, sessions: 1, lastReview: "Never", risk: "high" },
];

const TABS = [
  { id: "overview", label: "Overview", icon: <I.Shield /> },
  { id: "breach", label: "Breach Check", icon: <I.Database /> },
  { id: "passwords", label: "Passwords", icon: <I.Key /> },
  { id: "scanner", label: "Web Scanner", icon: <I.Globe /> },
  { id: "devices", label: "Devices", icon: <I.Monitor /> },
  { id: "accounts", label: "Accounts", icon: <I.User /> },
  { id: "threats", label: "Threats", icon: <I.Alert /> },
  { id: "incident", label: "Incident", icon: <I.Zap /> },
];

export default function App() {
  const [tab, setTab] = useState("overview");
  const [checks, setChecks] = useState({});
  const [threats, setThreats] = useState(INITIAL_THREATS);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [scanLog, setScanLog] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const addLog = (entry) => setScanLog(p => [{ ...entry, time: new Date() }, ...p]);

  const activeThreats = threats.filter(t => t.status === "active").length;

  return (
    <div style={{ fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif", background: C.bg, color: C.text, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Fira+Code:wght@400;600&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        ::selection { background: ${C.green}30; color: ${C.bright}; }
        input:focus { border-color: ${C.green} !important; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: `1px solid ${C.border}`, background: `${C.bgCard}ee`, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${C.green}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <I.Shield s={18} style={{ color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, fontSize: 16, color: C.bright, letterSpacing: "0.06em" }}>AGENTSLOCK</div>
            <div style={{ fontSize: 9, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Personal Cybersecurity Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: C.dim }}>
            {now.toLocaleTimeString()}
          </span>
          {activeThreats > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: C.redDim, border: `1px solid ${C.redBdr}`, borderRadius: 6, animation: "pulse 2s infinite" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.red }} />
              <span style={{ color: C.red, fontSize: 11, fontWeight: 600 }}>{activeThreats} ACTIVE THREAT{activeThreats > 1 ? "S" : ""}</span>
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav style={{ display: "flex", gap: 2, padding: "8px 24px", borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
            fontSize: 12, fontWeight: tab === t.id ? 600 : 400, whiteSpace: "nowrap",
            background: tab === t.id ? `${C.green}12` : "transparent",
            color: tab === t.id ? C.green : C.dim, transition: "all 0.2s",
          }}>
            {t.icon}
            {t.label}
            {t.id === "threats" && activeThreats > 0 && <Badge color={C.red} style={{ fontSize: 8, padding: "1px 5px" }}>{activeThreats}</Badge>}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        {tab === "overview" && <OverviewTab checks={checks} threats={threats} accounts={accounts} scanLog={scanLog} />}
        {tab === "breach" && <BreachTab addLog={addLog} />}
        {tab === "passwords" && <PasswordTab />}
        {tab === "scanner" && <ScannerTab addLog={addLog} />}
        {tab === "devices" && <DeviceTab checks={checks} setChecks={setChecks} />}
        {tab === "accounts" && <AccountTab accounts={accounts} setAccounts={setAccounts} />}
        {tab === "threats" && <ThreatTab threats={threats} setThreats={setThreats} />}
        {tab === "incident" && <IncidentTab />}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "20px 24px", borderTop: `1px solid ${C.border}`, color: C.dim, fontSize: 11 }}>
        AgentsLock v2.0 — Personal Cybersecurity Dashboard — <a href="https://agentslock.com" style={{ color: C.green, textDecoration: "none" }}>agentslock.com</a>
      </footer>
    </div>
  );
}
