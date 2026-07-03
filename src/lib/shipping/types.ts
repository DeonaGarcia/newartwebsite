// ─── Shipping Types ──────────────────────────────────────────────
// EasyPost rate-shops across ALL carriers (USPS, FedEx, UPS, DHL, etc.)
// and picks the cheapest. All shipping is FREE to the customer.

export interface ShippingDimensions {
  canvas_width_in: number;
  canvas_height_in: number;
  canvas_depth_in: number;
  weight_lbs: number;
}

export interface ShippingProduct extends ShippingDimensions {
  product_id: string;
  title: string;
  is_oversized: boolean;
  shipping_override?: ShippingOverride;
}

export interface ShippingOverride {
  carrier_override?: string;
  service_override?: string;
  notes?: string;
}

// ─── Origin address (Deona's studio in Hawaii) ───────────────────
export const ORIGIN_ADDRESS = {
  name: "Deona Hawaii",
  street1: process.env.ORIGIN_STREET1 || "",
  city: process.env.ORIGIN_CITY || "",
  state: "HI",
  zip: process.env.ORIGIN_ZIP || "",
  country: "US",
  phone: process.env.ORIGIN_PHONE || "",
  email: "deonagarcia@gmail.com",
};

export interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  rate: number;
  currency: string;
  delivery_days: number | null;
  delivery_date: string | null;
}

export interface ShipmentRecord {
  id: string;
  order_id: string;
  product_id: string;
  easypost_shipment_id: string | null;
  carrier: string | null;
  service: string | null;
  rate_cost: number | null;
  label_url: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  status: ShipmentStatus;
  destination_name: string;
  destination_street1: string;
  destination_city: string;
  destination_state: string;
  destination_zip: string;
  created_at: string;
  updated_at: string;
}

export type ShipmentStatus =
  | "pending"
  | "rates_fetched"
  | "label_purchased"
  | "shipped"
  | "delivered"
  | "error";

export interface GetRatesRequest {
  product_id: string;
  destination: DestinationAddress;
}

export interface DestinationAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface GetRatesResponse {
  easypost_shipment_id: string;
  rates: ShippingRate[];
  cheapest: ShippingRate | null;
}

export interface BuyLabelRequest {
  easypost_shipment_id: string;
  rate_id: string;
  order_id: string;
  product_id: string;
}

export interface BuyLabelResponse {
  label_url: string;
  tracking_number: string;
  tracking_url: string;
  carrier: string;
  service: string;
  rate_cost: number;
}

export function isOversized(width_in: number, height_in: number): boolean {
  const dims = [width_in, height_in].sort((a, b) => b - a);
  return dims[0] >= 40 && dims[1] >= 30;
}
