"use client";

import { useState } from "react";
import { US_STATES } from "@/lib/config/shipping";
import type { ShippingAddress } from "@/lib/types/order";

interface ShippingFormProps {
  onSubmit: (address: ShippingAddress) => void;
  isLoading: boolean;
}

export function ShippingForm({ onSubmit, isLoading }: ShippingFormProps) {
  const [address, setAddress] = useState<ShippingAddress>({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(address);
  };

  const update = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const inputClass =
    "w-full px-4 py-3 border border-border bg-pearl text-ocean-deep font-body text-sm focus:outline-none focus:border-turquoise-deep transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-heading text-2xl text-ocean-deep">Shipping Address</h3>

      <div>
        <label className="block text-xs font-body uppercase tracking-wider text-driftwood mb-1">
          Full Name *
        </label>
        <input
          type="text"
          required
          value={address.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputClass}
          placeholder="Full name"
        />
      </div>

      <div>
        <label className="block text-xs font-body uppercase tracking-wider text-driftwood mb-1">
          Address Line 1 *
        </label>
        <input
          type="text"
          required
          value={address.line1}
          onChange={(e) => update("line1", e.target.value)}
          className={inputClass}
          placeholder="Street address"
        />
      </div>

      <div>
        <label className="block text-xs font-body uppercase tracking-wider text-driftwood mb-1">
          Address Line 2
        </label>
        <input
          type="text"
          value={address.line2}
          onChange={(e) => update("line2", e.target.value)}
          className={inputClass}
          placeholder="Apt, suite, etc. (optional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-body uppercase tracking-wider text-driftwood mb-1">
            City *
          </label>
          <input
            type="text"
            required
            value={address.city}
            onChange={(e) => update("city", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-body uppercase tracking-wider text-driftwood mb-1">
            State *
          </label>
          <select
            required
            value={address.state}
            onChange={(e) => update("state", e.target.value)}
            className={inputClass}
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-1/2">
        <label className="block text-xs font-body uppercase tracking-wider text-driftwood mb-1">
          ZIP Code *
        </label>
        <input
          type="text"
          required
          pattern="[0-9]{5}(-[0-9]{4})?"
          value={address.postalCode}
          onChange={(e) => update("postalCode", e.target.value)}
          className={inputClass}
          placeholder="00000"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-turquoise-deep text-ocean-deep py-4 text-sm font-medium uppercase tracking-widest hover:bg-turquoise transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? "Calculating Shipping..." : "Calculate Shipping"}
      </button>
    </form>
  );
}
