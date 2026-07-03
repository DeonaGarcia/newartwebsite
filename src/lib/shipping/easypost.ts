import EasyPostApi from "@easypost/api";
import { ORIGIN_ADDRESS } from "./types";
import type { ShippingRate, GetRatesResponse, BuyLabelResponse } from "./types";

let client: EasyPostApi | null = null;

function getClient(): EasyPostApi {
  if (!client) {
    const apiKey = process.env.EASYPOST_API_KEY;
    if (!apiKey) throw new Error("EASYPOST_API_KEY env var is not set");
    client = new EasyPostApi(apiKey);
  }
  return client;
}

export async function getRates(params: {
  width_in: number;
  height_in: number;
  depth_in: number;
  weight_lbs: number;
  destination: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}): Promise<GetRatesResponse> {
  const ep = getClient();

  const shipment = await ep.Shipment.create({
    from_address: {
      name: ORIGIN_ADDRESS.name,
      street1: ORIGIN_ADDRESS.street1,
      city: ORIGIN_ADDRESS.city,
      state: ORIGIN_ADDRESS.state,
      zip: ORIGIN_ADDRESS.zip,
      country: ORIGIN_ADDRESS.country,
      phone: ORIGIN_ADDRESS.phone,
      email: ORIGIN_ADDRESS.email,
    },
    to_address: {
      name: params.destination.name,
      street1: params.destination.street1,
      street2: params.destination.street2 || "",
      city: params.destination.city,
      state: params.destination.state,
      zip: params.destination.zip,
      country: params.destination.country,
    },
    parcel: {
      length: params.height_in,
      width: params.width_in,
      height: params.depth_in,
      weight: params.weight_lbs * 16, // EasyPost wants ounces
    },
  });

  const rates: ShippingRate[] = (shipment.rates || [])
    .map((r: any) => ({
      id: r.id,
      carrier: r.carrier,
      service: r.service,
      rate: parseFloat(r.rate),
      currency: r.currency,
      delivery_days: r.delivery_days ?? r.est_delivery_days ?? null,
      delivery_date: r.delivery_date ?? null,
    }))
    .sort((a: ShippingRate, b: ShippingRate) => a.rate - b.rate);

  return {
    easypost_shipment_id: shipment.id,
    rates,
    cheapest: rates[0] || null,
  };
}

export async function buyLabel(params: {
  easypost_shipment_id: string;
  rate_id: string;
}): Promise<BuyLabelResponse> {
  const ep = getClient();

  const shipment = await ep.Shipment.retrieve(params.easypost_shipment_id);
  const purchased = await ep.Shipment.buy(shipment.id, params.rate_id);

  const postage = purchased.postage_label;
  const tracker = purchased.tracker;
  const selectedRate = purchased.selected_rate;

  return {
    label_url: postage?.label_url || "",
    tracking_number: purchased.tracking_code || "",
    tracking_url: tracker?.public_url || "",
    carrier: selectedRate?.carrier || "",
    service: selectedRate?.service || "",
    rate_cost: parseFloat(selectedRate?.rate || "0"),
  };
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`EasyPost attempt ${attempt + 1} failed:`, lastError.message);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}
