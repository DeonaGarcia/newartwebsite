import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const sql = getDb();
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "shipments";

  try {
    if (view === "shipments") {
      const shipments = await sql`SELECT * FROM shipments ORDER BY created_at DESC LIMIT 100`;
      return NextResponse.json({ shipments });
    }
    if (view === "summary") {
      const summary = await sql`
        SELECT COUNT(*)::int as total_shipments,
          COUNT(*) FILTER (WHERE status = 'label_purchased' OR status = 'shipped' OR status = 'delivered')::int as labels_purchased,
          COALESCE(SUM(rate_cost) FILTER (WHERE rate_cost IS NOT NULL), 0)::float as total_cost,
          COALESCE(AVG(rate_cost) FILTER (WHERE rate_cost IS NOT NULL), 0)::float as avg_cost
        FROM shipments`;
      const byCarrier = await sql`
        SELECT carrier, COUNT(*)::int as count,
          COALESCE(SUM(rate_cost), 0)::float as total_cost,
          COALESCE(AVG(rate_cost), 0)::float as avg_cost
        FROM shipments WHERE carrier IS NOT NULL GROUP BY carrier ORDER BY total_cost DESC`;
      return NextResponse.json({ summary: summary[0], by_carrier: byCarrier });
    }
    return NextResponse.json({ error: "Invalid view" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  try {
    const body = await req.json();
    const { action } = body;
    if (action === "update_status") {
      const { shipment_id, status } = body;
      if (!shipment_id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      const sql = getDb();
      await sql`UPDATE shipments SET status = ${status}, updated_at = NOW() WHERE id = ${shipment_id}`;
      return NextResponse.json({ success: true });
    }
    if (action === "update_product_shipping") {
      const { product_id, canvas_width_in, canvas_height_in, canvas_depth_in, weight_lbs } = body;
      if (!product_id) return NextResponse.json({ error: "Missing product_id" }, { status: 400 });
      const sql = getDb();
      await sql`
        INSERT INTO product_shipping (product_id, canvas_width_in, canvas_height_in, canvas_depth_in, weight_lbs, updated_at)
        VALUES (${product_id}, ${canvas_width_in || null}, ${canvas_height_in || null}, ${canvas_depth_in || null}, ${weight_lbs || null}, NOW())
        ON CONFLICT (product_id) DO UPDATE SET
          canvas_width_in = EXCLUDED.canvas_width_in, canvas_height_in = EXCLUDED.canvas_height_in,
          canvas_depth_in = EXCLUDED.canvas_depth_in, weight_lbs = EXCLUDED.weight_lbs, updated_at = NOW()`;
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
