"use client";

import type { ShippingQuote } from "@/lib/types/shipping";

interface ShippingSummaryPanelProps {
  productId: string;
  weightOz: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  shippingClassId: string;
  quotes?: ShippingQuote[];
  isLoading?: boolean;
  onPreviewRates?: () => void;
}

export function ShippingSummaryPanel({
  productId,
  weightOz,
  lengthIn,
  widthIn,
  heightIn,
  shippingClassId,
  quotes,
  isLoading,
  onPreviewRates,
}: ShippingSummaryPanelProps) {
  const dimWeightOz = Math.ceil((lengthIn * widthIn * heightIn) / 139 * 16);
  const billableOz = Math.max(weightOz, dimWeightOz);
  const billableLbs = (billableOz / 16).toFixed(1);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
      <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
        Shipping Summary
      </h4>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500">Actual Weight</span>
          <p className="font-medium text-gray-900">{weightOz} oz ({(weightOz / 16).toFixed(1)} lbs)</p>
        </div>
        <div>
          <span className="text-gray-500">Dim Weight</span>
          <p className="font-medium text-gray-900">{dimWeightOz} oz ({(dimWeightOz / 16).toFixed(1)} lbs)</p>
        </div>
        <div>
          <span className="text-gray-500">Billable Weight</span>
          <p className="font-medium text-gray-900">{billableLbs} lbs</p>
        </div>
        <div>
          <span className="text-gray-500">Dimensions</span>
          <p className="font-medium text-gray-900">{lengthIn}×{widthIn}×{heightIn}"</p>
        </div>
        <div>
          <span className="text-gray-500">Shipping Class</span>
          <p className="font-medium text-gray-900">{shippingClassId}</p>
        </div>
        <div>
          <span className="text-gray-500">Ship Method</span>
          <p className="font-medium text-gray-900">
            {billableOz > 1200 ? "Freight" : billableOz > 640 ? "Standard/Express" : "Standard/Express"}
          </p>
        </div>
      </div>

      {/* Warnings */}
      {weightOz <= 0 && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
          ⚠ Weight not set — cannot calculate shipping
        </p>
      )}
      {(lengthIn <= 0 || widthIn <= 0 || heightIn <= 0) && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
          ⚠ Dimensions incomplete — cannot calculate shipping
        </p>
      )}
      {Math.max(lengthIn, widthIn, heightIn) > 72 && (
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          ⚠ Exceeds 72" — may require freight shipping
        </p>
      )}

      {/* Rate Preview */}
      {quotes && quotes.length > 0 && (
        <div className="border-t border-gray-200 pt-3 space-y-1">
          <p className="text-xs text-gray-500 uppercase font-medium">Estimated Rates</p>
          {quotes.map((q) => (
            <div key={q.method} className="flex justify-between text-sm">
              <span className="text-gray-600">{q.methodLabel}</span>
              <span className="font-medium text-gray-900">
                ${(q.cost / 100).toFixed(2)} ({q.estimatedDaysMin}–{q.estimatedDaysMax} days)
              </span>
            </div>
          ))}
        </div>
      )}

      {onPreviewRates && (
        <button
          onClick={onPreviewRates}
          disabled={isLoading || weightOz <= 0}
          className="text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer disabled:text-gray-400 disabled:no-underline"
        >
          {isLoading ? "Calculating..." : "Preview rates for all zones →"}
        </button>
      )}
    </div>
  );
}
