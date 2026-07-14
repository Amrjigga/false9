"use client";

import { Headphones, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { products, sizes } from "./products";

function addToCart(product, size) {
  const cart = JSON.parse(window.localStorage.getItem("false9-cart") || "[]");
  const existing = cart.find((item) => item.productId === product.id && item.size === size);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      size,
      quantity: 1
    });
  }

  window.localStorage.setItem("false9-cart", JSON.stringify(cart));
  window.location.href = "/cart";
}

export default function HomePage() {
  const [selectedSizes, setSelectedSizes] = useState(
    () => Object.fromEntries(products.map((product) => [product.id, "M"]))
  );

  return (
    <main className="store-shell">
      <div className="pitch-bg" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <header className="topbar">
        <a className="brand" href="#">
          <img className="brand-logo" src="/false9-logo.png" alt="false9 logo" />
        </a>
        <nav className="nav-links" aria-label="Store navigation">
          <a href="#shop">Shop</a>
          <a href="/support">Support</a>
          <a href="/cart">Cart</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>false9</h1>
          <div className="tag-row" aria-label="Collection highlights">
            <span>drop 01</span>
            <span>football streetwear</span>
            <span>egypt</span>
          </div>
          <p>Football tees. Heavy fit. Built for the street.</p>
          <div className="hero-actions">
            <a className="primary-btn" href="#shop">
              <ShoppingBag size={18} />
              Shop
            </a>
            <a className="secondary-btn" href="/cart">Cart</a>
            <a className="secondary-btn" href="/support">
              <Headphones size={18} />
              Support
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="shop">
        <div className="section-head">
          <div>
            <p className="eyebrow">drop 01</p>
            <h2>Current shirts</h2>
          </div>
          <p>Three graphics. One black tee.</p>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <a className={`product-image ${product.images?.[1] ? "has-hover-photo" : ""}`} href={`/products/${product.id}`} aria-label={`View ${product.name}`}>
                {product.images?.[0] ? (
                  <>
                    <img className="product-photo primary-photo" src={product.images[0].src} alt={product.images[0].alt} />
                    {product.images[1] && (
                      <img className="product-photo hover-photo" src={product.images[1].src} alt={product.images[1].alt} />
                    )}
                  </>
                ) : (
                  <div className="shirt-preview" style={{ color: product.color }}>
                    <span style={{ color: product.accent }}>f9</span>
                  </div>
                )}
              </a>
              <div className="product-body">
                <div className="product-title">
                  <span>{product.name}</span>
                  <span>{product.price} EGP</span>
                </div>
                <p className="product-meta">{product.description}</p>
                <div className="product-options" aria-label="Available sizes">
                  {sizes.map((size) => (
                    <button
                      aria-pressed={selectedSizes[product.id] === size}
                      className={`size-chip ${selectedSizes[product.id] === size ? "selected" : ""}`}
                      key={size}
                      onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: size })}
                      type="button"
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <a className="primary-btn full-width" href={`/products/${product.id}`}>
                  <ShoppingBag size={18} />
                  View
                </a>
                <button className="secondary-btn full-width" onClick={() => addToCart(product, selectedSizes[product.id])}>
                  Add {selectedSizes[product.id]} to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="info-band" id="support">
        <div>
          <h3>No refunds</h3>
          <p>Final sale unless damaged.</p>
        </div>
        <div>
          <h3>Egypt only</h3>
          <p>Shipping inside Egypt.</p>
        </div>
        <div>
          <h3>Support</h3>
          <p>Email or DM us.</p>
        </div>
      </section>
    </main>
  );
}
