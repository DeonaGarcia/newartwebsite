/**
 * Tax Calculator
 * Hawaii General Excise Tax (GET) applied to all orders.
 * Note: Hawaii GET is imposed on the seller, not the buyer,
 * but sellers typically pass it through. Rate = 4.712% on Oahu,
 * 4.166% elsewhere. Using 4.712% as default (conservative).
 *
 * For art sold online, Hawaii GET applies to the seller's gross income.
 * No destination-based sales tax since we're in Hawaii.
 */

import { HAWAII_TAX_RATE } from "@/lib/config/shipping";

export interface TaxCalculation {
  subtotal: number;        // cents
  taxRate: number;         // decimal
  taxAmount: number;       // cents
  taxLabel: string;
}

/**
 * Calculate tax on an order.
 * Hawaii GET applies regardless of destination (it's on the seller).
 */
export function calculateTax(subtotalCents: number): TaxCalculation {
  const taxAmount = Math.round(subtotalCents * HAWAII_TAX_RATE);
  return {
    subtotal: subtotalCents,
    taxRate: HAWAII_TAX_RATE,
    taxAmount,
    taxLabel: "Hawaii GET (4.712%)",
  };
}

/**
 * Format cents to dollars string.
 */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
