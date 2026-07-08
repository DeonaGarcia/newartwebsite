import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/services/stripe";
import { db } from "@/lib/db/client";
import { orders, orderItems, productShipping } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { artworks } from "@/lib/artworks";
import { sendOrderConfirmationEmail, sendAdminOrderAlert } from "@/lib/services/email";
import { v4 as uuid } from "uuid";
import type Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events (checkout.session.completed).
 * Creates order records in the database and sends order emails.
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

    // Enrich items with real title/image/price so order records and
    // emails don't just show raw product IDs.
    const enrichedItems: Array<{
      productId: string;
      title: string;
      imageUrl: string;
      quantity: number;
      unitPrice: number;
    }> = [];

    for (const item of itemsData) {
      const artwork = artworks.find((a) => a.id === item.pid);
      const [shipping] = await db
        .select()
        .from(productShipping)
        .where(eq(productShipping.productId, item.pid))
        .limit(1);

      enrichedItems.push({
        productId: item.pid,
        title: artwork?.title || item.pid,
        imageUrl: artwork ? `/art/${artwork.file}` : "",
        quantity: item.qty,
        unitPrice: shipping?.price ?? 0,
      });
    }

    // Create order items
    for (const item of enrichedItems) {
      await db.insert(orderItems).values({
        id: uuid(),
        orderId,
        productId: item.productId,
        title: item.title,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    console.log(`Order created: ${orderId} for session ${session.id}`);

    // Send order emails. Never let email failure break order processing —
    // the order is already committed above.
    const emailData = {
      orderId,
      customerName: session.customer_details?.name || "",
      customerEmail: session.customer_details?.email || "",
      items: enrichedItems.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      subtotal: parseInt(metadata.subtotal || "0"),
      shippingCost: parseInt(metadata.shippingCost || "0"),
      shippingMethod: metadata.shippingMethod || "standard",
      taxAmount: parseInt(metadata.taxAmount || "0"),
      total: session.amount_total || 0,
      shippingAddress,
    };

    try {
      if (emailData.customerEmail) {
        await sendOrderConfirmationEmail(emailData);
      }
      await sendAdminOrderAlert(emailData);
    } catch (emailErr) {
      console.error("Order email send failed (order still recorded):", emailErr);
    }
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error; // Stripe will retry the webhook
  }
}
