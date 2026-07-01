/**
 * Shipping Calculator Service
 * Calculates shipping rates based on cart contents and destination.
 */

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { productShipping, shippingRates, shippingZones } from "@/lib/db/schema";
import { calculatePackages, getEffectiveShippingClass } from "./packaging";
import { METHOD_LABELS, STATE_TO_ZONE_FALLBACK, OZ_PER_POUND } from "@/lib/config/shipping";
import type {
  ShippingCalculationRequest,
  ShippingCalculationResult,
  ShippingQuote,
  ShippingMethod,
  ProductShipping as ProductShippingType,
} from "@/lib/types/shipping";

/**
 * Main entry point: calculate all available shipping options for a cart.
 */
export async function calculateShipping(
  req: ShippingCalculationRequest
): Promise<ShippingCalculationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Look up shipping data for all products
  const productIds = req.items.map((i) => i.productId);
  const shippingData = await getProductShippingData(productIds);

  // Validate all items have shipping data
  const missingProducts: string[] = [];
  for (const item of req.items) {
    if (!shippingData[item.productId]) {
      missingProducts.push(item.productId);
    }
  }

  if (missingProducts.length > 0) {
    errors.push(
      `Missing shipping data for: ${missingProducts.join(", ")}. Cannot calculate rates.`
    );
    return { quotes: [], errors, warnings };
  }

  // Check for zero-weight items
  for (const item of req.items) {
    const sd = shippingData[item.productId];
    if (sd && sd.weightOz <= 0) {
      warnings.push(`${item.productId} has zero weight — using 16 oz default`);
      sd.weightOz = 16; // default to 1 lb
    }
    if (sd && (sd.lengthIn <= 0 || sd.widthIn <= 0 || sd.heightIn <= 0)) {
      warnings.push(`${item.productId} has missing dimensions — using 12×12×4" default`);
      sd.lengthIn = sd.lengthIn || 12;
      sd.widthIn = sd.widthIn || 12;
      sd.heightIn = sd.heightIn || 4;
    }
  }

  // 2. Calculate packages
  const packableItems = req.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    shipping: shippingData[item.productId],
  }));
  const packages = calculatePackages(packableItems);

  // Check for oversized
  for (const pkg of packages) {
    const maxDim = Math.max(pkg.lengthIn, pkg.widthIn, pkg.heightIn);
    if (maxDim > 108) {
      warnings.push("Package exceeds 108\" — freight shipping required");
    }
    if (pkg.billableWeightOz > 1200) {
      warnings.push("Package exceeds 75 lbs — freight shipping may be required");
    }
  }

  // 3. Resolve zone from destination state
  const zoneId = await resolveZone(req.destinationState);
  if (!zoneId) {
    errors.push(`Cannot determine shipping zone for state: ${req.destinationState}`);
    return { quotes: [], errors, warnings };
  }

  // 4. Look up rates and build quotes
  const quotes = await buildQuotes(packages, zoneId, warnings);

  if (quotes.length === 0) {
    errors.push("No shipping rates available for this destination and package configuration.");
  }

  return { quotes, errors, warnings };
}

/**
 * Fetch shipping data for multiple products.
 */
async function getProductShippingData(
  productIds: string[]
): Promise<Record<string, ProductShippingType>> {
  const rows = await db
    .select()
    .from(productShipping)
    .where(
      // Drizzle doesn't have a clean .in() for text arrays, so we query all and filter
      undefined as any // will filter in JS
    );

  // Actually, let's query properly with individual lookups
  const result: Record<string, ProductShippingType> = {};

  for (const pid of productIds) {
    const [row] = await db
      .select()
      .from(productShipping)
      .where(eq(productShipping.productId, pid))
      .limit(1);

    if (row) {
      result[pid] = {
        productId: row.productId,
        weightOz: row.weightOz,
        lengthIn: row.lengthIn,
        widthIn: row.widthIn,
        heightIn: row.heightIn,
        shippingClassId: row.shippingClassId,
        requiresSeparateBox: row.requiresSeparateBox ?? true,
        isOversized: row.isOversized ?? false,
        originZip: row.originZip ?? "96740",
      };
    }
  }

  return result;
}

/**
 * Resolve a US state code to a shipping zone ID.
 */
async function resolveZone(stateCode: string): Promise<string | null> {
  const state = stateCode.toUpperCase();

  // Try DB first
  const zones = await db.select().from(shippingZones);
  for (const zone of zones) {
    const states = zone.states as string[];
    if (states.includes(state)) {
      return zone.id;
    }
  }

  // Fallback to static mapping
  return STATE_TO_ZONE_FALLBACK[state] || null;
}

/**
 * Build shipping quotes for packages in a zone.
 * Groups by shipping method and sums costs across packages.
 */
async function buildQuotes(
  packages: ReturnType<typeof calculatePackages>,
  zoneId: string,
  warnings: string[]
): Promise<ShippingQuote[]> {
  const methodTotals: Record<
    ShippingMethod,
    {
      totalCost: number;
      minDays: number;
      maxDays: number;
      available: boolean;
      pkgWarnings: string[];
    }
  > = {
    standard: { totalCost: 0, minDays: 0, maxDays: 0, available: true, pkgWarnings: [] },
    express: { totalCost: 0, minDays: 0, maxDays: 0, available: true, pkgWarnings: [] },
    freight: { totalCost: 0, minDays: 0, maxDays: 0, available: true, pkgWarnings: [] },
  };

  for (const pkg of packages) {
    // Determine effective class based on package size/weight
    const maxDim = Math.max(pkg.lengthIn, pkg.widthIn, pkg.heightIn);
    const effectiveClass = getEffectiveShippingClass(pkg.billableWeightOz, maxDim);
    const classToUse = effectiveClass || pkg.shippingClassId;

    // Query rates for this class + zone
    const rates = await db
      .select()
      .from(shippingRates)
      .where(
        and(
          eq(shippingRates.shippingClassId, classToUse),
          eq(shippingRates.zoneId, zoneId),
          eq(shippingRates.enabled, true)
        )
      );

    for (const rate of rates) {
      const method = rate.method as ShippingMethod;
      if (!methodTotals[method]) continue;

      // Check weight is in range
      if (
        pkg.billableWeightOz < (rate.minWeightOz ?? 0) ||
        pkg.billableWeightOz > (rate.maxWeightOz ?? 99999)
      ) {
        continue;
      }

      // Calculate cost: base + (billable_lbs × per_pound_rate)
      const billableLbs = Math.ceil(pkg.billableWeightOz / OZ_PER_POUND);
      const pkgCost = rate.baseRate + billableLbs * (rate.perPoundRate ?? 0);

      methodTotals[method].totalCost += pkgCost;
      methodTotals[method].minDays = Math.max(
        methodTotals[method].minDays,
        rate.estimatedDaysMin
      );
      methodTotals[method].maxDays = Math.max(
        methodTotals[method].maxDays,
        rate.estimatedDaysMax
      );
    }

    // If no rates found for standard/express for this package, mark unavailable
    for (const method of ["standard", "express", "freight"] as ShippingMethod[]) {
      const hasRate = rates.some((r) => r.method === method);
      if (!hasRate) {
        methodTotals[method].available = false;
      }
    }
  }

  // Build final quotes
  const quotes: ShippingQuote[] = [];

  for (const method of ["standard", "express", "freight"] as ShippingMethod[]) {
    const data = methodTotals[method];
    if (data.available && data.totalCost > 0) {
      quotes.push({
        method,
        methodLabel: METHOD_LABELS[method] || method,
        cost: data.totalCost,
        estimatedDaysMin: data.minDays,
        estimatedDaysMax: data.maxDays,
        packages,
        warnings: data.pkgWarnings,
      });
    }
  }

  // Sort by cost ascending
  quotes.sort((a, b) => a.cost - b.cost);

  return quotes;
}

/**
 * Validate that a product has complete shipping data.
 */
export async function validateProductShipping(
  productId: string
): Promise<{ valid: boolean; missing: string[] }> {
  const [row] = await db
    .select()
    .from(productShipping)
    .where(eq(productShipping.productId, productId))
    .limit(1);

  if (!row) {
    return {
      valid: false,
      missing: ["weight", "length", "width", "height", "shippingClass"],
    };
  }

  const missing: string[] = [];
  if (!row.weightOz || row.weightOz <= 0) missing.push("weight");
  if (!row.lengthIn || row.lengthIn <= 0) missing.push("length");
  if (!row.widthIn || row.widthIn <= 0) missing.push("width");
  if (!row.heightIn || row.heightIn <= 0) missing.push("height");
  if (!row.shippingClassId) missing.push("shippingClass");

  return { valid: missing.length === 0, missing };
}
