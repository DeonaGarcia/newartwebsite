import { NextRequest, NextResponse } from "next/server";
import { syncCartToDb, resolveCartItems, calculateSubtotal } from "@/lib/services/cart";
import { cookies } from "next/headers";
import { CART_SESSION_COOKIE } from "@/lib/config/shipping";
import { v4 as uuid } from "uuid";

/**
 * POST /api/cart — Sync cart items to database (called at checkout).
 * Body: { items: [{ productId, quantity }] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "items array required" }, { status: 400 });
    }

    // Get or create session
    const cookieStore = await cookies();
    let sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
    if (!sessionId) {
      sessionId = uuid();
    }

    // Sync to database
    const cartId = await syncCartToDb(sessionId, items);

    // Resolve full cart data
    const resolvedItems = resolveCartItems(items);
    const subtotal = calculateSubtotal(resolvedItems);

    const response = NextResponse.json({
      cartId,
      sessionId,
      items: resolvedItems,
      subtotal,
    });

    // Set session cookie
    response.cookies.set(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync cart" },
      { status: 500 }
    );
  }
}
