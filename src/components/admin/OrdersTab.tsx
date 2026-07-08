"use client";

import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  productId: string;
  title: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  stripeSessionId: string | null;
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  shippingCost: number;
  shippingMethod: string;
  taxAmount: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const bg = "#1a1a2e";
const card = "#16213e";
const accent = "#7FDBDA";
const text = "#e0e0e0";
const textDim = "#a0a0a0";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const statusColor: Record<string, string> = {
  paid: "#2ecc71",
  pending: "#f39c12",
  refunded: "#e74c3c",
  cancelled: "#e74c3c",
};

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p style={{ color: textDim, padding: 24 }}>Loading orders…</p>;
  }

  if (error) {
    return (
      <div style={{ background: `#e74c3c22`, border: "1px solid #e74c3c44", borderRadius: 8, padding: 16, color: "#e74c3c" }}>
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: textDim }}>
        <p style={{ fontSize: 18, marginBottom: 8 }}>No orders yet</p>
        <p style={{ fontSize: 14 }}>Orders will show up here as soon as a checkout completes.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ color: textDim, fontSize: 14, marginBottom: 4 }}>{orders.length} orders</p>
      {orders.map((order) => {
        const isOpen = expanded === order.id;
        return (
          <div key={order.id} style={{ background: card, borderRadius: 12, padding: 16 }}>
            <div
              style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
              onClick={() => setExpanded(isOpen ? null : order.id)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h3 style={{ color: text, fontSize: 16, margin: 0 }}>{order.customerName || "Unknown customer"}</h3>
                  <span style={{ color: textDim, fontSize: 12 }}>{order.customerEmail}</span>
                </div>
                <p style={{ color: textDim, fontSize: 12, margin: 0 }}>
                  {new Date(order.createdAt).toLocaleString()} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    background: `${statusColor[order.status] || textDim}22`,
                    color: statusColor[order.status] || textDim,
                  }}
                >
                  {order.status.toUpperCase()}
                </span>
                <span style={{ color: accent, fontWeight: 600, fontSize: 15 }}>{formatCents(order.total)}</span>
                <span style={{ color: textDim, fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {isOpen && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${accent}22` }}>
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", color: textDim, fontSize: 12, paddingBottom: 6 }}>Item</th>
                      <th style={{ textAlign: "center", color: textDim, fontSize: 12, paddingBottom: 6 }}>Qty</th>
                      <th style={{ textAlign: "right", color: textDim, fontSize: 12, paddingBottom: 6 }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ color: text, fontSize: 13, padding: "4px 0", borderTop: `1px solid ${accent}11` }}>{item.title}</td>
                        <td style={{ color: text, fontSize: 13, padding: "4px 0", textAlign: "center", borderTop: `1px solid ${accent}11` }}>{item.quantity}</td>
                        <td style={{ color: text, fontSize: 13, padding: "4px 0", textAlign: "right", borderTop: `1px solid ${accent}11` }}>{formatCents(item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: textDim, marginBottom: 2 }}>
                  <span>Subtotal</span><span>{formatCents(order.subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: textDim, marginBottom: 2 }}>
                  <span>Shipping ({order.shippingMethod})</span><span>{formatCents(order.shippingCost)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: textDim, marginBottom: 8 }}>
                  <span>Tax</span><span>{formatCents(order.taxAmount)}</span>
                </div>

                <p style={{ color: textDim, fontSize: 12, marginBottom: 2 }}>Ship to:</p>
                <p style={{ color: text, fontSize: 13, margin: 0 }}>
                  {order.shippingAddress?.name}<br />
                  {order.shippingAddress?.line1}
                  {order.shippingAddress?.line2 ? <>, {order.shippingAddress.line2}</> : null}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
                  {order.shippingAddress?.country}
                </p>

                {order.stripeSessionId && (
                  <p style={{ color: textDim, fontSize: 11, marginTop: 12 }}>
                    Stripe session: {order.stripeSessionId}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
