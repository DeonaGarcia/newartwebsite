import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { purchaseLabel } from "@/lib/shipping/service";
import type { BuyLabelRequest } from "@/lib/shipping/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: BuyLabelRequest = await req.json();

    if (!body.easypost_shipment_id || !body.rate_id || !body.order_id) {
      return NextResponse.json(
        { error: "easypost_shipment_id, rate_id, and order_id required" },
        { status: 400 }
      );
    }

    const result = await purchaseLabel(body);

    return NextResponse.json({
      success: true,
      label_url: result.label_url,
      tracking_number: result.tracking_number,
      tracking_url: result.tracking_url,
      carrier: result.carrier,
      service: result.service,
      your_cost: result.rate_cost,
    });
  } catch (error) {
    console.error("Label purchase error:", error);
    return NextResponse.json(
      { error: "Failed to purchase label", details: String(error) },
      { status: 500 }
    );
  }
}
