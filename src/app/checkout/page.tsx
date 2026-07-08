"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { ShippingOptions } from "@/components/checkout/ShippingOptions";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CartItem } from "@/components/cart/CartItem";
import Link from "next/link";
import type { ShippingAddress } from "@/lib/types/order";
import type { ShippingQuote } from "@/lib/types/shipping";

type CheckoutStep = "address" | "shipping" | "payment";

export default function CheckoutPage() {
  const { items, itemCount, subtotal } = useCart();
  const [step, setStep] = useState<CheckoutStep>("address");
  const [address, setAddress] = useState<ShippingAddress | null>(null);
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<ShippingQuote | null>(null);
  const [taxAmount, setTaxAmount] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate tax when subtotal is known
  useEffect(() => {
    if (subtotal > 0) {
      // Hawaii GET 4.712%
      setTaxAmount(Math.round(subtotal * 0.04712));
    }
  }, [subtotal]);

  if (itemCount === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <h1 className="font-heading text-4xl text-ocean-deep mb-4">Your Cart is Empty</h1>
        <p className="text-driftwood-light mb-8">Add some artwork to get started.</p>
        <Link
          href="/originals"
          className="border border-turquoise text-turquoise px-8 py-3 text-sm tracking-widest uppercase hover:bg-turquoise hover:text-ocean-deep transition-all"
        >
          Browse Originals
        </Link>
      </div>
    );
  }

  const handleAddressSubmit = async (addr: ShippingAddress) => {
    setAddress(addr);
    setIsCalculating(true);
    setError(null);

    try {
      const res = await fetch("/api/shipping/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          address: addr,
        }),
      });

      const data = await res.json();

      if (data.blocked) {
        setError(data.reason || "Shipping isn't available for this address. Please contact us directly.");
        setQuotes([]);
      } else {
        const quote: ShippingQuote = {
          method: "standard",
          methodLabel: data.shippingLabel,
          cost: data.shippingCost,
          estimatedDaysMin: 5,
          estimatedDaysMax: 10,
          packages: [],
          warnings: [],
        };
        setQuotes([quote]);
        setWarnings([]);
        setSelectedMethod(quote.method);
        setSelectedQuote(quote);
        setStep("shipping");
      }
    } catch {
      setError("Failed to determine shipping. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    const quote = quotes.find((q) => q.method === method) || null;
    setSelectedQuote(quote);
  };

  const handleCheckout = async () => {
    if (!selectedQuote || !address) return;

    setIsCheckingOut(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingCost: selectedQuote.cost,
          shippingMethod: selectedQuote.method,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout");
      }
    } catch {
      setError("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-light">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-heading text-4xl md:text-5xl text-ocean-deep mb-2">
          Checkout
        </h1>

        {/* Progress */}
        <div className="flex gap-2 text-xs uppercase tracking-widest mb-12">
          <span className={step === "address" ? "text-turquoise-deep" : "text-driftwood-light"}>
            Address
          </span>
          <span className="text-driftwood-light">→</span>
          <span className={step === "shipping" ? "text-turquoise-deep" : "text-driftwood-light"}>
            Shipping
          </span>
          <span className="text-driftwood-light">→</span>
          <span className={step === "payment" ? "text-turquoise-deep" : "text-driftwood-light"}>
            Payment
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-coral/10 border border-coral/30 text-coral text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form Steps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cart Items */}
            <div className="bg-pearl p-6">
              <h3 className="font-heading text-xl text-ocean-deep mb-4">
                Your Items ({itemCount})
              </h3>
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <CartItem key={item.productId} item={item} showControls={false} />
                ))}
              </div>
            </div>

            {/* Step 1: Address */}
            {step === "address" && (
              <div className="bg-pearl p-6">
                <ShippingForm
                  onSubmit={handleAddressSubmit}
                  isLoading={isCalculating}
                />
              </div>
            )}

            {/* Step 2: Shipping Method */}
            {step === "shipping" && (
              <div className="bg-pearl p-6 space-y-6">
                <ShippingOptions
                  quotes={quotes}
                  selectedMethod={selectedMethod}
                  onSelect={handleMethodSelect}
                  warnings={warnings}
                />

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep("address")}
                    className="px-6 py-3 border border-border text-ocean text-sm uppercase tracking-wider hover:border-ocean transition-colors cursor-pointer"
                  >
                    ← Change Address
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={!selectedMethod || isCheckingOut}
                    className="flex-1 bg-turquoise-deep text-ocean-deep py-3 text-sm font-medium uppercase tracking-widest hover:bg-turquoise transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isCheckingOut ? "Redirecting to Payment..." : "Continue to Payment"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div>
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shippingCost={selectedQuote?.cost ?? null}
              shippingMethod={selectedQuote?.method ?? null}
              taxAmount={taxAmount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
