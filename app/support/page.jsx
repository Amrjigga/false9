"use client";

import { ArrowLeft, ChevronDown, Instagram, Mail } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Shipping time?",
    answer: "3-5 business days after confirmation."
  },
  {
    question: "Refunds?",
    answer: "No refunds unless it arrives damaged. Send order details and photos."
  },
  {
    question: "Sizing?",
    answer: "Use the size guide. Measure a tee you already like."
  }
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main className="store-shell product-page">
      <header className="topbar">
        <a className="brand" href="/">
          <img className="brand-logo" src="/false9-logo.png" alt="false9 logo" />
        </a>
        <nav className="nav-links" aria-label="Support navigation">
          <a href="/#shop">Shop</a>
          <a href="/cart">Cart</a>
        </nav>
      </header>

      <section className="support-page">
        <a className="secondary-btn back-link" href="/">
          <ArrowLeft size={18} />
          Back
        </a>

        <div className="support-panel">
          <p className="eyebrow">support</p>
          <h1>Help</h1>
          <p className="detail-copy">Sizing, orders, delivery.</p>

          <div className="support-links">
            <a className="support-link" href="mailto:support@false9.store">
              <Mail size={22} />
              <span>Email</span>
              <strong>support@false9.store</strong>
            </a>
            <a className="support-link" href="https://instagram.com/false9.store" target="_blank" rel="noreferrer">
              <Instagram size={22} />
              <span>Instagram</span>
              <strong>@false9.store</strong>
            </a>
          </div>

          <div className="support-faq" aria-label="Support questions and answers">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div className="faq-item" key={faq.question}>
                  <button
                    aria-expanded={isOpen}
                    className="faq-question"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    type="button"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={isOpen ? "open" : ""} size={18} />
                  </button>
                  {isOpen && (
                    <p className="faq-answer">{faq.answer}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
