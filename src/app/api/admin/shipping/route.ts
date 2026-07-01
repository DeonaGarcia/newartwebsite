import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { productShipping, shippingClasses, shippingZones, shippingRates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { artworks } from "@/lib/artworks";

/**
 * GET /api/admin/shipping
 * Returns all products with their shipping data status.
 */
export async function GET(req: NextRequest) {
  try {
    // Get password from cookie or header
    const password = req.headers.get("x-admin-password") ||
      req.cookies.get("admin_session")?.value;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all shipping data
    const allShipping = await db.select().from(productShipping);
    const shippingMap = new Map(allShipping.map((s) => [s.productId, s]));

    // Merge with artwork data
    const products = artworks.map((art) => {
      const shipping = shippingMap.get(art.id);
      return {
        id: art.id,
        title: art.title,
        type: art.type,
        imageUrl: `/art/${art.file}`,
        hasShippingData: !!shipping,
        shipping: shipping
          ? {
              weightOz: shipping.weightOz,
              lengthIn: shipping.lengthIn,
              widthIn: shipping.widthIn,
              heightIn: shipping.heightIn,
              shippingClassId: shipping.shippingClassId,
              requiresSeparateBox: shipping.requiresSeparateBox,
              isOversized: shipping.isOversized,
              price: shipping.price,
            }
          : null,
        missing: shipping
          ? []
          : ["weight", "length", "width", "height", "shippingClass", "price"],
      };
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Admin shipping GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/shipping
 * Save or update shipping data for a product.
 * Body: { productId, weightOz, lengthIn, widthIn, heightIn, shippingClassId, requiresSeparateBox, isOversized, price }
 */
export async function POST(req: NextRequest) {
  try {
    const password = req.headers.get("x-admin-password") ||
      req.cookies.get("admin_session")?.value;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
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

    // Validate
    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const artwork = artworks.find((a) => a.id === productId);
    if (!artwork) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!weightOz || weightOz <= 0) {
      return NextResponse.json({ error: "Weight must be > 0" }, { status: 400 });
    }

    if (!lengthIn || !widthIn || !heightIn) {
      return NextResponse.json({ error: "All dimensions required" }, { status: 400 });
    }

    if (!shippingClassId) {
      return NextResponse.json({ error: "Shipping class required" }, { status: 400 });
    }

    // Upsert
    const [existing] = await db
      .select()
      .from(productShipping)
      .where(eq(productShipping.productId, productId))
      .limit(1);

    const data = {
      productId,
      weightOz,
      lengthIn,
      widthIn,
      heightIn,
      shippingClassId,
      requiresSeparateBox: requiresSeparateBox ?? true,
      isOversized: isOversized ?? false,
      price: price || null,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(productShipping)
        .set(data)
        .where(eq(productShipping.productId, productId));
    } else {
      await db.insert(productShipping).values(data);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin shipping POST error:", error);
    return NextResponse.json(
      { error: "Failed to save shipping data" },
      { status: 500 }
    );
  }
}
