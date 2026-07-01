"use client";

import { useState, useEffect } from "react";
import { ShippingStatusBadge } from "@/components/admin/ShippingStatusBadge";
import { ShippingSummaryPanel } from "@/components/admin/ShippingSummaryPanel";

interface Product {
  id: string;
  title: string;
  type: string;
  imageUrl: string;
  hasShippingData: boolean;
  shipping: {
    weightOz: number;
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    shippingClassId: string;
    requiresSeparateBox: boolean;
    isOversized: boolean;
    price: number;
  } | null;
  missing: string[];
}

const SHIPPING_CLASSES = [
  { id: "small-print", label: "Small Print (up to 16x20)" },
  { id: "medium-painting", label: "Medium Painting (up to 24x36)" },
  { id: "large-painting", label: "Large Painting (36-60\")" },
  { id: "oversized", label: "Oversized (60\"+, freight)" },
];

const bg = "#1a1a2e";
const card = "#16213e";
const accent = "#7FDBDA";
const text = "#e0e0e0";
const textDim = "#a0a0a0";

export default function ShippingAdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function login() {
    setLoading(true);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.ok) {
      setAuthed(true);
      loadProducts();
    } else {
      setMessage("Wrong password");
    }
    setLoading(false);
  }

  async function loadProducts() {
    const res = await fetch("/api/admin/shipping", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
  }

  async function saveShipping(productId: string, formData: Record<string, unknown>) {
    setLoading(true);
    const res = await fetch("/api/admin/shipping", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ productId, ...formData }),
    });
    if (res.ok) {
      setMessage("Saved!");
      setEditingId(null);
      loadProducts();
    } else {
      const err = await res.json();
      setMessage(err.error || "Save failed");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 2000);
  }

  const inputStyle = {
    background: bg,
    color: text,
    border: `1px solid ${accent}33`,
    borderRadius: 6,
    padding: "8px 12px",
    width: "100%",
    fontSize: 14,
  };

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
        <div style={{ background: card, borderRadius: 12, padding: 40, width: 360 }}>
          <h1 style={{ color: accent, fontSize: 24, marginBottom: 8 }}>Shipping Manager</h1>
          <p style={{ color: textDim, marginBottom: 24, fontSize: 14 }}>Admin authentication required</p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `1px solid ${accent}33`, background: bg, color: text, fontSize: 16, marginBottom: 16 }}
          />
          <button onClick={login} disabled={loading} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "none", background: accent, color: "#1a1a2e", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "..." : "Log In"}
          </button>
          {message && <p style={{ color: "#ff6b6b", marginTop: 12, textAlign: "center" }}>{message}</p>}
        </div>
      </div>
    );
  }

  const ready = products.filter((p) => p.hasShippingData).length;
  const total = products.length;

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ color: accent, fontSize: 28 }}>Shipping Manager</h1>
            <p style={{ color: textDim, fontSize: 14, marginTop: 4 }}>
              {ready}/{total} products ship-ready
            </p>
          </div>
          <a href="/admin" style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${accent}`, background: "transparent", color: accent, cursor: "pointer", fontWeight: 500, textDecoration: "none" }}>
            Back to Artworks
          </a>
        </div>

        {message && (
          <div style={{ background: `${accent}22`, border: `1px solid ${accent}44`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: accent }}>
            {message}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {products.map((p) => (
            <div key={p.id} style={{ background: card, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <img src={p.imageUrl} alt={p.title} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ color: text, fontSize: 16, margin: 0 }}>{p.title}</h3>
                    <span style={{ color: textDim, fontSize: 12 }}>({p.type})</span>
                  </div>
                  {p.hasShippingData && p.shipping ? (
                    <p style={{ color: textDim, fontSize: 12, margin: 0 }}>
                      {p.shipping.weightOz}oz | {p.shipping.lengthIn}x{p.shipping.widthIn}x{p.shipping.heightIn}" | {p.shipping.shippingClassId} | ${((p.shipping.price || 0) / 100).toFixed(2)}
                    </p>
                  ) : (
                    <p style={{ color: "#e74c3c", fontSize: 12, margin: 0 }}>Missing: {p.missing.join(", ")}</p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    background: p.hasShippingData ? "#2ecc7122" : "#e74c3c22",
                    color: p.hasShippingData ? "#2ecc71" : "#e74c3c",
                  }}>
                    {p.hasShippingData ? "READY" : "INCOMPLETE"}
                  </span>
                  <button
                    onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                    style={{ padding: "6px 16px", borderRadius: 6, border: `1px solid ${accent}44`, background: "transparent", color: accent, cursor: "pointer", fontSize: 12 }}
                  >
                    {editingId === p.id ? "Close" : "Edit"}
                  </button>
                </div>
              </div>

              {editingId === p.id && (
                <ShippingForm
                  product={p}
                  inputStyle={inputStyle}
                  onSave={(data) => saveShipping(p.id, data)}
                  onCancel={() => setEditingId(null)}
                  loading={loading}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShippingForm({
  product,
  inputStyle,
  onSave,
  onCancel,
  loading,
}: {
  product: Product;
  inputStyle: React.CSSProperties;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const s = product.shipping;
  const [weightOz, setWeightOz] = useState(s?.weightOz || 0);
  const [lengthIn, setLengthIn] = useState(s?.lengthIn || 0);
  const [widthIn, setWidthIn] = useState(s?.widthIn || 0);
  const [heightIn, setHeightIn] = useState(s?.heightIn || 0);
  const [shippingClassId, setShippingClassId] = useState(s?.shippingClassId || "");
  const [requiresSeparateBox, setRequiresSeparateBox] = useState(s?.requiresSeparateBox ?? true);
  const [isOversized, setIsOversized] = useState(s?.isOversized ?? false);
  const [price, setPrice] = useState(s?.price ? s.price / 100 : 0);

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${accent}22` }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Weight (oz)</label>
          <input type="number" step="0.1" value={weightOz || ""} onChange={(e) => setWeightOz(parseFloat(e.target.value || "0"))} style={inputStyle} />
          <span style={{ color: textDim, fontSize: 10 }}>= {(weightOz / 16).toFixed(1)} lbs</span>
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Price (USD)</label>
          <input type="number" step="0.01" value={price || ""} onChange={(e) => setPrice(parseFloat(e.target.value || "0"))} style={inputStyle} />
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Shipping Class</label>
          <select value={shippingClassId} onChange={(e) => setShippingClassId(e.target.value)} style={inputStyle}>
            <option value="">Select...</option>
            {SHIPPING_CLASSES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Length (in)</label>
          <input type="number" step="0.1" value={lengthIn || ""} onChange={(e) => setLengthIn(parseFloat(e.target.value || "0"))} style={inputStyle} />
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Width (in)</label>
          <input type="number" step="0.1" value={widthIn || ""} onChange={(e) => setWidthIn(parseFloat(e.target.value || "0"))} style={inputStyle} />
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Height (in)</label>
          <input type="number" step="0.1" value={heightIn || ""} onChange={(e) => setHeightIn(parseFloat(e.target.value || "0"))} style={inputStyle} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, color: text, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={requiresSeparateBox} onChange={(e) => setRequiresSeparateBox(e.target.checked)} /> Separate box
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, color: text, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={isOversized} onChange={(e) => setIsOversized(e.target.checked)} /> Oversized
        </label>
      </div>
      {lengthIn > 0 && widthIn > 0 && heightIn > 0 && (
        <p style={{ color: textDim, fontSize: 11, marginTop: 8 }}>
          Dim weight: {Math.ceil((lengthIn * widthIn * heightIn) / 139 * 16)} oz ({((lengthIn * widthIn * heightIn) / 139).toFixed(1)} lbs) | Billable: {(Math.max(weightOz, Math.ceil((lengthIn * widthIn * heightIn) / 139 * 16)) / 16).toFixed(1)} lbs
        </p>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => onSave({ weightOz, lengthIn, widthIn, heightIn, shippingClassId, requiresSeparateBox, isOversized, price: Math.round(price * 100) })}
          disabled={loading}
          style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: accent, color: "#1a1a2e", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.5 : 1 }}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} style={{ padding: "8px 20px", borderRadius: 6, border: `1px solid ${textDim}`, background: "transparent", color: textDim, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

