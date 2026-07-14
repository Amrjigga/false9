import { getDb } from "./firebase-admin";

export async function readOrders() {
  const snapshot = await getDb()
    .collection("orders")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createOrder(payload) {
  const now = new Date().toISOString();
  const order = {
    id: `F9-${Date.now().toString(36).toUpperCase()}`,
    status: "new",
    paymentMethod: "Cash on delivery",
    country: "Egypt",
    createdAt: now,
    updatedAt: now,
    ...payload
  };

  await getDb().collection("orders").doc(order.id).set(order);
  return order;
}

export async function updateOrderStatus(id, status) {
  const allowed = ["new", "test", "confirmed", "out-for-delivery", "completed", "cancelled"];
  if (!allowed.includes(status)) {
    return null;
  }

  const orderRef = getDb().collection("orders").doc(id);
  const snapshot = await orderRef.get();

  if (!snapshot.exists) {
    return null;
  }

  const order = {
    id: snapshot.id,
    ...snapshot.data(),
    status,
    updatedAt: new Date().toISOString()
  };

  await orderRef.update({
    status: order.status,
    updatedAt: order.updatedAt
  });

  return order;
}

export async function deleteOrder(id) {
  const orderRef = getDb().collection("orders").doc(id);
  const snapshot = await orderRef.get();

  if (!snapshot.exists) {
    return false;
  }

  await orderRef.delete();
  return true;
}
