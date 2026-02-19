# 🔒 AgentsLock v2.0

**Personal Cybersecurity Dashboard** — Full-featured security platform to protect your devices, accounts, and data.

🌐 Live: [agentslock.com](https://agentslock.com)

## Features

### 🛡️ Overview Dashboard
- Real-time security score calculated from hardening checklist progress
- Active threat counter with live status
- Device monitoring summary
- Account risk overview
- Quick action shortcuts
- Scan history log

### 🔍 Breach Checker
- **Email breach check** via HaveIBeenPwned API
- **Password breach check** using k-anonymity (SHA-1 prefix only — your password never leaves your browser)
- Breach history tracking

### 🔑 Password Tools
- **Password Strength Analyzer** — entropy calculation, crack time estimation, issue detection
- **Secure Password Generator** — configurable length (8-64), uppercase, lowercase, numbers, symbols
- One-click copy to clipboard
- Detects common breached passwords

### 🌐 Website Security Scanner
- SSL/TLS grade checking via SSL Labs API
- Security headers analysis with recommendations
- Provides exact header values to implement
- Covers CSP, HSTS, X-Frame-Options, Referrer-Policy, and more

### 💻 Device Hardening (56 checks across 5 categories)
- **Windows** (12 checks) — BitLocker, Defender, firewall, Secure Boot, SMBv1, credential guard
- **Android** (12 checks) — encryption, Find My Device, Play Protect, permissions, USB debugging
- **Browsers** (10 checks) — HTTPS-only, uBlock Origin, cookies, Safe Browsing, WebRTC
- **Network** (10 checks) — router password, WPA3, WPS, UPnP, firmware, DNS
- **Developer** (12 checks) — .env security, GitHub secret scanning, SSH keys, API rotation, CloudTrail

Each check includes: severity rating, step-by-step guide, and PowerShell/bash commands where applicable.

### 👤 Account Security Audit
- Track 2FA status across 8 critical accounts
- App password monitoring
- Session count tracking
- Risk level assessment (low/medium/high)
- Toggle 2FA and app password status

### ⚠️ Threat Log
- Real-time threat tracking with severity levels
- Filter by status: active, blocked, investigating, resolved
- One-click threat blocking
- Threat descriptions and target identification

### 🚨 Incident Response Protocol
- 6-step emergency response checklist
- Activatable incident mode with visual alerts
- Action items for each step with checkboxes
- Emergency contact links (Google, GitHub, AWS, Vercel, HIBP)

## Tech Stack
- React 18 + Vite
- Zero dependencies (no Tailwind, no UI libraries)
- Inline styles for maximum portability
- Chakra Petch + Space Grotesk + Fira Code fonts
- Deployed on Vercel

## Security Principles
- Zero-trust mindset
- Least-privilege access
- Multi-factor authentication everywhere
- Secrets never stored in plaintext
- Continuous monitoring
- Immediate revocation of compromised keys

## Deploy
```bash
npm install
npm run dev     # Development
npm run build   # Production build
```

## License
MIT
