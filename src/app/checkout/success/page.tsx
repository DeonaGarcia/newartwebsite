"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();

  // Clear cart after successful purchase
  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        {/* Success icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-turquoise/20 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-turquoise-deep"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="font-heading text-4xl md:text-5xl text-ocean-deep mb-4">
          Mahalo!
        </h1>
        <p className="font-body text-ocean leading-relaxed mb-2">
          Your order has been placed successfully.
        </p>
        <p className="font-body text-driftwood-light text-sm mb-8">
          You&apos;ll receive a confirmation email shortly with your order details
          and tracking information once your artwork ships.
        </p>

        {sessionId && (
          <p className="text-xs text-driftwood-light mb-8">
            Order reference: {sessionId.slice(0, 20)}...
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/originals"
            className="inline-block border border-turquoise text-turquoise px-8 py-3 text-sm tracking-widest uppercase hover:bg-turquoise hover:text-ocean-deep transition-all"
          >
            Continue Shopping
          </Link>
          <Link
            href="/contact"
            className="inline-block border border-ocean-deep text-ocean-deep px-8 py-3 text-sm tracking-widest uppercase hover:bg-ocean-deep hover:text-pearl transition-all"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
