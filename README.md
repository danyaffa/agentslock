# 🔒 AgentsLock v3.0

**Full-Stack Personal Cybersecurity Platform**

🌐 Live: [agentslock.com](https://agentslock.com)

## All Phases Complete

### Phase 1 — Core Dashboard (v1.0)
- Security score overview with real-time calculation
- Device monitoring (Windows, Android, Browser, Network, Developer)
- Account security tracking with 2FA status
- Threat detection log with severity levels
- Interactive hardening checklist (56 items across 5 categories)

### Phase 2 — Real Security Tools (v2.0)
- **Email Breach Checker** — HaveIBeenPwned API integration
- **Password Breach Checker** — k-anonymity (password never leaves browser)
- **Password Strength Analyzer** — entropy calculation, crack time estimation
- **Secure Password Generator** — cryptographic randomness, configurable options
- **Website Security Scanner** — SSL Labs API grade + security headers analysis
- **Incident Response Protocol** — 6-step emergency checklist with 23 actions

### Phase 3 — Auth & Persistence (v3.0)
- **User Authentication** — Sign up / Sign in with local storage
- **Persistent Data** — All checklist progress, accounts, threats, monitors saved
- **Settings Panel** — API key management, preferences, data export
- **Session Management** — User profiles with secure logout

### Phase 4 — Real-Time Monitoring (v3.0)
- **Uptime Monitoring** — Add any website, auto-checks every 5 minutes
- **Response Time Graphs** — Visual history of response times per site
- **Security Reports** — Full exportable report with scores and recommendations
- **Auto-monitoring** — Background checks continue while dashboard is open

### Phase 5 — PWA / Mobile Ready (v3.0)
- **Progressive Web App** — Installable on Android/iOS home screen
- **Service Worker** — Offline support with cache-first strategy
- **Mobile Optimized** — Responsive design, touch-friendly
- **App Manifest** — Full PWA metadata for native-like experience

## Features Summary

| Feature | Status | Details |
|---------|--------|---------|
| Auth System | ✅ | Local signup/login |
| Breach Check (email) | ✅ | HIBP API (key needed) |
| Breach Check (password) | ✅ | Free k-anonymity |
| Password Analyzer | ✅ | Entropy + crack time |
| Password Generator | ✅ | Crypto-secure |
| Website Scanner | ✅ | SSL Labs + headers |
| Device Hardening | ✅ | 56 checks, 5 categories |
| Account Security | ✅ | 8 accounts, 2FA tracking |
| Threat Management | ✅ | Filter, block, resolve |
| Uptime Monitoring | ✅ | Auto-check every 5 min |
| Security Reports | ✅ | Export as .txt |
| Incident Response | ✅ | 6-step protocol |
| Settings & API Keys | ✅ | Preferences, data mgmt |
| PWA Support | ✅ | Installable, offline |
| Data Persistence | ✅ | LocalStorage |

## 11 Tabs
1. Overview — Dashboard with scores, threats, monitors
2. Breach Check — Email and password breach checking
3. Passwords — Strength analyzer + secure generator
4. Web Scanner — SSL grade + security headers
5. Devices — 56 hardening checks with commands
6. Accounts — 2FA status, app passwords, risk levels
7. Threats — Active threat management with filtering
8. Monitoring — Uptime monitoring with response graphs
9. Reports — Exportable security audit reports
10. Incident — Emergency response protocol
11. Settings — Auth, API keys, preferences, data management

## Tech Stack
- React 18 + Vite 6
- Zero UI dependencies (all inline styles)
- Chakra Petch + Space Grotesk + Fira Code fonts
- PWA with Service Worker
- LocalStorage persistence
- Deployed on Vercel

## Deploy
```bash
npm install
npm run dev     # Development
npm run build   # Production
```

## Install as App (PWA)
1. Visit agentslock.com on mobile
2. Tap browser menu → "Add to Home Screen"
3. App launches in standalone mode

## License
MIT
