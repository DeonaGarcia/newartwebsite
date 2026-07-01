"use client";

import { useCart } from "./CartProvider";

interface AddToCartButtonProps {
  productId: string;
  type: "original" | "print";
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({
  productId,
  type,
  disabled,
  className,
}: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const inCart = items.some((i) => i.productId === productId);

  // Originals can only be purchased once (unique artwork)
  const isOriginalInCart = type === "original" && inCart;

  return (
    <button
      onClick={() => addItem(productId)}
      disabled={disabled || isOriginalInCart}
      className={
        className ||
        `inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wider uppercase transition-all duration-300 ${
          isOriginalInCart
            ? "bg-ocean-mist text-ocean-deep cursor-not-allowed"
            : disabled
            ? "bg-border text-driftwood-light cursor-not-allowed"
            : "bg-turquoise-deep text-ocean-deep hover:bg-turquoise active:scale-[0.97]"
        }`
      }
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
      {isOriginalInCart ? "In Cart" : "Add to Cart"}
    </button>
  );
}
