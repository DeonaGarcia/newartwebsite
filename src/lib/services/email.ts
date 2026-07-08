/**
 * Email Service — transactional email via Resend HTTP API.
 * No SDK dependency; calls Resend's REST API directly with fetch.
 *
 * Env vars:
 *   RESEND_API_KEY   - required, from resend.com dashboard
 *   RESEND_FROM_EMAIL - optional, defaults to Resend's shared sender
 *                       (onboarding@resend.dev) until deonahawaiiart.com
 *                       is verified as a sending domain in Resend.
 *   ADMIN_ALERT_EMAIL - optional, defaults to deonagarcia@gmail.com
 */

const RESEND_API_URL = "https://api.resend.com/emails";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

async function sendEmail(payload: {
  to: string[];
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set — skipping email send");
    return;
  }
  const from = process.env.RESEND_FROM_EMAIL || "Deona Hawaii Art <onboarding@resend.dev>";

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Resend API error (${res.status}):`, errBody);
    }
  } catch (err) {
    // Email failures should never break order processing.
    console.error("Failed to send email via Resend:", err);
  }
}

export interface OrderEmailItem {
  title: string;
  quantity: number;
  unitPrice: number; // cents
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderEmailItem[];
  subtotal: number; // cents
  shippingCost: number; // cents
  shippingMethod: string;
  taxAmount: number; // cents
  total: number; // cents
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

function itemsRowsHtml(items: OrderEmailItem[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e0e0e0;">${item.title}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e0e0e0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e0e0e0;text-align:right;">${formatCents(item.unitPrice)}</td>
        </tr>`
    )
    .join("");
}

function addressHtml(addr: OrderEmailData["shippingAddress"]): string {
  return `${addr.name}<br/>${addr.line1}${addr.line2 ? `<br/>${addr.line2}` : ""}<br/>${addr.city}, ${addr.state} ${addr.postalCode}<br/>${addr.country}`;
}

/**
 * Sends the order confirmation email to the customer.
 */
export async function sendOrderConfirmationEmail(order: OrderEmailData): Promise<void> {
  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1B3A4B;">
      <h1 style="color:#1B3A4B;font-size:22px;">Thank you for your order, ${order.customerName}!</h1>
      <p style="color:#3D6B7E;font-size:14px;">Order #${order.orderId}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #7FDBDA;">Item</th>
            <th style="text-align:center;padding-bottom:8px;border-bottom:2px solid #7FDBDA;">Qty</th>
            <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #7FDBDA;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsRowsHtml(order.items)}</tbody>
      </table>
      <table style="width:100%;font-size:14px;margin-bottom:16px;">
        <tr><td>Subtotal</td><td style="text-align:right;">${formatCents(order.subtotal)}</td></tr>
        <tr><td>Shipping (${order.shippingMethod})</td><td style="text-align:right;">${formatCents(order.shippingCost)}</td></tr>
        <tr><td>Tax</td><td style="text-align:right;">${formatCents(order.taxAmount)}</td></tr>
        <tr style="font-weight:bold;"><td>Total</td><td style="text-align:right;">${formatCents(order.total)}</td></tr>
      </table>
      <p style="font-size:14px;"><strong>Shipping to:</strong><br/>${addressHtml(order.shippingAddress)}</p>
      <p style="font-size:13px;color:#6A9FB0;margin-top:24px;">Painted from inside the wave — Deona Hawaii Art</p>
    </div>
  `;

  await sendEmail({
    to: [order.customerEmail],
    subject: `Order confirmed — ${order.orderId}`,
    html,
  });
}

/**
 * Sends an internal alert to the shop owner when a new order comes in.
 */
export async function sendAdminOrderAlert(order: OrderEmailData): Promise<void> {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || "deonagarcia@gmail.com";
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h2>New order: ${order.orderId}</h2>
      <p><strong>${order.customerName}</strong> (${order.customerEmail})</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        <tbody>${itemsRowsHtml(order.items)}</tbody>
      </table>
      <p><strong>Total: ${formatCents(order.total)}</strong> (shipping: ${order.shippingMethod})</p>
      <p>${addressHtml(order.shippingAddress)}</p>
    </div>
  `;

  await sendEmail({
    to: [adminEmail],
    subject: `New order — ${formatCents(order.total)} from ${order.customerName}`,
    html,
  });
}
