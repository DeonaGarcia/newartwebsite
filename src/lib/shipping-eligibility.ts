// Hawai'i County (Big Island) ZIP codes — the only addresses eligible for
// free "island-wide" delivery on paintings larger than 24" x 28".
// Source: zip-codes.com/county/hi-hawaii.asp (32 ZIPs: 14 standard + 18 PO box)
export const BIG_ISLAND_ZIPS = new Set([
  "96704", "96710", "96718", "96719", "96720", "96721", "96725", "96726",
  "96727", "96728", "96737", "96738", "96739", "96740", "96743", "96745",
  "96749", "96750", "96755", "96760", "96764", "96771", "96772", "96773",
  "96774", "96776", "96777", "96778", "96780", "96781", "96783", "96785",
]);

export function isBigIslandZip(zip: string | undefined | null): boolean {
  if (!zip) return false;
  const digits = zip.trim().slice(0, 5);
  return BIG_ISLAND_ZIPS.has(digits);
}

export function isUSCountry(country: string | undefined | null): boolean {
  if (!country) return false;
  const c = country.trim().toUpperCase();
  return (
    c === "US" ||
    c === "USA" ||
    c === "UNITED STATES" ||
    c === "UNITED STATES OF AMERICA"
  );
}

export interface ShippingEligibilityResult {
  blocked: boolean;
  reason?: string;
  shippingCost: number; // cents — only meaningful when !blocked
  shippingLabel: string;
}

// Flat rate for paintings larger than 24"x28" shipped off the Big Island.
const LARGE_ITEM_SURCHARGE_CENTS = 25000;

/**
 * Shipping rules (confirmed with Deona 2026-07-08):
 * - International (non-US) orders: blocked at checkout, customer must
 *   contact Deona directly to arrange shipping.
 * - Paintings <=24"x28" ("freeShipping" flag): free shipping anywhere in the US.
 * - Paintings >24"x28": free "island-wide" delivery within the Big Island
 *   (Hawai'i County ZIPs); a flat $250 surcharge applies for the rest of
 *   the US (mainland or other Hawaiian islands).
 */
export function evaluateShippingEligibility(opts: {
  hasLargeItem: boolean;
  country: string | undefined | null;
  zip: string | undefined | null;
}): ShippingEligibilityResult {
  const { hasLargeItem, country, zip } = opts;

  if (!isUSCountry(country)) {
    return {
      blocked: true,
      reason:
        "International shipping isn't available through checkout yet. Please contact Deona directly so she can arrange shipping for your order.",
      shippingCost: 0,
      shippingLabel: "Contact for international shipping",
    };
  }

  if (hasLargeItem && !isBigIslandZip(zip)) {
    return {
      blocked: false,
      shippingCost: LARGE_ITEM_SURCHARGE_CENTS,
      shippingLabel: "Flat-rate shipping (large painting)",
    };
  }

  return {
    blocked: false,
    shippingCost: 0,
    shippingLabel: hasLargeItem ? "Free island-wide delivery" : "Free shipping",
  };
}

