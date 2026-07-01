/**
 * Packaging Calculator
 * Determines how cart items should be packed into boxes.
 * Art typically ships individually (requiresSeparateBox=true),
 * but prints can sometimes be combined.
 */

import type { ProductShipping, PackageInfo } from "@/lib/types/shipping";
import { DIM_WEIGHT_DIVISOR, OZ_PER_POUND } from "@/lib/config/shipping";

interface PackableItem {
  productId: string;
  quantity: number;
  shipping: ProductShipping;
}

/**
 * Calculate dimensional weight in ounces.
 * Formula: (L × W × H) / divisor × 16
 */
export function calcDimensionalWeightOz(
  lengthIn: number,
  widthIn: number,
  heightIn: number,
  divisor: number = DIM_WEIGHT_DIVISOR
): number {
  const dimWeightLbs = (lengthIn * widthIn * heightIn) / divisor;
  return Math.ceil(dimWeightLbs * OZ_PER_POUND);
}

/**
 * Get billable weight (max of actual vs dimensional).
 */
export function getBillableWeight(
  actualWeightOz: number,
  lengthIn: number,
  widthIn: number,
  heightIn: number
): { actualWeightOz: number; dimensionalWeightOz: number; billableWeightOz: number } {
  const dimensionalWeightOz = calcDimensionalWeightOz(lengthIn, widthIn, heightIn);
  return {
    actualWeightOz,
    dimensionalWeightOz,
    billableWeightOz: Math.max(actualWeightOz, dimensionalWeightOz),
  };
}

/**
 * Pack items into packages.
 * - Items with requiresSeparateBox=true get their own package (per unit)
 * - Combinable items (prints) are grouped by shipping class
 */
export function calculatePackages(items: PackableItem[]): PackageInfo[] {
  const packages: PackageInfo[] = [];

  for (const item of items) {
    const { shipping } = item;

    if (shipping.requiresSeparateBox) {
      // Each unit gets its own box
      for (let i = 0; i < item.quantity; i++) {
        const weights = getBillableWeight(
          shipping.weightOz,
          shipping.lengthIn,
          shipping.widthIn,
          shipping.heightIn
        );
        packages.push({
          productIds: [item.productId],
          ...weights,
          lengthIn: shipping.lengthIn,
          widthIn: shipping.widthIn,
          heightIn: shipping.heightIn,
          shippingClassId: shipping.shippingClassId,
        });
      }
    } else {
      // Combinable — find or create a package for this class
      let existingPkg = packages.find(
        (p) =>
          p.shippingClassId === shipping.shippingClassId &&
          !items.find(
            (it) =>
              it.shipping.requiresSeparateBox &&
              p.productIds.includes(it.productId)
          )
      );

      if (!existingPkg) {
        existingPkg = {
          productIds: [],
          actualWeightOz: 0,
          dimensionalWeightOz: 0,
          billableWeightOz: 0,
          lengthIn: 0,
          widthIn: 0,
          heightIn: 0,
          shippingClassId: shipping.shippingClassId,
        };
        packages.push(existingPkg);
      }

      for (let i = 0; i < item.quantity; i++) {
        existingPkg.productIds.push(item.productId);
        existingPkg.actualWeightOz += shipping.weightOz;
        // Stack height, keep max length/width
        existingPkg.lengthIn = Math.max(existingPkg.lengthIn, shipping.lengthIn);
        existingPkg.widthIn = Math.max(existingPkg.widthIn, shipping.widthIn);
        existingPkg.heightIn += shipping.heightIn;
      }

      // Recalculate dimensional weight for combined package
      const dimOz = calcDimensionalWeightOz(
        existingPkg.lengthIn,
        existingPkg.widthIn,
        existingPkg.heightIn
      );
      existingPkg.dimensionalWeightOz = dimOz;
      existingPkg.billableWeightOz = Math.max(
        existingPkg.actualWeightOz,
        dimOz
      );
    }
  }

  return packages;
}

/**
 * Determine the effective shipping class for a package.
 * If combined items span multiple classes, use the highest tier.
 */
export function getEffectiveShippingClass(
  billableWeightOz: number,
  maxDimensionIn: number
): string {
  if (maxDimensionIn > 72 || billableWeightOz > 1200) return "oversized";
  if (maxDimensionIn > 48 || billableWeightOz > 640) return "large-painting";
  if (maxDimensionIn > 30 || billableWeightOz > 128) return "medium-painting";
  return "small-print";
}
