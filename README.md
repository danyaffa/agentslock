# 🔒 AgentsLock — Personal Cybersecurity Dashboard

**AgentsLock** is a real-time personal cybersecurity monitoring dashboard built to protect your devices, accounts, and financial data from compromise.

🌐 **Live:** [agentslock.com](https://agentslock.com)

## Features

- **Security Score** — Overall hardening progress at a glance
- **Device Monitoring** — Track Windows, Android, routers, and browsers
- **Account Audit** — 2FA status, app passwords, session counts, risk levels
- **Threat Feed** — Live threat detection with severity & status tracking
- **Hardening Checklist** — Interactive security tasks across 4 categories
- **Incident Response** — Step-by-step emergency protocol when compromise is suspected

## Threat Coverage

Malware / Spyware, RATs, Credential Theft, Phishing, Session Hijacking, DNS Poisoning, Public Wi-Fi Interception, Keyloggers, Browser Token Theft, API Key Leaks, Unauthorized Scripts

## Accounts Protected

Google/Gmail, GitHub, Vercel, AWS, Firebase, Banking, PayPal, Domain Registrar

## Tech Stack

- React (JSX)
- Tailwind-free — all styles inline for zero-dependency rendering
- JetBrains Mono + Space Grotesk typography
- SVG icon system (no external icon library)
- No external dependencies beyond React

## Getting Started

### Option 1: Open in Claude.ai
Upload `index.jsx` as a React artifact.

### Option 2: Run locally with Vite
```bash
npm create vite@latest agentslock -- --template react
cp index.jsx agentslock/src/App.jsx
cd agentslock
npm install
npm run dev
```

### Option 3: Deploy to Vercel
```bash
npm create vite@latest agentslock -- --template react
cp index.jsx agentslock/src/App.jsx
cd agentslock
npm install
npx vercel
```

## Security Principles

- Zero-trust mindset
- Least-privilege access
- MFA everywhere
- Secrets never in plaintext
- Continuous monitoring
- Hardware/app auth over SMS

## License

MIT
