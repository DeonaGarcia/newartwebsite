"use client";

import Image from "next/image";
import { useCart } from "./CartProvider";
import type { CartItem as CartItemType } from "@/lib/types/cart";

interface CartItemProps {
  item: CartItemType;
  showControls?: boolean;
}

export function CartItem({ item, showControls = true }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 py-3">
      {/* Image */}
      <div className="relative w-20 h-20 bg-sand flex-shrink-0">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-lg text-ocean-deep truncate">
          {item.title}
        </h3>
        <p className="text-xs text-driftwood-light uppercase tracking-wider mt-0.5">
          {item.type === "original" ? "Original" : "Print"}
        </p>
        {item.price > 0 && (
          <p className="text-sm text-ocean-deep mt-1">
            ${(item.price / 100).toFixed(2)}
          </p>
        )}

        {showControls && (
          <div className="flex items-center gap-3 mt-2">
            {item.type === "print" ? (
              <div className="flex items-center border border-border">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center text-ocean hover:text-ocean-deep transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  \u2212
                </button>
                <span className="w-8 text-center text-sm text-ocean-deep">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-ocean hover:text-ocean-deep transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            ) : (
              <span className="text-xs text-driftwood-light">Qty: 1</span>
            )}
            <button
              onClick={() => removeItem(item.productId)}
              className="text-xs text-coral hover:text-coral/80 uppercase tracking-wider cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
