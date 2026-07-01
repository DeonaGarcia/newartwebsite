"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { artworks } from "@/lib/artworks";
import type { CartItem, CartContextValue } from "@/lib/types/cart";

const STORAGE_KEY = "dh_cart";

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/**
 * Cart state lives in localStorage for guest users.
 * Synced to DB only at checkout time.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        // Validate items still exist in artworks
        const valid = parsed.filter((item) =>
          artworks.some((a) => a.id === item.productId)
        );
        setItems(valid);
      }
    } catch {
      // corrupted data, start fresh
    }
    setIsLoading(false);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoading]);

  const addItem = useCallback(
    (productId: string) => {
      const artwork = artworks.find((a) => a.id === productId);
      if (!artwork) return;

      setItems((prev) => {
        const existing = prev.find((i) => i.productId === productId);

        // Originals are one-of-a-kind — can't add more than 1
        if (existing && artwork.type === "original") return prev;

        if (existing) {
          return prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }

        return [
          ...prev,
          {
            productId,
            quantity: 1,
            title: artwork.title,
            imageUrl: `/art/${artwork.file}`,
            price: 0, // will be resolved from DB at checkout
            type: artwork.type,
          },
        ];
      });

      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isOpen,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
