"use client";

export function CheckoutShipping({ itemCount }: { itemCount: number }) {
  return (
    <div className="border-t pt-4 mt-4" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium" style={{ color: "#e0e0e0" }}>Shipping</p>
          <p className="text-xs mt-0.5" style={{ color: "#a0a0a0" }}>
            {itemCount} {itemCount === 1 ? "item" : "items"} — Ships from Hawaii
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold" style={{ color: "#5CC5C3" }}>FREE</p>
        </div>
      </div>
    </div>
  );
}

export function ShippingLineItem() {
  return (
    <div className="flex justify-between text-sm py-1">
      <span style={{ color: "#a0a0a0" }}>Shipping</span>
      <span style={{ color: "#5CC5C3" }}>$0.00</span>
    </div>
  );
}
