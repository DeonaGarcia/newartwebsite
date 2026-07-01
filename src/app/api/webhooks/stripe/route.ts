import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/services/stripe";
import { db } from "@/lib/db/client";
import { orders, orderItems } from "@/lib/db/schema";
import { v4 as uuid } from "uuid";
import type Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events (checkout.session.completed).
 * Creates order records in the database.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata || {};
    const orderId = metadata.orderId || uuid();

    // Parse items from metadata
    let itemsData: Array<{ pid: string; qty: number }> = [];
    try {
      itemsData = JSON.parse(metadata.items || "[]");
    } catch {
      console.error("Failed to parse items metadata");
    }

    // Extract shipping address from Stripe
    const shippingDetails = session.shipping_details;
    const shippingAddress = shippingDetails?.address
      ? {
          name: shippingDetails.name || session.customer_details?.name || "",
          line1: shippingDetails.address.line1 || "",
          line2: shippingDetails.address.line2 || "",
          city: shippingDetails.address.city || "",
          state: shippingDetails.address.state || "",
          postalCode: shippingDetails.address.postal_code || "",
          country: shippingDetails.address.country || "US",
        }
      : {
          name: session.customer_details?.name || "",
          line1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "US",
        };

    // Create order
    await db.insert(orders).values({
      id: orderId,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null,
      customerEmail: session.customer_details?.email || "",
      customerName: session.customer_details?.name || "",
      shippingAddress,
      subtotal: parseInt(metadata.subtotal || "0"),
      shippingCost: parseInt(metadata.shippingCost || "0"),
      shippingMethod: metadata.shippingMethod || "standard",
      taxAmount: parseInt(metadata.taxAmount || "0"),
      total: session.amount_total || 0,
      status: "paid",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create order items
    for (const item of itemsData) {
      // In production, look up title/image/price from DB
      await db.insert(orderItems).values({
        id: uuid(),
        orderId,
        productId: item.pid,
        title: item.pid, // will be enriched when we query
        quantity: item.qty,
        unitPrice: 0, // stored in metadata
      });
    }

    console.log(`Order created: ${orderId} for session ${session.id}`);
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error; // Stripe will retry the webhook
  }
}
