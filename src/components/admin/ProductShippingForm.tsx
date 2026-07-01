"use client";

import { useState } from "react";

interface ProductShippingData {
  productId: string;
  title: string;
  weightOz: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  shippingClassId: string;
  requiresSeparateBox: boolean;
  isOversized: boolean;
  price: number; // cents
}

interface ProductShippingFormProps {
  product: ProductShippingData;
  onSave: (data: ProductShippingData) => Promise<void>;
  onCancel: () => void;
}

const SHIPPING_CLASSES = [
  { id: "small-print", label: "Small Print (up to 16×20)" },
  { id: "medium-painting", label: "Medium Painting (up to 24×36)" },
  { id: "large-painting", label: "Large Painting (36–60\")" },
  { id: "oversized", label: "Oversized (60\"+, freight)" },
];

export function ProductShippingForm({ product, onSave, onCancel }: ProductShippingFormProps) {
  const [data, setData] = useState<ProductShippingData>(product);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof ProductShippingData>(
    field: K,
    value: ProductShippingData[K]
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (data.weightOz <= 0) { setError("Weight must be greater than 0"); return; }
    if (data.lengthIn <= 0 || data.widthIn <= 0 || data.heightIn <= 0) {
      setError("All dimensions must be greater than 0"); return;
    }
    if (data.price <= 0) { setError("Price must be greater than 0"); return; }

    setSaving(true);
    try {
      await onSave(data);
    } catch (err) {
      setError("Failed to save shipping data");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:border-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white border border-gray-200 rounded">
      <h4 className="font-semibold text-gray-900">{data.title}</h4>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>
      )}

      {/* Price */}
      <div>
        <label className="block text-xs text-gray-500 uppercase mb-1">Price (USD) *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={data.price / 100}
          onChange={(e) => update("price", Math.round(parseFloat(e.target.value || "0") * 100))}
          className={inputClass}
          placeholder="0.00"
        />
      </div>

      {/* Weight */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Weight (oz) *</label>
          <input
            type="number"
            step="0.1"
            min="0"
            required
            value={data.weightOz || ""}
            onChange={(e) => update("weightOz", parseFloat(e.target.value || "0"))}
            className={inputClass}
          />
          <span className="text-xs text-gray-400 mt-0.5 block">
            = {(data.weightOz / 16).toFixed(1)} lbs
          </span>
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Shipping Class *</label>
          <select
            required
            value={data.shippingClassId}
            onChange={(e) => update("shippingClassId", e.target.value)}
            className={inputClass}
          >
            <option value="">Select class</option>
            {SHIPPING_CLASSES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <label className="block text-xs text-gray-500 uppercase mb-1">
          Package Dimensions (inches) *
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              value={data.lengthIn || ""}
              onChange={(e) => update("lengthIn", parseFloat(e.target.value || "0"))}
              className={inputClass}
              placeholder="Length"
            />
            <span className="text-xs text-gray-400">L</span>
          </div>
          <div>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              value={data.widthIn || ""}
              onChange={(e) => update("widthIn", parseFloat(e.target.value || "0"))}
              className={inputClass}
              placeholder="Width"
            />
            <span className="text-xs text-gray-400">W</span>
          </div>
          <div>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              value={data.heightIn || ""}
              onChange={(e) => update("heightIn", parseFloat(e.target.value || "0"))}
              className={inputClass}
              placeholder="Height"
            />
            <span className="text-xs text-gray-400">H</span>
          </div>
        </div>
        {data.lengthIn > 0 && data.widthIn > 0 && data.heightIn > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Dim weight: {Math.ceil((data.lengthIn * data.widthIn * data.heightIn) / 139 * 16)} oz
            ({((data.lengthIn * data.widthIn * data.heightIn) / 139).toFixed(1)} lbs)
          </p>
        )}
      </div>

      {/* Flags */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={data.requiresSeparateBox}
            onChange={(e) => update("requiresSeparateBox", e.target.checked)}
            className="w-4 h-4"
          />
          Requires separate box
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={data.isOversized}
            onChange={(e) => update("isOversized", e.target.checked)}
            className="w-4 h-4"
          />
          Oversized
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving..." : "Save Shipping Data"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-600 text-sm hover:border-gray-400 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
