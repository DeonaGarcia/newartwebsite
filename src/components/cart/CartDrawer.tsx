"use client";

import { useCart } from "./CartProvider";
import { CartItem } from "./CartItem";
import Image from "next/image";
import Link from "next/link";

export function CartDrawer() {
  const { items, itemCount, subtotal, isOpen, closeCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ocean-deep/50 z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-pearl z-50 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-heading text-2xl text-ocean-deep">
            Cart ({itemCount})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-ocean hover:text-ocean-deep transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-ocean-mist mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <p className="text-driftwood-light font-body">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="mt-4 text-turquoise-deep hover:text-turquoise text-sm uppercase tracking-wider cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex justify-between text-ocean-deep">
              <span className="font-body text-sm uppercase tracking-wider">Subtotal</span>
              <span className="font-heading text-xl">
                {subtotal > 0
                  ? `$${(subtotal / 100).toFixed(2)}`
                  : "Price at checkout"}
              </span>
            </div>
            <p className="text-xs text-driftwood-light">
              Shipping & taxes calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center bg-turquoise-deep text-ocean-deep py-4 text-sm font-medium uppercase tracking-widest hover:bg-turquoise transition-colors"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center text-ocean text-sm uppercase tracking-wider hover:text-ocean-deep transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
