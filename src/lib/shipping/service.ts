import { getRates, buyLabel, withRetry } from "./easypost";
import { getDb } from "@/lib/db/client";
import type {
  GetRatesRequest,
  GetRatesResponse,
  BuyLabelRequest,
  BuyLabelResponse,
  ShipmentRecord,
  ShipmentStatus,
} from "./types";
import { getArtworks } from "@/lib/blob-store";

export async function getShippingRates(
  req: GetRatesRequest
): Promise<GetRatesResponse> {
  const artworks = await getArtworks();
  const product = artworks.find((a) => a.id === req.product_id);
  if (!product) throw new Error(`Product not found: ${req.product_id}`);

  const width = product.canvas_width_in || 20;
  const height = product.canvas_height_in || 16;
  const depth = product.canvas_depth_in || 2;
  const weight = product.weight_lbs || 5;

  const result = await withRetry(() =>
    getRates({
      width_in: width,
      height_in: height,
      depth_in: depth,
      weight_lbs: weight,
      destination: req.destination,
    })
  );

  return result;
}

export async function purchaseLabel(
  req: BuyLabelRequest
): Promise<BuyLabelResponse> {
  const result = await withRetry(() =>
    buyLabel({
      easypost_shipment_id: req.easypost_shipment_id,
      rate_id: req.rate_id,
    })
  );

  const sql = getDb();
  await sql`
    UPDATE shipments SET
      carrier = ${result.carrier},
      service = ${result.service},
      rate_cost = ${result.rate_cost},
      label_url = ${result.label_url},
      tracking_number = ${result.tracking_number},
      tracking_url = ${result.tracking_url},
      status = 'label_purchased',
      updated_at = now()
    WHERE order_id = ${req.order_id} AND product_id = ${req.product_id}
  `;

  return result;
}

export async function createShipmentRecord(params: {
  order_id: string;
  product_id: string;
  easypost_shipment_id: string;
  destination_name: string;
  destination_street1: string;
  destination_city: string;
  destination_state: string;
  destination_zip: string;
}): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO shipments (
      order_id, product_id, easypost_shipment_id,
      destination_name, destination_street1, destination_city,
      destination_state, destination_zip,
      status
    ) VALUES (
      ${params.order_id}, ${params.product_id}, ${params.easypost_shipment_id},
      ${params.destination_name}, ${params.destination_street1},
      ${params.destination_city}, ${params.destination_state},
      ${params.destination_zip},
      'rates_fetched'
    )
  `;
}

export async function getAllShipments(): Promise<ShipmentRecord[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM shipments ORDER BY created_at DESC
  `;
  return rows as unknown as ShipmentRecord[];
}

export async function getShipmentsByOrder(
  orderId: string
): Promise<ShipmentRecord[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM shipments WHERE order_id = ${orderId}
  `;
  return rows as unknown as ShipmentRecord[];
}

export async function updateShipmentStatus(
  id: string,
  status: ShipmentStatus,
  errorMessage?: string
): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE shipments SET
      status = ${status},
      error_message = ${errorMessage || null},
      updated_at = now()
    WHERE id = ${id}
  `;
}

export async function getShippingCostSummary(): Promise<{
  total_cost: number;
  shipment_count: number;
  by_carrier: Record<string, { count: number; total: number }>;
}> {
  const sql = getDb();

  const totalRows = await sql`
    SELECT
      COUNT(*)::int as count,
      COALESCE(SUM(rate_cost), 0)::numeric as total
    FROM shipments
    WHERE status IN ('label_purchased', 'shipped', 'delivered')
  `;

  const carrierRows = await sql`
    SELECT
      carrier,
      COUNT(*)::int as count,
      COALESCE(SUM(rate_cost), 0)::numeric as total
    FROM shipments
    WHERE status IN ('label_purchased', 'shipped', 'delivered')
      AND carrier IS NOT NULL
    GROUP BY carrier
  `;

  const byCarrier: Record<string, { count: number; total: number }> = {};
  for (const row of carrierRows) {
    byCarrier[row.carrier as string] = {
      count: Number(row.count),
      total: Number(row.total),
    };
  }

  return {
    total_cost: Number(totalRows[0]?.total || 0),
    shipment_count: Number(totalRows[0]?.count || 0),
    by_carrier: byCarrier,
  };
}
