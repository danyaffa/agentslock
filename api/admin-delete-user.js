import admin from "firebase-admin";

// Initialize Firebase Admin (reuse across invocations)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  // CORS headers — restrict to app origin only
  const allowedOrigin = process.env.VITE_APP_URL || "https://agentslock.com";
  const origin = req.headers.origin;
  if (origin === allowedOrigin || origin === allowedOrigin.replace("https://", "https://www.")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Verify the caller is authenticated and is the admin
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Missing auth token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const adminEmail = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL;
    if (!adminEmail || decoded.email !== adminEmail) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    // Prevent admin from deleting themselves
    if (uid === decoded.uid) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Delete from Firebase Auth
    await admin.auth().deleteUser(uid);

    // Delete from Firestore
    await admin.firestore().collection("users").doc(uid).delete();

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("Admin delete user error:", e);
    const status = e.code === "auth/user-not-found" ? 404 : 500;
    return res.status(status).json({ error: e.message });
  }
}
