// ─── Shipping Types ───────────────────────────────────────────

export interface ProductShipping {
  productId: string;
  weightOz: number;          // actual weight in ounces
  lengthIn: number;          // package length in inches
  widthIn: number;           // package width in inches
  heightIn: number;          // package height in inches
  shippingClassId: string;
  requiresSeparateBox: boolean;
  isOversized: boolean;
  originZip: string;         // defaults to 96740
}

export interface ShippingClass {
  id: string;
  name: string;
  label: string;             // display name
  description: string;
  maxWeightOz: number;       // max weight for this class
  maxDimensionIn: number;    // max single dimension
}

export interface ShippingZone {
  id: string;
  name: string;
  states: string[];          // state codes (e.g., ["CA","OR","WA"])
}

export interface ShippingRate {
  id: string;
  shippingClassId: string;
  zoneId: string;
  method: ShippingMethod;
  baseRate: number;          // flat base cost in cents
  perPoundRate: number;      // additional cost per pound in cents
  minWeightOz: number;
  maxWeightOz: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  enabled: boolean;
}

export type ShippingMethod = "standard" | "express" | "freight";

export interface ShippingQuote {
  method: ShippingMethod;
  methodLabel: string;
  cost: number;              // total cost in cents
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  packages: PackageInfo[];
  warnings: string[];
}

export interface PackageInfo {
  productIds: string[];
  actualWeightOz: number;
  dimensionalWeightOz: number;
  billableWeightOz: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  shippingClassId: string;
}

export interface ShippingCalculationRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  destinationState: string;
  destinationZip: string;
}

export interface ShippingCalculationResult {
  quotes: ShippingQuote[];
  errors: string[];
  warnings: string[];
}

// ─── Dimensional weight config ──────────────────────────────

export const DIM_WEIGHT_DIVISOR = 139; // USPS/UPS standard
export const OZ_PER_POUND = 16;
