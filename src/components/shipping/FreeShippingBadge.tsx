"use client";

export function FreeShippingBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
      style={{
        backgroundColor: "rgba(127, 219, 218, 0.15)",
        color: "#5CC5C3",
        border: "1px solid rgba(127, 219, 218, 0.3)",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
      Free Shipping from Hawaii
    </div>
  );
}

export function FreeShippingTag() {
  return (
    <span className="text-xs font-medium" style={{ color: "#5CC5C3" }}>
      Free Shipping
    </span>
  );
}
