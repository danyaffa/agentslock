import React from 'react'
import ReactDOM from 'react-dom/client'
import App, { AppErrorBoundary, AppStorePage } from './App.jsx'

// Remove splash screen even if React has an early error
try {
  if (window.__removeSplash) window.__removeSplash();
} catch {}

// Route /app-store to the PWA install page (no auth required)
const Root = window.location.pathname === "/app-store" ? AppStorePage : App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Root />
    </AppErrorBoundary>
  </React.StrictMode>,
)
