// ─── Shipping Configuration Constants ────────────────────────

/** Dimensional weight divisor (USPS/UPS standard = 139) */
export const DIM_WEIGHT_DIVISOR = 139;

/** Ounces per pound */
export const OZ_PER_POUND = 16;

/** Default origin zip (Kailua-Kona, HI) */
export const DEFAULT_ORIGIN_ZIP = "96740";

/** Hawaii GET tax rate (4.712%) */
export const HAWAII_TAX_RATE = 0.04712;

/** Maximum items per cart */
export const MAX_CART_ITEMS = 20;

/** Cart session cookie name */
export const CART_SESSION_COOKIE = "dh_cart_session";

/** Cart session expiry (30 days in ms) */
export const CART_SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

/** Shipping method display labels */
export const METHOD_LABELS: Record<string, string> = {
  standard: "Standard Shipping",
  express: "Express Shipping",
  freight: "Freight / White Glove",
};

/** State code to zone mapping (built from DB, but fallback here) */
export const STATE_TO_ZONE_FALLBACK: Record<string, string> = {
  HI: "hawaii",
  CA: "west-coast", OR: "west-coast", WA: "west-coast", NV: "west-coast",
  AZ: "west-coast", UT: "west-coast", ID: "west-coast", MT: "west-coast",
  WY: "west-coast", CO: "west-coast", NM: "west-coast",
  TX: "central", OK: "central", KS: "central", NE: "central",
  SD: "central", ND: "central", MN: "central", IA: "central",
  MO: "central", AR: "central", LA: "central", WI: "central",
  IL: "central", IN: "central", MI: "central", OH: "central",
  KY: "central", TN: "central", MS: "central", AL: "central",
  ME: "east-coast", NH: "east-coast", VT: "east-coast", MA: "east-coast",
  RI: "east-coast", CT: "east-coast", NY: "east-coast", NJ: "east-coast",
  PA: "east-coast", DE: "east-coast", MD: "east-coast", VA: "east-coast",
  WV: "east-coast", NC: "east-coast", SC: "east-coast", GA: "east-coast",
  FL: "east-coast", DC: "east-coast",
  AK: "alaska",
};

/** US state options for address forms */
export const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];
