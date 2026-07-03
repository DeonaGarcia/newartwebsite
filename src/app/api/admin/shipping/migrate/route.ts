import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || auth.replace("Bearer ", "") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sql = getDb();
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS shipments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        order_id TEXT NOT NULL, product_id TEXT NOT NULL,
        easypost_shipment_id TEXT, carrier TEXT, service TEXT,
        rate_cost DECIMAL(10,2), label_url TEXT,
        tracking_number TEXT, tracking_url TEXT,
        destination_name TEXT NOT NULL, destination_street1 TEXT NOT NULL,
        destination_city TEXT NOT NULL, destination_state TEXT NOT NULL,
        destination_zip TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending','rates_fetched','label_purchased','shipped','delivered','error')),
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shipments_product_id ON shipments(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status)`;
    await sql`
      CREATE TABLE IF NOT EXISTS product_shipping (
        product_id TEXT PRIMARY KEY,
        canvas_width_in DECIMAL(6,2), canvas_height_in DECIMAL(6,2),
        canvas_depth_in DECIMAL(6,2), weight_lbs DECIMAL(6,2),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`;
    return NextResponse.json({ success: true, message: "Migration complete: shipments and product_shipping tables created" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
