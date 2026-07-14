const fs = require("fs");
const path = require("path");
const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const envPath = path.join(process.cwd(), ".env.local");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+)=(.*)$/);

    if (match) {
      process.env[match[1].trim()] = match[2];
    }
  }
}

function env(name) {
  return process.env[name] || process.env[name.toUpperCase()];
}

function privateKey() {
  return env("private_key")
    ?.trim()
    .replace(/^"/, "")
    .replace(/",?$/, "")
    .replace(/\\n/g, "\n")
    .trim();
}

async function main() {
  const projectId = env("project_id");
  const clientEmail = env("client_email");
  const key = privateKey();

  if (!projectId || !clientEmail || !key) {
    throw new Error("Missing project_id, client_email, or private_key in .env.local.");
  }

  const app = getApps()[0] || initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: key
    })
  });
  const db = getFirestore(app);
  const ref = db.collection("_smoke_tests").doc("local");

  await ref.set({
    ok: true,
    createdAt: new Date().toISOString()
  });

  const snapshot = await ref.get();
  console.log(JSON.stringify({ exists: snapshot.exists, ok: snapshot.data()?.ok }));
}

Promise.race([
  main(),
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Firestore smoke test timed out after 15s.")), 15000);
  })
]).catch((error) => {
  console.error(error.code || "ERROR", error.message);
  process.exit(1);
});
