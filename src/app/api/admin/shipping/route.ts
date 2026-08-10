import { NextRequest, NextResponse } from "next/server";
import { getDb, db } from "@/lib/db/client";
import { productShipping } from "@/lib/db/schema";
import { getArtworks } from "@/lib/blob-store";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAuth(req: NextRequest): boolean {
  const headerPw = req.headers.get("x-admin-password");
  if (headerPw && headerPw === ADMIN_PASSWORD) return true;
  const auth = req.headers.get("authorization");
  if (auth) {
    const token = auth.replace("Bearer ", "");
    if (token === ADMIN_PASSWORD) return true;
  }
  return false;
}

const REQUIRED_FIELDS = ["weightOz", "lengthIn", "widthIn", "heightIn", "shippingClassId", "price"];

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "products";

  try {
    if (view === "products") {
      const artworks = await getArtworks();
      const rows = await db.select().from(productShipping);
      const byId = new Map(rows.map((r) => [r.productId, r]));

      const products = artworks.map((a) => {
        const s = byId.get(a.id) || null;
        const missing: string[] = [];
        if (!s) {
          missing.push(...REQUIRED_FIELDS);
        } else {
          if (!s.weightOz) missing.push("weightOz");
          if (!s.lengthIn) missing.push("lengthIn");
          if (!s.widthIn) missing.push("widthIn");
          if (!s.heightIn) missing.push("heightIn");
          if (!s.shippingClassId) missing.push("shippingClassId");
          if (!s.price) missing.push("price");
        }
        return {
          id: a.id,
          title: a.title,
          type: a.type,
          imageUrl: a.imageUrl,
          hasShippingData: missing.length === 0,
          shipping: s
            ? {
                weightOz: s.weightOz,
                lengthIn: s.lengthIn,
                widthIn: s.widthIn,
                heightIn: s.heightIn,
                shippingClassId: s.shippingClassId,
                requiresSeparateBox: s.requiresSeparateBox ?? true,
                isOversized: s.isOversized ?? false,
                price: s.price ?? 0,
              }
            : null,
          missing,
        };
      });

      return NextResponse.json({ products });
    }

    const sql = getDb();

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

    // ShippingManagerTab save: { productId, weightOz, lengthIn, widthIn, heightIn, shippingClassId, requiresSeparateBox, isOversized, price }
    if (!body.action && body.productId) {
      const {
        productId,
        weightOz,
        lengthIn,
        widthIn,
        heightIn,
        shippingClassId,
        requiresSeparateBox,
        isOversized,
        price,
      } = body;

      if (!weightOz || !lengthIn || !widthIn || !heightIn || !shippingClassId || !price) {
        return NextResponse.json({ error: "Missing required shipping fields" }, { status: 400 });
      }

      await db
        .insert(productShipping)
        .values({
          productId,
          weightOz,
          lengthIn,
          widthIn,
          heightIn,
          shippingClassId,
          requiresSeparateBox: requiresSeparateBox ?? true,
          isOversized: isOversized ?? false,
          price,
        })
        .onConflictDoUpdate({
          target: productShipping.productId,
          set: {
            weightOz,
            lengthIn,
            widthIn,
            heightIn,
            shippingClassId,
            requiresSeparateBox: requiresSeparateBox ?? true,
            isOversized: isOversized ?? false,
            price,
            updatedAt: new Date(),
          },
        });

      return NextResponse.json({ success: true });
    }

    const { action } = body;
    const sql = getDb();

    if (action === "update_status") {
      const { shipment_id, status } = body;
      if (!shipment_id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      await sql`UPDATE shipments SET status = ${status}, updated_at = NOW() WHERE id = ${shipment_id}`;
      return NextResponse.json({ success: true });
    }

    if (action === "update_product_shipping") {
      const { product_id, canvas_width_in, canvas_height_in, canvas_depth_in, weight_lbs } = body;
      if (!product_id) return NextResponse.json({ error: "Missing product_id" }, { status: 400 });
      await sql`
        INSERT INTO product_shipping (product_id, length_in, width_in, height_in, weight_oz, updated_at)
        VALUES (${product_id}, ${canvas_width_in || null}, ${canvas_height_in || null}, ${canvas_depth_in || null}, ${weight_lbs ? weight_lbs * 16 : null}, NOW())
        ON CONFLICT (product_id) DO UPDATE SET
          length_in = COALESCE(EXCLUDED.length_in, product_shipping.length_in),
          width_in = COALESCE(EXCLUDED.width_in, product_shipping.width_in),
          height_in = COALESCE(EXCLUDED.height_in, product_shipping.height_in),
          weight_oz = COALESCE(EXCLUDED.weight_oz, product_shipping.weight_oz),
          updated_at = NOW()`;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
