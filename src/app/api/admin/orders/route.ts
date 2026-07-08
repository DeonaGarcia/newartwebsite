import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { orders, orderItems } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/orders
 * Returns all orders (most recent first) with their line items.
 * Auth: admin_token cookie (same as /api/admin/artworks).
 */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));

  const withItems = await Promise.all(
    allOrders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    })
  );

  return NextResponse.json(withItems);
}
