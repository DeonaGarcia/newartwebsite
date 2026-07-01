"use client";

import type { ShippingQuote } from "@/lib/types/shipping";

interface ShippingOptionsProps {
  quotes: ShippingQuote[];
  selectedMethod: string | null;
  onSelect: (method: string) => void;
  warnings: string[];
}

export function ShippingOptions({
  quotes,
  selectedMethod,
  onSelect,
  warnings,
}: ShippingOptionsProps) {
  if (quotes.length === 0) {
    return (
      <div className="p-6 bg-coral/10 border border-coral/30">
        <p className="text-coral text-sm">
          No shipping options available for this destination. Please contact us for a custom quote.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-2xl text-ocean-deep">Shipping Method</h3>

      {warnings.length > 0 && (
        <div className="p-3 bg-coral/10 border border-coral/20 text-sm text-coral space-y-1">
          {warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      {quotes.map((quote) => (
        <label
          key={quote.method}
          className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${
            selectedMethod === quote.method
              ? "border-turquoise-deep bg-ocean-foam/30"
              : "border-border hover:border-ocean-mist"
          }`}
        >
          <input
            type="radio"
            name="shipping-method"
            value={quote.method}
            checked={selectedMethod === quote.method}
            onChange={() => onSelect(quote.method)}
            className="w-4 h-4 text-turquoise-deep"
          />
          <div className="flex-1">
            <p className="text-ocean-deep font-body text-sm font-medium">
              {quote.methodLabel}
            </p>
            <p className="text-driftwood-light text-xs mt-0.5">
              {quote.estimatedDaysMin}–{quote.estimatedDaysMax} business days
            </p>
          </div>
          <p className="font-heading text-lg text-ocean-deep">
            ${(quote.cost / 100).toFixed(2)}
          </p>
        </label>
      ))}
    </div>
  );
}
