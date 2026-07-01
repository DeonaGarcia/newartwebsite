import { NextRequest, NextResponse } from "next/server";
import { calculateShipping } from "@/lib/services/shipping";
import type { ShippingCalculationRequest } from "@/lib/types/shipping";

/**
 * POST /api/shipping/calculate
 * Body: { items: [{ productId, quantity }], destinationState, destinationZip }
 * Returns: { quotes, errors, warnings }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ShippingCalculationRequest;

    // Validate input
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart items required" },
        { status: 400 }
      );
    }

    if (!body.destinationState) {
      return NextResponse.json(
        { error: "Destination state required" },
        { status: 400 }
      );
    }

    // Validate state code
    const stateCode = body.destinationState.toUpperCase();
    if (stateCode.length !== 2) {
      return NextResponse.json(
        { error: "Invalid state code — use 2-letter abbreviation" },
        { status: 400 }
      );
    }

    const result = await calculateShipping({
      ...body,
      destinationState: stateCode,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate shipping rates" },
      { status: 500 }
    );
  }
}
