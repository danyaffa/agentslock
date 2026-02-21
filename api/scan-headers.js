export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing url" });

  try {
    let target = url.trim();
    if (!target.startsWith("http")) target = "https://" + target;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(target, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "AgentsLock Security Scanner/4.0" },
    });
    clearTimeout(timeout);

    // Extract all response headers
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    return res.status(200).json({
      status: response.status,
      headers,
      url: response.url || target,
    });
  } catch (e) {
    return res.status(502).json({ error: e.message || "Failed to fetch target URL" });
  }
}
