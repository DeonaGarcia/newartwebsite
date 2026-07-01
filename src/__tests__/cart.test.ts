import { describe, it, expect } from "vitest";
import { calculateSubtotal, resolveCartItems } from "@/lib/services/cart";
import { calculateTax, formatCents } from "@/lib/services/tax";
import type { CartItem } from "@/lib/types/cart";

// ─── Cart Subtotal ──────────────────────────────────────────

describe("calculateSubtotal", () => {
  it("sums single item correctly", () => {
    const items: CartItem[] = [
      { productId: "a", quantity: 1, title: "Test", imageUrl: "", price: 50000, type: "original" },
    ];
    expect(calculateSubtotal(items)).toBe(50000);
  });

  it("multiplies by quantity for prints", () => {
    const items: CartItem[] = [
      { productId: "a", quantity: 3, title: "Print", imageUrl: "", price: 2500, type: "print" },
    ];
    expect(calculateSubtotal(items)).toBe(7500);
  });

  it("sums multiple items", () => {
    const items: CartItem[] = [
      { productId: "a", quantity: 1, title: "Original", imageUrl: "", price: 100000, type: "original" },
      { productId: "b", quantity: 2, title: "Print", imageUrl: "", price: 5000, type: "print" },
    ];
    expect(calculateSubtotal(items)).toBe(110000); // $1000 + 2×$50
  });

  it("returns 0 for empty cart", () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it("handles zero-price items", () => {
    const items: CartItem[] = [
      { productId: "a", quantity: 1, title: "Test", imageUrl: "", price: 0, type: "original" },
    ];
    expect(calculateSubtotal(items)).toBe(0);
  });
});

// ─── Tax Calculation ────────────────────────────────────────

describe("calculateTax", () => {
  it("calculates Hawaii GET at 4.712%", () => {
    const result = calculateTax(100000); // $1000
    expect(result.taxRate).toBe(0.04712);
    expect(result.taxAmount).toBe(4712); // $47.12
  });

  it("rounds to nearest cent", () => {
    const result = calculateTax(33333); // $333.33
    // 33333 × 0.04712 = 1570.66... → rounds to 1571
    expect(result.taxAmount).toBe(Math.round(33333 * 0.04712));
  });

  it("returns 0 for $0 subtotal", () => {
    const result = calculateTax(0);
    expect(result.taxAmount).toBe(0);
  });
});

// ─── Format Cents ───────────────────────────────────────────

describe("formatCents", () => {
  it("formats whole dollars", () => {
    expect(formatCents(10000)).toBe("$100.00");
  });

  it("formats cents correctly", () => {
    expect(formatCents(4999)).toBe("$49.99");
  });

  it("formats zero", () => {
    expect(formatCents(0)).toBe("$0.00");
  });

  it("formats large amounts", () => {
    expect(formatCents(250000)).toBe("$2500.00");
  });
});

// ─── Resolve Cart Items ─────────────────────────────────────

describe("resolveCartItems", () => {
  it("resolves known products", () => {
    const items = [{ productId: "kealakekua-bay", quantity: 1 }];
    const resolved = resolveCartItems(items);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].title).toBe("Kealakekua Bay");
    expect(resolved[0].imageUrl).toContain("kealakekua-bay.jpg");
  });

  it("filters out unknown products", () => {
    const items = [
      { productId: "kealakekua-bay", quantity: 1 },
      { productId: "nonexistent", quantity: 1 },
    ];
    const resolved = resolveCartItems(items);
    expect(resolved).toHaveLength(1);
  });

  it("applies price overrides", () => {
    const items = [{ productId: "kealakekua-bay", quantity: 1 }];
    const resolved = resolveCartItems(items, { "kealakekua-bay": 150000 });
    expect(resolved[0].price).toBe(150000);
  });

  it("returns empty for empty input", () => {
    expect(resolveCartItems([])).toHaveLength(0);
  });
});
