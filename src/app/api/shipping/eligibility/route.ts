import { NextRequest, NextResponse } from "next/server";
import { getPublicArtworks } from "@/lib/blob-store";
import { evaluateShippingEligibility } from "@/lib/shipping-eligibility";

export const dynamic = "force-dynamic";

/**
 * POST /api/shipping/eligibility
 * Body: { items: [{ productId, quantity }], address: ShippingAddress }
 *
 * Determines whether checkout can proceed automatically for this cart +
 * address, and at what shipping cost. See src/lib/shipping-eligibility.ts
 * for the underlying rules (international blocked, large paintings off the
 * Big Island get a $250 flat surcharge, everything else free).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: Array<{ productId: string }> = body.items || [];
    const address = body.address || {};

    const [originals, prints] = await Promise.all([
      getPublicArtworks("original"),
      getPublicArtworks("print"),
    ]);
    const all = [...originals, ...prints];

    const hasLargeItem = items.some((item) => {
      const artwork = all.find((a) => a.id === item.productId);
      return artwork ? !artwork.freeShipping : false;
    });

    const result = evaluateShippingEligibility({
      hasLargeItem,
      country: address.country,
      zip: address.postalCode,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Shipping eligibility check failed:", error);
    return NextResponse.json(
      { error: "Failed to determine shipping eligibility" },
      { status: 500 }
    );
  }
}

