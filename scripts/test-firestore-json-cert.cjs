const fs = require("fs");
const { cert, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

async function main() {
  const file = fs.readdirSync(process.cwd()).find((name) => name.includes("firebase-adminsdk") && name.endsWith(".json"));

  if (!file) {
    throw new Error("No Firebase service-account JSON found.");
  }

  const serviceAccount = JSON.parse(fs.readFileSync(file, "utf8"));
  const app = initializeApp({
    credential: cert(serviceAccount)
  });
  const db = getFirestore(app);
  const ref = db.collection("_smoke_tests").doc("json-cert");

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
    setTimeout(() => reject(new Error("Firestore JSON cert test timed out after 15s.")), 15000);
  })
]).catch((error) => {
  console.error(error.code || "ERROR", error.message);
  process.exit(1);
});
