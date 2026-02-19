import { useState, useEffect, useCallback } from "react";

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Lock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Monitor: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Smartphone: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  ),
  Wifi: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  ),
  Globe: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Key: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
  ),
  Eye: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Terminal: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  ),
  RefreshCw: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Database: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
};

// ─── Data ────────────────────────────────────────────────────────────────────
const DEVICES = [
  { id: "win-laptop", name: "Windows Laptop", icon: "Monitor", os: "Windows 11", status: "protected", lastScan: "2 hours ago", threats: 0, updates: true, firewall: true, antivirus: true },
  { id: "android", name: "Android Phone", icon: "Smartphone", os: "Android 15", status: "warning", lastScan: "1 day ago", threats: 2, updates: false, firewall: true, antivirus: true },
  { id: "router", name: "Home Router", icon: "Wifi", os: "OpenWrt", status: "protected", lastScan: "6 hours ago", threats: 0, updates: true, firewall: true, antivirus: false },
  { id: "browser", name: "Web Browsers", icon: "Globe", os: "Chrome / Firefox", status: "critical", lastScan: "3 days ago", threats: 5, updates: false, firewall: false, antivirus: false },
];

const ACCOUNTS = [
  { name: "Google / Gmail", twoFA: true, appPassword: true, sessions: 2, risk: "low" },
  { name: "GitHub", twoFA: true, appPassword: true, sessions: 1, risk: "low" },
  { name: "Vercel", twoFA: true, appPassword: false, sessions: 1, risk: "medium" },
  { name: "AWS", twoFA: true, appPassword: true, sessions: 1, risk: "low" },
  { name: "Firebase", twoFA: false, appPassword: false, sessions: 3, risk: "high" },
  { name: "Banking Apps", twoFA: true, appPassword: true, sessions: 1, risk: "low" },
  { name: "PayPal", twoFA: true, appPassword: false, sessions: 2, risk: "medium" },
  { name: "Domain Registrar", twoFA: false, appPassword: false, sessions: 1, risk: "high" },
];

const THREATS = [
  { id: 1, type: "Phishing", severity: "critical", target: "Gmail", detail: "Suspicious OAuth consent screen detected", time: "12 min ago", status: "active" },
  { id: 2, type: "API Key Leak", severity: "critical", target: "GitHub", detail: "Exposed key in public repo commit", time: "1 hour ago", status: "active" },
  { id: 3, type: "Malware", severity: "medium", target: "Android", detail: "Untrusted APK installation attempted", time: "3 hours ago", status: "blocked" },
  { id: 4, type: "Session Hijack", severity: "medium", target: "Vercel", detail: "Login from unrecognized IP 185.x.x.x", time: "5 hours ago", status: "investigating" },
  { id: 5, type: "DNS Poisoning", severity: "low", target: "Router", detail: "Unusual DNS query pattern detected", time: "8 hours ago", status: "resolved" },
  { id: 6, type: "Keylogger", severity: "critical", target: "Windows", detail: "Suspicious process hooking keyboard input", time: "30 min ago", status: "active" },
  { id: 7, type: "Token Theft", severity: "medium", target: "Browser", detail: "Extension requesting excessive permissions", time: "2 hours ago", status: "blocked" },
];

const CHECKLIST = [
  { category: "Authentication", items: [
    { text: "Enable 2FA on all accounts", done: true },
    { text: "Use hardware key (YubiKey) for critical accounts", done: false },
    { text: "Replace SMS 2FA with authenticator app", done: true },
    { text: "Use unique passwords (password manager)", done: true },
    { text: "Rotate API keys quarterly", done: false },
  ]},
  { category: "Device Hardening", items: [
    { text: "Enable full-disk encryption (BitLocker)", done: true },
    { text: "Disable remote desktop if unused", done: false },
    { text: "Enable automatic OS updates", done: true },
    { text: "Remove unknown applications", done: false },
    { text: "Configure firewall rules", done: true },
  ]},
  { category: "Network Security", items: [
    { text: "Change default router admin password", done: true },
    { text: "Enable WPA3 encryption", done: false },
    { text: "Disable WPS", done: true },
    { text: "Use DNS-over-HTTPS", done: false },
    { text: "Set up VPN for public Wi-Fi", done: true },
  ]},
  { category: "Developer Security", items: [
    { text: "Store secrets in env variables only", done: true },
    { text: "Add .env to .gitignore", done: true },
    { text: "Restrict API key scopes", done: false },
    { text: "Enable GitHub secret scanning", done: true },
    { text: "Audit npm dependencies", done: false },
  ]},
];

const INCIDENT_STEPS = [
  { step: 1, action: "Disconnect device from internet", detail: "Pull ethernet, disable Wi-Fi, enable airplane mode" },
  { step: 2, action: "Rotate all passwords immediately", detail: "Start with email, then banking, then dev accounts" },
  { step: 3, action: "Revoke all API tokens and keys", detail: "GitHub, Vercel, AWS, Firebase — regenerate everything" },
  { step: 4, action: "Check active sessions everywhere", detail: "Google Security, GitHub Sessions, AWS CloudTrail" },
  { step: 5, action: "Run full system malware scan", detail: "Use Windows Defender offline + Malwarebytes" },
  { step: 6, action: "Review and restore trusted access", detail: "Re-enable only verified devices and sessions" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const severityColor = (s) => ({ critical: "#ff3b3b", high: "#ff3b3b", medium: "#f5a623", low: "#4ade80" }[s] || "#8b8fa3");
const statusColor = (s) => ({ active: "#ff3b3b", blocked: "#f5a623", investigating: "#3b82f6", resolved: "#4ade80" }[s] || "#8b8fa3");
const riskColor = (r) => ({ high: "#ff3b3b", medium: "#f5a623", low: "#4ade80" }[r] || "#8b8fa3");
const deviceStatusColor = (s) => ({ protected: "#4ade80", warning: "#f5a623", critical: "#ff3b3b" }[s] || "#8b8fa3");

// ─── App ─────────────────────────────────────────────────────────────────────
export default function CyberShieldApp() {
  const [activeTab, setActiveTab] = useState("overview");
  const [incidentMode, setIncidentMode] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [checklistState, setChecklistState] = useState(() => {
    const s = {};
    CHECKLIST.forEach((cat, ci) => cat.items.forEach((item, ii) => { s[`${ci}-${ii}`] = item.done; }));
    return s;
  });
  const [scanPulse, setScanPulse] = useState(false);
  const [threats, setThreats] = useState(THREATS);
  const [showThreatDetail, setShowThreatDetail] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const toggleCheck = (key) => setChecklistState(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleIncidentStep = (step) => {
    setCompletedSteps(prev => {
      const n = new Set(prev);
      n.has(step) ? n.delete(step) : n.add(step);
      return n;
    });
  };
  const runScan = () => { setScanPulse(true); setTimeout(() => setScanPulse(false), 3000); };
  const dismissThreat = (id) => setThreats(prev => prev.map(t => t.id === id ? { ...t, status: "resolved" } : t));

  const totalChecked = Object.values(checklistState).filter(Boolean).length;
  const totalItems = Object.keys(checklistState).length;
  const securityScore = Math.round((totalChecked / totalItems) * 100);
  const activeThreats = threats.filter(t => t.status === "active").length;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "devices", label: "Devices" },
    { id: "accounts", label: "Accounts" },
    { id: "threats", label: "Threats" },
    { id: "checklist", label: "Hardening" },
    { id: "incident", label: "Incident" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0b0f",
      color: "#e0e2eb",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
      fontSize: "13px",
      lineHeight: 1.6,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      
      {/* ── Header ──────────────────────────────────────── */}
      <header style={{
        borderBottom: "1px solid #1a1d2e",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(180deg, #0d0e14 0%, #0a0b0f 100%)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(0,255,136,0.15)",
          }}>
            <span style={{ color: "#0a0b0f", fontWeight: 700, fontSize: 16 }}>
              <Icons.Shield />
            </span>
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: "-0.02em" }}>
              AGENTSLOCK
            </div>
            <div style={{ fontSize: 10, color: "#4a4f6a", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Personal Cybersecurity Dashboard
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 11, color: "#4a4f6a" }}>
            <Icons.Clock /> {time.toLocaleTimeString()}
          </div>
          <button onClick={() => { setIncidentMode(!incidentMode); setActiveTab("incident"); }} style={{
            background: incidentMode ? "#ff3b3b" : "transparent",
            border: `1px solid ${incidentMode ? "#ff3b3b" : "#2a2d3e"}`,
            color: incidentMode ? "#fff" : "#ff3b3b",
            padding: "6px 14px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 11,
            fontFamily: "inherit",
            fontWeight: 600,
            letterSpacing: "0.04em",
            transition: "all 0.2s",
            animation: incidentMode ? "pulse-red 2s infinite" : "none",
          }}>
            {incidentMode ? "⚠ INCIDENT ACTIVE" : "🔴 INCIDENT MODE"}
          </button>
        </div>
      </header>

      {/* ── Navigation ──────────────────────────────────── */}
      <nav style={{
        display: "flex",
        gap: 2,
        padding: "0 24px",
        borderBottom: "1px solid #1a1d2e",
        background: "#0c0d13",
        overflowX: "auto",
      }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "12px 18px",
            border: "none",
            background: "transparent",
            color: activeTab === tab.id ? "#00ff88" : "#4a4f6a",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "inherit",
            fontWeight: activeTab === tab.id ? 600 : 400,
            borderBottom: activeTab === tab.id ? "2px solid #00ff88" : "2px solid transparent",
            transition: "all 0.2s",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          }}>
            {tab.label}
            {tab.id === "threats" && activeThreats > 0 && (
              <span style={{
                background: "#ff3b3b",
                color: "#fff",
                fontSize: 9,
                padding: "1px 5px",
                borderRadius: 8,
                marginLeft: 6,
                fontWeight: 700,
              }}>{activeThreats}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Content ─────────────────────────────────────── */}
      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        {activeTab === "overview" && <OverviewPanel {...{ securityScore, activeThreats, devices: DEVICES, accounts: ACCOUNTS, threats, totalChecked, totalItems, runScan, scanPulse }} />}
        {activeTab === "devices" && <DevicesPanel devices={DEVICES} />}
        {activeTab === "accounts" && <AccountsPanel accounts={ACCOUNTS} />}
        {activeTab === "threats" && <ThreatsPanel {...{ threats, showThreatDetail, setShowThreatDetail, dismissThreat }} />}
        {activeTab === "checklist" && <ChecklistPanel {...{ checklistState, toggleCheck }} />}
        {activeTab === "incident" && <IncidentPanel {...{ incidentMode, setIncidentMode, completedSteps, toggleIncidentStep }} />}
      </main>

      <style>{`
        @keyframes pulse-red { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,59,59,0.4); } 50% { box-shadow: 0 0 0 8px rgba(255,59,59,0); } }
        @keyframes pulse-green { 0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,136,0.3); } 50% { box-shadow: 0 0 0 12px rgba(0,255,136,0); } }
        @keyframes scan-line { 0% { top: 0; opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: #1a1d2e #0a0b0f; }
      `}</style>
    </div>
  );
}

// ─── Card Component ──────────────────────────────────────────────────────────
function Card({ children, style = {}, glow }) {
  return (
    <div style={{
      background: "#0f1017",
      border: "1px solid #1a1d2e",
      borderRadius: 10,
      padding: 20,
      animation: "fade-in 0.4s ease",
      ...(glow ? { boxShadow: `0 0 24px ${glow}15` } : {}),
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      {icon && <span style={{ color: "#00ff88" }}>{icon}</span>}
      <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{children}</h3>
    </div>
  );
}

// ─── Overview Panel ──────────────────────────────────────────────────────────
function OverviewPanel({ securityScore, activeThreats, devices, accounts, threats, totalChecked, totalItems, runScan, scanPulse }) {
  const scoreColor = securityScore >= 80 ? "#00ff88" : securityScore >= 50 ? "#f5a623" : "#ff3b3b";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (securityScore / 100) * circumference;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
      {/* Score */}
      <Card glow={scoreColor} style={{ gridColumn: "1 / 2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28 }}>
        <div style={{ position: "relative", width: 128, height: 128 }}>
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="54" fill="none" stroke="#1a1d2e" strokeWidth="8" />
            <circle cx="64" cy="64" r="54" fill="none" stroke={scoreColor} strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={offset}
              strokeLinecap="round" transform="rotate(-90 64 64)"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: scoreColor }}>{securityScore}</span>
            <span style={{ fontSize: 9, color: "#4a4f6a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Security Score</span>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: "#8b8fa3", textAlign: "center" }}>
          {totalChecked}/{totalItems} hardening tasks complete
        </div>
      </Card>

      {/* Stats Grid */}
      <div style={{ gridColumn: "2 / 4", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 10, color: "#4a4f6a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Active Threats</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: activeThreats > 0 ? "#ff3b3b" : "#4ade80" }}>
            {activeThreats}
          </div>
          <div style={{ fontSize: 11, color: "#8b8fa3", marginTop: 4 }}>{threats.filter(t => t.status === "blocked").length} blocked today</div>
        </Card>
        <Card>
          <div style={{ fontSize: 10, color: "#4a4f6a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Devices Monitored</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#fff" }}>{devices.length}</div>
          <div style={{ fontSize: 11, color: "#8b8fa3", marginTop: 4 }}>{devices.filter(d => d.status === "protected").length} fully protected</div>
        </Card>
        <Card>
          <div style={{ fontSize: 10, color: "#4a4f6a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Accounts Secured</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#fff" }}>{accounts.length}</div>
          <div style={{ fontSize: 11, color: "#8b8fa3", marginTop: 4 }}>{accounts.filter(a => a.risk === "low").length} low risk</div>
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: "#4a4f6a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Quick Scan</div>
          </div>
          <button onClick={runScan} style={{
            width: "100%",
            background: scanPulse ? "#00ff8820" : "linear-gradient(135deg, #00ff8815 0%, #0f1017 100%)",
            border: "1px solid #00ff8840",
            color: "#00ff88",
            padding: "12px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "inherit",
            fontWeight: 600,
            transition: "all 0.3s",
            animation: scanPulse ? "pulse-green 1s infinite" : "none",
          }}>
            <Icons.RefreshCw /> {scanPulse ? "Scanning..." : "Run Security Scan"}
          </button>
        </Card>
      </div>

      {/* Recent Threats */}
      <Card style={{ gridColumn: "1 / -1" }}>
        <SectionTitle icon={<Icons.AlertTriangle />}>Recent Threat Activity</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {threats.slice(0, 4).map(t => (
            <div key={t.id} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "#0a0b0f",
              borderRadius: 8,
              border: `1px solid ${t.status === "active" ? "#ff3b3b20" : "#1a1d2e"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: severityColor(t.severity) }} />
                <div>
                  <span style={{ color: "#fff", fontWeight: 500 }}>{t.type}</span>
                  <span style={{ color: "#4a4f6a", margin: "0 8px" }}>→</span>
                  <span style={{ color: "#8b8fa3" }}>{t.target}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 10, color: "#4a4f6a" }}>{t.time}</span>
                <span style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: `${statusColor(t.status)}15`,
                  color: statusColor(t.status),
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Devices Panel ───────────────────────────────────────────────────────────
function DevicesPanel({ devices }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {devices.map(d => {
        const Icon = Icons[d.icon] || Icons.Monitor;
        return (
          <Card key={d.id} glow={deviceStatusColor(d.status)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${deviceStatusColor(d.status)}12`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: deviceStatusColor(d.status),
                }}>
                  <Icon />
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                  <div style={{ color: "#4a4f6a", fontSize: 11 }}>{d.os}</div>
                </div>
              </div>
              <span style={{
                fontSize: 10, padding: "3px 10px", borderRadius: 20,
                background: `${deviceStatusColor(d.status)}15`,
                color: deviceStatusColor(d.status),
                fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
              }}>{d.status}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Threats Found", value: d.threats, color: d.threats > 0 ? "#ff3b3b" : "#4ade80" },
                { label: "Last Scan", value: d.lastScan, color: "#8b8fa3" },
              ].map((item, i) => (
                <div key={i} style={{ padding: "8px 10px", background: "#0a0b0f", borderRadius: 6 }}>
                  <div style={{ fontSize: 9, color: "#4a4f6a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</div>
                  <div style={{ color: item.color, fontWeight: 600, marginTop: 2 }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {[
                { label: "Updates", ok: d.updates },
                { label: "Firewall", ok: d.firewall },
                { label: "Antivirus", ok: d.antivirus },
              ].map((check, i) => (
                <div key={i} style={{
                  flex: 1, padding: "6px 8px", borderRadius: 6, fontSize: 10, textAlign: "center",
                  background: check.ok ? "#4ade8010" : "#ff3b3b10",
                  color: check.ok ? "#4ade80" : "#ff3b3b",
                  border: `1px solid ${check.ok ? "#4ade8020" : "#ff3b3b20"}`,
                }}>
                  {check.ok ? <Icons.Check /> : <Icons.X />} {check.label}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Accounts Panel ──────────────────────────────────────────────────────────
function AccountsPanel({ accounts }) {
  return (
    <Card>
      <SectionTitle icon={<Icons.Key />}>Account Security Audit</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
          padding: "8px 14px", fontSize: 10, color: "#4a4f6a",
          textTransform: "uppercase", letterSpacing: "0.08em",
          borderBottom: "1px solid #1a1d2e",
        }}>
          <span>Account</span><span>2FA</span><span>App Password</span><span>Sessions</span><span>Risk</span>
        </div>
        {accounts.map((a, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            padding: "10px 14px", alignItems: "center",
            background: i % 2 === 0 ? "#0a0b0f" : "transparent",
            borderRadius: 6,
          }}>
            <span style={{ color: "#fff", fontWeight: 500 }}>{a.name}</span>
            <span style={{ color: a.twoFA ? "#4ade80" : "#ff3b3b" }}>
              {a.twoFA ? <Icons.Check /> : <Icons.X />}
            </span>
            <span style={{ color: a.appPassword ? "#4ade80" : "#ff3b3b" }}>
              {a.appPassword ? <Icons.Check /> : <Icons.X />}
            </span>
            <span style={{ color: a.sessions > 2 ? "#f5a623" : "#8b8fa3" }}>{a.sessions}</span>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 4,
              background: `${riskColor(a.risk)}15`,
              color: riskColor(a.risk),
              fontWeight: 600, textTransform: "uppercase",
              display: "inline-block", width: "fit-content",
            }}>{a.risk}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Threats Panel ───────────────────────────────────────────────────────────
function ThreatsPanel({ threats, showThreatDetail, setShowThreatDetail, dismissThreat }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        {["all", "active", "blocked", "resolved"].map(f => (
          <button key={f} style={{
            padding: "5px 12px", borderRadius: 6, border: "1px solid #1a1d2e",
            background: "transparent", color: "#8b8fa3", cursor: "pointer",
            fontSize: 11, fontFamily: "inherit", textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>
      {threats.map(t => (
        <Card key={t.id} glow={t.status === "active" ? "#ff3b3b" : undefined}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", marginTop: 4,
                background: severityColor(t.severity),
                boxShadow: t.status === "active" ? `0 0 8px ${severityColor(t.severity)}` : "none",
              }} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{t.type}</span>
                  <span style={{
                    fontSize: 9, padding: "1px 6px", borderRadius: 4,
                    background: `${severityColor(t.severity)}20`,
                    color: severityColor(t.severity),
                    fontWeight: 700, textTransform: "uppercase",
                  }}>{t.severity}</span>
                </div>
                <div style={{ color: "#8b8fa3", fontSize: 12, marginTop: 4 }}>{t.detail}</div>
                <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 11, color: "#4a4f6a" }}>
                  <span>Target: <span style={{ color: "#8b8fa3" }}>{t.target}</span></span>
                  <span>{t.time}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{
                fontSize: 10, padding: "3px 10px", borderRadius: 4,
                background: `${statusColor(t.status)}15`,
                color: statusColor(t.status),
                fontWeight: 600, textTransform: "uppercase",
              }}>{t.status}</span>
              {t.status === "active" && (
                <button onClick={() => dismissThreat(t.id)} style={{
                  padding: "3px 10px", borderRadius: 4, border: "1px solid #4ade8030",
                  background: "#4ade8010", color: "#4ade80", cursor: "pointer",
                  fontSize: 10, fontFamily: "inherit", fontWeight: 600,
                }}>Resolve</button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Checklist Panel ─────────────────────────────────────────────────────────
function ChecklistPanel({ checklistState, toggleCheck }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {CHECKLIST.map((cat, ci) => (
        <Card key={ci}>
          <SectionTitle icon={<Icons.Lock />}>{cat.category}</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {cat.items.map((item, ii) => {
              const key = `${ci}-${ii}`;
              const done = checklistState[key];
              return (
                <div key={key} onClick={() => toggleCheck(key)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 6, cursor: "pointer",
                  background: done ? "#4ade8008" : "#ff3b3b05",
                  border: `1px solid ${done ? "#4ade8015" : "#1a1d2e"}`,
                  transition: "all 0.2s",
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${done ? "#4ade80" : "#2a2d3e"}`,
                    background: done ? "#4ade80" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}>
                    {done && <Icons.Check />}
                  </div>
                  <span style={{
                    color: done ? "#8b8fa3" : "#e0e2eb",
                    textDecoration: done ? "line-through" : "none",
                    fontSize: 12,
                  }}>{item.text}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 10, color: "#4a4f6a" }}>
            {cat.items.filter((_, ii) => checklistState[`${ci}-${ii}`]).length}/{cat.items.length} complete
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Incident Panel ──────────────────────────────────────────────────────────
function IncidentPanel({ incidentMode, setIncidentMode, completedSteps, toggleIncidentStep }) {
  return (
    <div>
      {!incidentMode && (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
            No Active Incident
          </div>
          <div style={{ color: "#8b8fa3", fontSize: 12, marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
            If you suspect a compromise, activate Incident Mode to begin the emergency response protocol.
          </div>
          <button onClick={() => setIncidentMode(true)} style={{
            background: "#ff3b3b15",
            border: "1px solid #ff3b3b40",
            color: "#ff3b3b",
            padding: "10px 24px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "inherit",
            fontWeight: 600,
          }}>
            Activate Incident Mode
          </button>
        </Card>
      )}
      {incidentMode && (
        <>
          <Card glow="#ff3b3b" style={{ marginBottom: 16, borderColor: "#ff3b3b30" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#ff3b3b" }}>
              <Icons.AlertTriangle />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15 }}>
                INCIDENT RESPONSE ACTIVE
              </span>
            </div>
            <div style={{ color: "#8b8fa3", fontSize: 12, marginTop: 8 }}>
              Follow each step in order. Check off as you complete them.
            </div>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {INCIDENT_STEPS.map(s => {
              const done = completedSteps.has(s.step);
              return (
                <Card key={s.step} style={{
                  borderColor: done ? "#4ade8030" : "#1a1d2e",
                  opacity: done ? 0.7 : 1,
                  cursor: "pointer",
                }} >
                  <div onClick={() => toggleIncidentStep(s.step)} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: done ? "#4ade80" : "#1a1d2e",
                      color: done ? "#0a0b0f" : "#4a4f6a",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 12,
                      transition: "all 0.2s",
                    }}>
                      {done ? <Icons.Check /> : s.step}
                    </div>
                    <div>
                      <div style={{
                        color: done ? "#8b8fa3" : "#fff",
                        fontWeight: 600, fontSize: 13,
                        textDecoration: done ? "line-through" : "none",
                      }}>{s.action}</div>
                      <div style={{ color: "#4a4f6a", fontSize: 11, marginTop: 4 }}>{s.detail}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button onClick={() => { setIncidentMode(false); }} style={{
              background: "#4ade8015",
              border: "1px solid #4ade8040",
              color: "#4ade80",
              padding: "10px 24px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
              fontWeight: 600,
            }}>
              ✓ Resolve Incident
            </button>
          </div>
        </>
      )}
    </div>
  );
}
