/**
 * Cart Service — server-side cart operations.
 * Cart is persisted in localStorage client-side and synced to DB on checkout.
 */

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { carts, cartItems } from "@/lib/db/schema";
import { artworks } from "@/lib/artworks";
import type { CartItem } from "@/lib/types/cart";
import { v4 as uuid } from "uuid";

/**
 * Get or create a cart by session ID.
 */
export async function getOrCreateCart(sessionId: string) {
  const [existing] = await db
    .select()
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .limit(1);

  if (existing) return existing;

  const newCart = {
    id: uuid(),
    sessionId,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  await db.insert(carts).values(newCart);
  return newCart;
}

/**
 * Sync client-side cart items to the database.
 * Called at checkout time.
 */
export async function syncCartToDb(
  sessionId: string,
  items: CartItem[]
): Promise<string> {
  const cart = await getOrCreateCart(sessionId);

  // Clear existing items
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

  // Insert current items
  if (items.length > 0) {
    await db.insert(cartItems).values(
      items.map((item) => ({
        id: uuid(),
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity,
      }))
    );
  }

  return cart.id;
}

/**
 * Resolve product details for cart items from static artworks data.
 * Returns enriched cart items with title, image, price.
 */
export function resolveCartItems(
  items: Array<{ productId: string; quantity: number }>,
  priceOverrides?: Record<string, number>
): CartItem[] {
  return items
    .map((item) => {
      const artwork = artworks.find((a) => a.id === item.productId);
      if (!artwork) return null;

      return {
        productId: item.productId,
        quantity: item.quantity,
        title: artwork.title,
        imageUrl: `/art/${artwork.file}`,
        price: priceOverrides?.[item.productId] ?? 0, // price comes from DB product_shipping or artwork
        type: artwork.type,
      } as CartItem;
    })
    .filter(Boolean) as CartItem[];
}

/**
 * Calculate cart subtotal in cents.
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
