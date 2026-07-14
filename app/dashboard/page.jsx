"use client";

import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const statuses = [
  ["new", "New"],
  ["test", "Test"],
  ["confirmed", "Confirmed"],
  ["out-for-delivery", "Out for delivery"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"]
];

function statusClass(status) {
  return `status-pill status-${status}`;
}

function orderDisplayTotal(order) {
  return order.status === "test" ? 0 : Number(order.total || 0);
}

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    const response = await fetch("/api/orders", { cache: "no-store" });
    const data = await response.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    const response = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      const data = await response.json();
      setOrders((current) => current.map((order) => (order.id === id ? data.order : order)));
    }
  }

  async function deleteOrder(id) {
    const confirmed = window.confirm(`Delete order ${id}?`);

    if (!confirmed) return;

    const response = await fetch(`/api/orders/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      setOrders((current) => current.filter((order) => order.id !== id));
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + orderDisplayTotal(order), 0);

    return {
      total: orders.length,
      newOrders: orders.filter((order) => order.status === "new").length,
      active: orders.filter((order) => ["confirmed", "out-for-delivery"].includes(order.status)).length,
      revenue: totalRevenue
    };
  }, [orders]);

  return (
    <main className="dashboard-shell">
      <div className="dashboard-top">
        <a className="brand" href="/">
          <img className="brand-logo" src="/false9-logo.png" alt="false9 logo" />
        </a>
        <div className="hero-actions">
          <a className="secondary-btn" href="/">
            <ArrowLeft size={18} />
            Store
          </a>
          <a className="secondary-btn" href="/cart">Cart</a>
          <button className="icon-btn" aria-label="Refresh orders" onClick={loadOrders}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <section className="dashboard-head">
        <p className="eyebrow">ops</p>
        <h1>Orders</h1>
        <p>Orders, addresses, totals, status.</p>
      </section>

      <section className="stats" aria-label="Order summary">
        <div className="stat">
          <strong>{stats.total}</strong>
          <span>Orders</span>
        </div>
        <div className="stat">
          <strong>{stats.newOrders}</strong>
          <span>New</span>
        </div>
        <div className="stat">
          <strong>{stats.active}</strong>
          <span>Active</span>
        </div>
        <div className="stat">
          <strong>{stats.revenue}</strong>
          <span>EGP value</span>
        </div>
      </section>

      <section className="orders-table">
        {loading ? (
          <div className="empty">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="empty">No orders yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Item</th>
                <th>Address</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.id}</strong>
                    <br />
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <strong>{order.customerName}</strong>
                    <br />
                    Phone: {order.phone}
                    <br />
                    WhatsApp: {order.whatsapp}
                  </td>
                  <td>
                    <strong>{order.productName}</strong>
                    <br />
                    {order.items ? order.items.map((item) => (
                      <span key={`${order.id}-${item.productId}-${item.size}`}>
                        {item.productName}: Size {item.size} / Qty {item.quantity}
                        <br />
                      </span>
                    )) : <>Size {order.size} / Qty {order.quantity}<br /></>}
                  </td>
                  <td>
                    <strong>{order.governorate}</strong>, {order.city}
                    <br />
                    {order.address}
                    {order.notes ? (
                      <>
                        <br />
                        Notes: {order.notes}
                      </>
                    ) : null}
                  </td>
                  <td>
                    {orderDisplayTotal(order)} EGP
                    {order.shippingFee ? (
                      <>
                        <br />
                        <span className="table-note">
                          Shipping: {order.shippingFee} EGP
                        </span>
                      </>
                    ) : null}
                  </td>
                  <td>
                    <span className={statusClass(order.status)}>
                      {statuses.find(([value]) => value === order.status)?.[1] || order.status}
                    </span>
                  </td>
                  <td>
                    <select className="status-select" value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>
                      {statuses.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="delete-order-btn" type="button" onClick={() => deleteOrder(order.id)}>
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
