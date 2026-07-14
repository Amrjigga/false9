"use client";

import { ArrowLeft, Check, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { products, sizes } from "../../products";

const sizeGuide = [
  { size: "S", width: 56, length: 70, weight: "55-65 kg" },
  { size: "M", width: 59, length: 72, weight: "65-75 kg" },
  { size: "L", width: 62, length: 73, weight: "75-85 kg" },
  { size: "XL", width: 65, length: 75, weight: "85-95 kg" },
  { size: "2XL", width: 67, length: 77, weight: "95-110 kg" }
];

export default function ProductPage({ params }) {
  const product = products.find((item) => item.id === params.id);
  const [size, setSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <main className="store-shell product-page">
        <header className="topbar">
          <a className="brand" href="/">
            <img className="brand-logo" src="/false9-logo.png" alt="false9 logo" />
          </a>
        </header>
        <section className="product-detail">
          <div className="detail-panel">
            <h1>Not found</h1>
            <p className="detail-copy">Not in this drop.</p>
            <a className="primary-btn" href="/#shop">Shop</a>
          </div>
        </section>
      </main>
    );
  }

  function buyNow() {
    const cart = JSON.parse(window.localStorage.getItem("false9-cart") || "[]");
    const existing = cart.find((item) => item.productId === product.id && item.size === size);
    const selectedQuantity = Math.min(5, Math.max(1, Number(quantity || 1)));

    if (existing) {
      existing.quantity = Math.min(5, Number(existing.quantity) + selectedQuantity);
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        size,
        quantity: selectedQuantity
      });
    }

    window.localStorage.setItem("false9-cart", JSON.stringify(cart));
    window.location.href = "/cart";
  }

  const productImages = product.images || [];

  function showPreviousImage() {
    setActiveImage((current) => (
      current === 0 ? productImages.length - 1 : current - 1
    ));
  }

  function showNextImage() {
    setActiveImage((current) => (
      current === productImages.length - 1 ? 0 : current + 1
    ));
  }

  return (
    <main className="store-shell product-page">
      <div className="pitch-bg" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <header className="topbar">
        <a className="brand" href="/">
          <img className="brand-logo" src="/false9-logo.png" alt="false9 logo" />
        </a>
        <nav className="nav-links" aria-label="Product navigation">
          <a href="/#shop">Shop</a>
          <a href="/support">Support</a>
          <a href="/cart">Cart</a>
        </nav>
      </header>

      <section className="product-detail">
        <a className="secondary-btn back-link" href="/#shop">
          <ArrowLeft size={18} />
          Back
        </a>

        <div className="product-summary">
          <div className="product-gallery">
            {productImages.length ? (
              <>
                <div className="detail-image">
                  <img className="product-photo" src={productImages[activeImage].src} alt={productImages[activeImage].alt} />
                </div>

                {productImages.length > 1 && (
                  <div className="gallery-controls" aria-label="Product image controls">
                    <button className="icon-btn" type="button" onClick={showPreviousImage} aria-label="Previous product photo">
                      <ChevronLeft size={18} />
                    </button>

                    <div className="gallery-dots" aria-label="Product photo position">
                      {productImages.map((image, index) => (
                        <button
                          aria-label={`Show product photo ${index + 1}`}
                          aria-pressed={activeImage === index}
                          className={`gallery-dot ${activeImage === index ? "active" : ""}`}
                          key={image.src}
                          onClick={() => setActiveImage(index)}
                          type="button"
                        />
                      ))}
                    </div>

                    <button className="icon-btn" type="button" onClick={showNextImage} aria-label="Next product photo">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="detail-image">
                <div className="shirt-preview detail-shirt" style={{ color: product.color }}>
                  <span style={{ color: product.accent }}>f9</span>
                </div>
              </div>
            )}
          </div>

          <div className="summary-copy">
            <p className="eyebrow">shirt</p>
            <h1>{product.name}</h1>
            <p className="detail-copy">{product.description}</p>
            <div className="detail-price">
              <strong>{product.price} EGP</strong>
              <span>
                <Check size={16} />
                in stock
              </span>
            </div>
          </div>
        </div>

        <div className="detail-panel">
          <div className="confirmation-head">
            <p className="eyebrow">select</p>
            <h2>Pick yours</h2>
          </div>
          <div className="order-form detail-form">
            <label>
              Shirt
              <input readOnly value={product.name} />
            </label>
            <label>
              Description
              <textarea readOnly value={product.description} />
            </label>
            <div className="field-grid">
              <label>
                Size name
                <select value={size} onChange={(event) => setSize(event.target.value)}>
                  {sizes.map((size) => <option key={size}>{size}</option>)}
                </select>
              </label>
              <label>
                Quantity
                <div className="quantity-choices">
                  {[1, 2, 3, 4, 5].map((choice) => (
                    <button
                      aria-pressed={Number(quantity) === choice}
                      className={`quantity-choice ${Number(quantity) === choice ? "selected" : ""}`}
                      key={choice}
                      onClick={() => setQuantity(choice)}
                      type="button"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <button className="primary-btn full-width" onClick={buyNow}>
              <ShoppingBag size={18} />
              Add to cart
            </button>

            <div className="size-guide" aria-label="Size guide">
              <div className="size-guide-head">
                <span>Size</span>
                <span>Width</span>
                <span>Length</span>
                <span>Avg.</span>
              </div>
              {sizeGuide.map((item) => (
                <div className="size-guide-row" key={item.size}>
                  <strong>{item.size}</strong>
                  <span>{item.width}</span>
                  <span>{item.length}</span>
                  <span>{item.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
