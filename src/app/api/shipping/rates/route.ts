import { NextRequest, NextResponse } from "next/server";
import { getShippingRates } from "@/lib/shipping/service";
import type { GetRatesRequest } from "@/lib/shipping/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: GetRatesRequest = await req.json();

    if (!body.product_id || !body.destination?.zip) {
      return NextResponse.json(
        { error: "product_id and destination with zip required" },
        { status: 400 }
      );
    }

    const result = await getShippingRates(body);

    return NextResponse.json({
      easypost_shipment_id: result.easypost_shipment_id,
      rates: result.rates,
      cheapest: result.cheapest,
      customer_shipping_cost: 0,
      customer_shipping_label: "Free Shipping",
    });
  } catch (error) {
    console.error("Rate fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping rates", details: String(error) },
      { status: 500 }
    );
  }
}
