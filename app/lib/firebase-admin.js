import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getEnv(name) {
  return process.env[name] || process.env[name.toUpperCase()];
}

function getPrivateKey() {
  const key = getEnv("private_key");

  return key
    ?.trim()
    .replace(/^"/, "")
    .replace(/",?$/, "")
    .replace(/\\n/g, "\n")
    .trim();
}

function getFirebaseApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  const projectId = getEnv("project_id");
  const clientEmail = getEnv("client_email");
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin credentials in .env.local.");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    })
  });
}

export function getDb() {
  return getFirestore(getFirebaseApp());
}
