import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/services/stripe";
import { resolveCartItems } from "@/lib/services/cart";
import { calculateTax } from "@/lib/services/tax";
import { db } from "@/lib/db/client";
import { productShipping } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

/**
 * POST /api/checkout/session
 * Creates a Stripe Checkout Session.
 * Body: {
 *   items: [{ productId, quantity }],
 *   shippingCost: number (cents),
 *   shippingMethod: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingCost, shippingMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart items required" }, { status: 400 });
    }

    if (shippingCost === undefined || !shippingMethod) {
      return NextResponse.json(
        { error: "Shipping cost and method required" },
        { status: 400 }
      );
    }

    // Resolve prices from database
    const priceMap: Record<string, number> = {};
    for (const item of items) {
      const [shipping] = await db
        .select()
        .from(productShipping)
        .where(eq(productShipping.productId, item.productId))
        .limit(1);

      if (!shipping?.price) {
        return NextResponse.json(
          { error: `No price set for product: ${item.productId}` },
          { status: 400 }
        );
      }
      priceMap[item.productId] = shipping.price;
    }

    // Build cart items with prices
    const resolvedItems = resolveCartItems(items, priceMap);
    const subtotal = resolvedItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    // Calculate tax
    const tax = calculateTax(subtotal);

    const orderId = uuid();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://newartwebsite.vercel.app";

    const session = await createCheckoutSession({
      items: resolvedItems.map((item) => ({
        title: item.title,
        imageUrl: item.imageUrl,
        unitPrice: item.price,
        quantity: item.quantity,
      })),
      shippingCost,
      shippingMethod,
      taxAmount: tax.taxAmount,
      successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout?cancelled=true`,
      metadata: {
        orderId,
        items: JSON.stringify(
          items.map((i: { productId: string; quantity: number }) => ({
            pid: i.productId,
            qty: i.quantity,
          }))
        ),
        shippingMethod,
        shippingCost: String(shippingCost),
        subtotal: String(subtotal),
        taxAmount: String(tax.taxAmount),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
