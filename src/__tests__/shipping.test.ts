import { describe, it, expect } from "vitest";
import {
  calcDimensionalWeightOz,
  getBillableWeight,
  calculatePackages,
  getEffectiveShippingClass,
} from "@/lib/services/packaging";

// ─── Dimensional Weight ─────────────────────────────────────

describe("calcDimensionalWeightOz", () => {
  it("calculates correctly for standard divisor (139)", () => {
    // 24 × 20 × 6 = 2880 cubic inches / 139 = 20.72 lbs × 16 = 332 oz
    const result = calcDimensionalWeightOz(24, 20, 6);
    expect(result).toBe(Math.ceil((24 * 20 * 6) / 139 * 16));
  });

  it("returns 0 oz for zero dimensions", () => {
    expect(calcDimensionalWeightOz(0, 20, 6)).toBe(0);
    expect(calcDimensionalWeightOz(24, 0, 6)).toBe(0);
    expect(calcDimensionalWeightOz(24, 20, 0)).toBe(0);
  });

  it("handles custom divisor", () => {
    const result = calcDimensionalWeightOz(24, 20, 6, 166);
    expect(result).toBe(Math.ceil((24 * 20 * 6) / 166 * 16));
  });

  it("rounds up to nearest ounce", () => {
    // 10 × 10 × 10 = 1000 / 139 = 7.194 lbs × 16 = 115.1 oz → rounds to 116
    const result = calcDimensionalWeightOz(10, 10, 10);
    expect(result).toBe(116);
  });
});

// ─── Billable Weight ────────────────────────────────────────

describe("getBillableWeight", () => {
  it("uses actual weight when heavier than dimensional", () => {
    // Heavy small package: 480 oz actual, small dims
    const result = getBillableWeight(480, 12, 12, 6);
    expect(result.billableWeightOz).toBe(480);
    expect(result.billableWeightOz).toBe(result.actualWeightOz);
  });

  it("uses dimensional weight when larger than actual", () => {
    // Light large package: 32 oz actual, big dims
    const result = getBillableWeight(32, 36, 30, 8);
    expect(result.dimensionalWeightOz).toBeGreaterThan(32);
    expect(result.billableWeightOz).toBe(result.dimensionalWeightOz);
  });

  it("returns equal values when weights match", () => {
    const dimOz = calcDimensionalWeightOz(20, 16, 6);
    const result = getBillableWeight(dimOz, 20, 16, 6);
    expect(result.billableWeightOz).toBe(dimOz);
  });
});

// ─── Packaging ──────────────────────────────────────────────

describe("calculatePackages", () => {
  const makeItem = (
    id: string,
    qty: number,
    separate: boolean,
    classId: string = "medium-painting"
  ) => ({
    productId: id,
    quantity: qty,
    shipping: {
      productId: id,
      weightOz: 160, // 10 lbs
      lengthIn: 30,
      widthIn: 24,
      heightIn: 6,
      shippingClassId: classId,
      requiresSeparateBox: separate,
      isOversized: false,
      originZip: "96740",
    },
  });

  it("creates separate packages for items requiring individual boxes", () => {
    const items = [makeItem("painting-1", 1, true)];
    const pkgs = calculatePackages(items);
    expect(pkgs).toHaveLength(1);
    expect(pkgs[0].productIds).toEqual(["painting-1"]);
  });

  it("creates one package per unit for separate-box items with qty > 1", () => {
    const items = [makeItem("painting-1", 3, true)];
    const pkgs = calculatePackages(items);
    expect(pkgs).toHaveLength(3);
  });

  it("combines items not requiring separate boxes", () => {
    const items = [
      makeItem("print-1", 2, false, "small-print"),
      makeItem("print-2", 1, false, "small-print"),
    ];
    const pkgs = calculatePackages(items);
    // Should be combined into one package since same class + combinable
    expect(pkgs).toHaveLength(1);
    expect(pkgs[0].productIds).toHaveLength(3); // 2 + 1
    expect(pkgs[0].actualWeightOz).toBe(480); // 3 × 160
  });

  it("handles mixed separate and combinable items", () => {
    const items = [
      makeItem("painting-1", 1, true, "medium-painting"),
      makeItem("print-1", 2, false, "small-print"),
    ];
    const pkgs = calculatePackages(items);
    expect(pkgs).toHaveLength(2); // 1 painting box + 1 print package
  });

  it("stacks height for combined items", () => {
    const items = [
      {
        productId: "print-1",
        quantity: 3,
        shipping: {
          productId: "print-1",
          weightOz: 32,
          lengthIn: 20,
          widthIn: 16,
          heightIn: 2,
          shippingClassId: "small-print",
          requiresSeparateBox: false,
          isOversized: false,
          originZip: "96740",
        },
      },
    ];
    const pkgs = calculatePackages(items);
    expect(pkgs[0].heightIn).toBe(6); // 3 × 2
    expect(pkgs[0].lengthIn).toBe(20);
    expect(pkgs[0].widthIn).toBe(16);
  });
});

// ─── Effective Shipping Class ───────────────────────────────

describe("getEffectiveShippingClass", () => {
  it("returns small-print for light, small items", () => {
    expect(getEffectiveShippingClass(64, 20)).toBe("small-print");
  });

  it("returns medium-painting for medium items", () => {
    expect(getEffectiveShippingClass(320, 36)).toBe("medium-painting");
  });

  it("returns large-painting for large items", () => {
    expect(getEffectiveShippingClass(800, 60)).toBe("large-painting");
  });

  it("returns oversized for very large items", () => {
    expect(getEffectiveShippingClass(1600, 80)).toBe("oversized");
  });

  it("upgrades class based on weight even if dims are small", () => {
    expect(getEffectiveShippingClass(700, 30)).toBe("large-painting");
  });

  it("upgrades class based on dimension even if weight is low", () => {
    expect(getEffectiveShippingClass(100, 50)).toBe("large-painting");
  });
});
