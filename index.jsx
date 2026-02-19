// FILE: apps/web/pages/index.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8787";

function money(n, ccy) {
  const v = Number(n);
  if (!Number.isFinite(v)) return `${n}`;
  return `${v.toFixed(2)} ${ccy || ""}`.trim();
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [watch, setWatch] = useState(new Set());
  const [log, setLog] = useState([]);
  const [input, setInput] = useState("AK-47 | Redline (Field-Tested)");

  const wsRef = useRef(null);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }, [items]);

  function addLog(s) {
    setLog((prev) => [s, ...prev].slice(0, 20));
  }

  async function refreshItems() {
    const res = await fetch(`${API}/items`);
    const data = await res.json();
    setItems(data.items || []);
  }

  async function refreshWatch() {
    const res = await fetch(`${API}/watchlist`);
    const data = await res.json();
    setWatch(new Set(data.keys || []));
  }

  async function track() {
    const res = await fetch(`${API}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketHashName: input })
    });
    const data = await res.json();
    if (!data.ok) return addLog(`❌ Track failed: ${JSON.stringify(data.error)}`);
    addLog(`✅ Tracking: ${data.item.name} @ ${money(data.item.price, data.item.currency)}`);
    await refreshItems();
  }

  async function toggleWatch(key) {
    const next = new Set(watch);
    if (next.has(key)) next.delete(key);
    else next.add(key);

    setWatch(next);

    await fetch(`${API}/watchlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys: Array.from(next) })
    });
  }

  useEffect(() => {
    refreshItems();
    refreshWatch();

    const ws = new WebSocket(API.replace("http", "ws") + "/ws");
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);

        if (msg.type === "hello") {
          setItems(msg.items || []);
          setWatch(new Set(msg.watchlist || []));
          addLog("🔌 Realtime connected");
        }

        if (msg.type === "price_update") {
          setItems((prev) => {
            const map = new Map(prev.map((x) => [x.key, x]));
            map.set(msg.item.key, msg.item);
            return Array.from(map.values());
          });
        }

        if (msg.type === "alert") {
          addLog(`🚨 ${msg.message}`);
        }
      } catch {}
    };

    ws.onclose = () => addLog("⚠️ Realtime disconnected");
    ws.onerror = () => addLog("⚠️ Realtime error");

    return () => ws.close();
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 20, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>CS2 Speed (Legal)</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Realtime price tracking + alerts. Manual trading only (no bots).
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: 10, fontSize: 14 }}
          placeholder='e.g. "AK-47 | Redline (Field-Tested)"'
        />
        <button onClick={track} style={{ padding: "10px 14px", fontSize: 14 }}>
          Track
        </button>
        <button onClick={() => { refreshItems(); refreshWatch(); }} style={{ padding: "10px 14px", fontSize: 14 }}>
          Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div>
          <h3 style={{ margin: "12px 0" }}>Tracked items</h3>

          <div style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px 90px", padding: 10, background: "#f7f7f7", fontWeight: 600 }}>
              <div>Item</div>
              <div>Price</div>
              <div>Updated</div>
              <div>Alert</div>
            </div>

            {sorted.map((it) => (
              <div key={it.key} style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px 90px", padding: 10, borderTop: "1px solid #eee" }}>
                <div style={{ fontWeight: 600 }}>{it.name}</div>
                <div>{money(it.price, it.currency)}</div>
                <div style={{ opacity: 0.7 }}>{new Date(it.ts).toLocaleTimeString()}</div>
                <div>
                  <button onClick={() => toggleWatch(it.key)} style={{ padding: "6px 10px" }}>
                    {watch.has(it.key) ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            ))}

            {sorted.length === 0 && <div style={{ padding: 12, opacity: 0.7 }}>No items tracked yet.</div>}
          </div>
        </div>

        <div>
          <h3 style={{ margin: "12px 0" }}>Live log</h3>
          <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10, minHeight: 240 }}>
            {log.length === 0 ? (
              <div style={{ opacity: 0.7 }}>Waiting…</div>
            ) : (
              log.map((l, i) => (
                <div key={i} style={{ fontSize: 13, marginBottom: 6 }}>
                  {l}
                </div>
              ))
            )}
          </div>

          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 10 }}>
            Tip: fund wallet + stay logged in. Alerts give you the edge legally.
          </p>
        </div>
      </div>
    </div>
  );
}
