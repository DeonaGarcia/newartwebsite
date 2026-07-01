import Stripe from "stripe";

/**
 * Lazy-initialized Stripe client.
 * Avoids crashing at build time when env vars aren't available.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil" as any,
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * Create a Stripe Checkout Session for one-time art purchases.
 */
export async function createCheckoutSession(params: {
  items: Array<{
    title: string;
    imageUrl: string;
    unitPrice: number; // cents
    quantity: number;
  }>;
  shippingCost: number; // cents
  shippingMethod: string;
  taxAmount: number; // cents
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    params.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          images: item.imageUrl.startsWith("http")
            ? [item.imageUrl]
            : [`${process.env.NEXT_PUBLIC_SITE_URL || "https://newartwebsite.vercel.app"}${item.imageUrl}`],
        },
        unit_amount: item.unitPrice,
      },
      quantity: item.quantity,
    }));

  // Add shipping as a line item
  if (params.shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Shipping (${params.shippingMethod})`,
        },
        unit_amount: params.shippingCost,
      },
      quantity: 1,
    });
  }

  // Add tax as a line item
  if (params.taxAmount > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Hawaii GET (4.712%)",
        },
        unit_amount: params.taxAmount,
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
    payment_method_types: ["card"],
  });

  return session;
}
