"use client";

import { ArrowLeft, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { countryCodes, governorates, initialOrderForm } from "../order-options";
import { getShippingFee } from "../shipping";

function readCart() {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem("false9-cart") || "[]");
}

function writeCart(cart) {
  window.localStorage.setItem("false9-cart", JSON.stringify(cart));
}

function toLocalPhoneDigits(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function toWhatsappDigits(value) {
  return value.replace(/\D/g, "").slice(0, 15);
}

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState(initialOrderForm);
  const [cashOnDelivery, setCashOnDelivery] = useState(false);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [showGovernorates, setShowGovernorates] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  useEffect(() => {
    setCart(readCart());
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
    [cart]
  );
  const hasGovernorate = Boolean(form.governorate);
  const shippingFee = hasGovernorate ? getShippingFee(form.governorate) : 0;
  const payableShippingFee = cart.length > 0 && hasGovernorate ? shippingFee : 0;
  const isFarGovernorate = hasGovernorate && shippingFee === 185;
  const total = subtotal + payableShippingFee;

  function updateQuantity(index, quantity) {
    const next = cart.map((item, itemIndex) => (
      itemIndex === index ? { ...item, quantity: Math.min(5, Math.max(1, Number(quantity || 1))) } : item
    ));
    setCart(next);
    writeCart(next);
  }

  function removeItem(index) {
    const next = cart.filter((_, itemIndex) => itemIndex !== index);
    setCart(next);
    writeCart(next);
  }

  function submitOrder(event) {
    event.preventDefault();

    if (cart.length === 0) {
      setStatus({ type: "error", message: "Cart is empty." });
      return;
    }

    if (!cashOnDelivery) {
      setStatus({ type: "error", message: "Select Cash on Delivery." });
      return;
    }

    if (!form.governorate) {
      setStatus({ type: "error", message: "Select governorate." });
      return;
    }

    if (form.phone.length !== 10) {
      setStatus({ type: "error", message: "Phone number must be exactly 10 digits after +20." });
      return;
    }

    if (form.whatsapp && (form.whatsapp.length < 6 || form.whatsapp.length > 15)) {
      setStatus({ type: "error", message: "WhatsApp number must be 6 to 15 digits after the country code." });
      return;
    }

    setStatus({ type: "idle", message: "" });
    setShowOrderConfirm(true);
  }

  async function placeOrder() {
    setShowOrderConfirm(false);
    setStatus({ type: "loading", message: "Saving..." });

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items: cart })
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus({ type: "error", message: data.error || "Order failed." });
      return;
    }

    window.localStorage.removeItem("false9-cart");
    setCart([]);
    setStatus({
      type: "success",
      message: `Order ${data.order.id} saved.`
    });
  }

  return (
    <main className="store-shell product-page">
      <header className="topbar">
        <a className="brand" href="/">
          <img className="brand-logo" src="/false9-logo.png" alt="false9 logo" />
        </a>
        <nav className="nav-links" aria-label="Cart navigation">
          <a href="/#shop">Shop</a>
          <a href="/support">Support</a>
        </nav>
      </header>

      <section className="cart-page">
        <a className="secondary-btn back-link" href="/#shop">
          <ArrowLeft size={18} />
          Keep shopping
        </a>

        <div className="cart-panel">
          <p className="eyebrow">cart</p>
          <h1>Cart</h1>
          {cart.length === 0 ? (
            <div className="empty">Cart is empty.</div>
          ) : (
            <div className="cart-items">
              {cart.map((item, index) => (
                <div className="cart-item" key={`${item.productId}-${item.size}-${index}`}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>Size {item.size} / {item.price} EGP</span>
                  </div>
                  <div className="quantity-stepper">
                    {[1, 2, 3, 4, 5].map((quantity) => (
                      <button
                        aria-pressed={Number(item.quantity) === quantity}
                        className={`quantity-choice ${Number(item.quantity) === quantity ? "selected" : ""}`}
                        key={quantity}
                        onClick={() => updateQuantity(index, quantity)}
                        type="button"
                      >
                        {quantity}
                      </button>
                    ))}
                    <button className="icon-btn" onClick={() => removeItem(index)} aria-label="Remove item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="cart-total">
            <span>Subtotal</span>
            <strong>{subtotal} EGP</strong>
          </div>
          <div className="cart-total shipping-line">
            <span>Fast shipping</span>
            <strong>{payableShippingFee} EGP</strong>
          </div>
          <div className="cart-total grand-total">
            <span>Total</span>
            <strong>{total} EGP</strong>
          </div>
        </div>

        <div className="detail-panel">
          <div className="confirmation-head">
            <p className="eyebrow">checkout</p>
            <h2>Cash on delivery</h2>
            <p>Details and address.</p>
          </div>
          <form className="order-form detail-form" onSubmit={submitOrder}>
            {status.message && (
              <div className={`notice ${status.type === "error" ? "error" : ""}`}>{status.message}</div>
            )}

            <div className="field-grid">
              <label>
                Name
                <input required value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} />
              </label>
              <label>
                Phone number
                <div className="phone-input">
                  <span>+20</span>
                  <input
                    required
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    placeholder="10 digits"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: toLocalPhoneDigits(event.target.value) })}
                  />
                </div>
              </label>
            </div>

            <label>
              WhatsApp number if different
              <div className="phone-input whatsapp-input">
                <select
                  aria-label="WhatsApp country code"
                  value={`${form.whatsappCountryCode}|${form.whatsappCountryLabel}`}
                  onChange={(event) => {
                    const [code, label] = event.target.value.split("|");
                    setForm({
                      ...form,
                      whatsappCountryCode: code,
                      whatsappCountryLabel: label
                    });
                  }}
                >
                  {countryCodes.map((country) => (
                    <option key={`${country.label}-${country.code}`} value={`${country.code}|${country.label}`}>
                      {country.code} {country.label}
                    </option>
                  ))}
                </select>
                <input
                  inputMode="numeric"
                  maxLength={15}
                  pattern="[0-9]{6,15}"
                  placeholder="Leave empty if same as phone"
                  value={form.whatsapp}
                  onChange={(event) => setForm({ ...form, whatsapp: toWhatsappDigits(event.target.value) })}
                />
              </div>
            </label>

            <div className="field-grid">
              <label>
                Governorate
                <div className="governorate-picker">
                  <button
                    className="governorate-trigger"
                    onClick={() => setShowGovernorates(!showGovernorates)}
                    type="button"
                  >
                    {form.governorate || "Select governorate"}
                  </button>
                  <input required className="sr-only" value={form.governorate} onChange={() => {}} tabIndex={-1} />
                  {showGovernorates && (
                    <div className="governorate-menu">
                      {governorates.map((governorate) => (
                        <button
                          className={`governorate-option ${form.governorate === governorate ? "selected" : ""}`}
                          key={governorate}
                          onClick={() => {
                            setForm({ ...form, governorate: form.governorate === governorate ? "" : governorate });
                            setShowGovernorates(false);
                          }}
                          type="button"
                        >
                          {governorate}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </label>
              <label>
                City / Area
                <input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
              </label>
            </div>

            <label>
              Full address inside Egypt
              <textarea required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </label>

            <label>
              Notes
              <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>

            <button
              aria-pressed={cashOnDelivery}
              className={`payment-choice ${cashOnDelivery ? "selected" : ""}`}
              onClick={() => setCashOnDelivery(!cashOnDelivery)}
              type="button"
            >
              <span className="payment-dot" aria-hidden="true" />
              Cash on delivery
            </button>

            <button
              aria-pressed={hasGovernorate}
              className={`payment-choice ${hasGovernorate ? "selected" : ""}`}
              type="button"
            >
              <span className="payment-dot" aria-hidden="true" />
              {hasGovernorate ? `Fast shipping / ${shippingFee} EGP` : "Fast shipping / select governorate"}
            </button>

            {isFarGovernorate && (
              <div className="notice shipping-notice">
                Far governorate. Shipping is 185 EGP. We confirm timing before dispatch.
              </div>
            )}

            <button className="primary-btn full-width" disabled={status.type === "loading" || cart.length === 0 || !cashOnDelivery}>
              <ShoppingBag size={18} />
              Confirm order / {total} EGP
            </button>
          </form>
        </div>
      </section>

      {showOrderConfirm && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal order-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="order-confirm-title">
            <div className="modal-head">
              <div>
                <p className="eyebrow">review</p>
                <h2 id="order-confirm-title">Confirm order</h2>
              </div>
              <button className="icon-btn" type="button" onClick={() => setShowOrderConfirm(false)} aria-label="Close confirmation">
                <X size={18} />
              </button>
            </div>

            <div className="order-confirm-body">
              {cart.map((item, index) => (
                <div className="order-confirm-item" key={`${item.productId}-${item.size}-${index}`}>
                  <strong>{item.name}</strong>
                  <span>Size {item.size}</span>
                  <span>Qty {item.quantity}</span>
                </div>
              ))}

              <div className="order-confirm-total">
                <span>Subtotal</span>
                <strong>{subtotal} EGP</strong>
              </div>

              <div className="order-confirm-total">
                <span>Fast shipping</span>
                <strong>{payableShippingFee} EGP</strong>
              </div>

              <div className="order-confirm-total grand-total">
                <span>Total</span>
                <strong>{total} EGP</strong>
              </div>

              <div className="order-confirm-actions">
                <button className="secondary-btn" type="button" onClick={() => setShowOrderConfirm(false)}>
                  Edit
                </button>
                <button className="primary-btn" type="button" onClick={placeOrder} disabled={status.type === "loading"}>
                  <ShoppingBag size={18} />
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
