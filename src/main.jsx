import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Commit it.

**🔴 Issue 2: Move `index.jsx` to `src/App.jsx`**

The app code is currently in `index.jsx` at root level. You need it as `src/App.jsx`. Go to GitHub → **"Add file" → "Create new file"** → type `src/App.jsx` → paste the full content from `index.jsx` → commit.

Then **delete the old `index.jsx`** from the root (click it → trash icon → commit).

**Your final repo structure should be:**
```
agentslock/
├── index.html        ✅ you have this
├── package.json      ✅ you have this
├── vite.config.js    ✅ you have this
├── .gitignore        ✅ you have this
├── README.md         ✅ you have this
├── LICENSE           ✅ you have this
└── src/
    ├── main.jsx      ❌ missing — create this
    └── App.jsx       ❌ missing — create from index.jsx
