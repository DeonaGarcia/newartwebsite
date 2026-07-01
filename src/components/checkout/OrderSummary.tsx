"use client";

import Image from "next/image";
import type { CartItem } from "@/lib/types/cart";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number | null;
  shippingMethod: string | null;
  taxAmount: number | null;
}

export function OrderSummary({
  items,
  subtotal,
  shippingCost,
  shippingMethod,
  taxAmount,
}: OrderSummaryProps) {
  const total =
    shippingCost !== null && taxAmount !== null
      ? subtotal + shippingCost + taxAmount
      : null;

  return (
    <div className="bg-sand-light p-6 space-y-6">
      <h3 className="font-heading text-2xl text-ocean-deep">Order Summary</h3>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3">
            <div className="relative w-16 h-16 bg-sand flex-shrink-0">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="64px"
              />
              {item.quantity > 1 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-ocean-deep text-pearl text-xs rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ocean-deep truncate">{item.title}</p>
              <p className="text-xs text-driftwood-light uppercase">
                {item.type}
              </p>
            </div>
            {item.price > 0 && (
              <p className="text-sm text-ocean-deep whitespace-nowrap">
                ${((item.price * item.quantity) / 100).toFixed(2)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-driftwood">Subtotal</span>
          <span className="text-ocean-deep">
            {subtotal > 0 ? `$${(subtotal / 100).toFixed(2)}` : "—"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-driftwood">Shipping</span>
          <span className="text-ocean-deep">
            {shippingCost !== null
              ? shippingCost === 0
                ? "Free"
                : `$${(shippingCost / 100).toFixed(2)}`
              : "Calculated at next step"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-driftwood">Tax (Hawaii GET)</span>
          <span className="text-ocean-deep">
            {taxAmount !== null
              ? `$${(taxAmount / 100).toFixed(2)}`
              : "—"}
          </span>
        </div>

        <div className="border-t border-border pt-3 flex justify-between">
          <span className="font-body text-sm font-medium uppercase tracking-wider text-ocean-deep">
            Total
          </span>
          <span className="font-heading text-2xl text-ocean-deep">
            {total !== null ? `$${(total / 100).toFixed(2)}` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
