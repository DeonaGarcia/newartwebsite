import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  real,
  jsonb,
  varchar,
  index,
} from "drizzle-orm/pg-core";

// ─── Product Shipping Data ──────────────────────────────────
// Extends static artworks.ts with shipping fields

export const productShipping = pgTable("product_shipping", {
  productId: text("product_id").primaryKey(),     // matches artwork.id
  weightOz: real("weight_oz").notNull(),
  lengthIn: real("length_in").notNull(),
  widthIn: real("width_in").notNull(),
  heightIn: real("height_in").notNull(),
  shippingClassId: text("shipping_class_id")
    .notNull()
    .references(() => shippingClasses.id),
  requiresSeparateBox: boolean("requires_separate_box").default(true),
  isOversized: boolean("is_oversized").default(false),
  originZip: varchar("origin_zip", { length: 10 }).default("96740"),
  price: integer("price"),                        // price in cents (overrides artworks.ts if set)
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Shipping Classes ───────────────────────────────────────

export const shippingClasses = pgTable("shipping_classes", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  description: text("description"),
  maxWeightOz: real("max_weight_oz").default(1200),     // 75 lbs
  maxDimensionIn: real("max_dimension_in").default(108), // 108"
});

// ─── Shipping Zones ─────────────────────────────────────────

export const shippingZones = pgTable("shipping_zones", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  states: jsonb("states").$type<string[]>().notNull(),
});

// ─── Shipping Rates ─────────────────────────────────────────

export const shippingRates = pgTable(
  "shipping_rates",
  {
    id: text("id").primaryKey(),
    shippingClassId: text("shipping_class_id")
      .notNull()
      .references(() => shippingClasses.id),
    zoneId: text("zone_id")
      .notNull()
      .references(() => shippingZones.id),
    method: varchar("method", { length: 20 }).notNull(), // standard | express | freight
    baseRate: integer("base_rate").notNull(),             // cents
    perPoundRate: integer("per_pound_rate").default(0),   // cents per pound
    minWeightOz: real("min_weight_oz").default(0),
    maxWeightOz: real("max_weight_oz").default(99999),
    estimatedDaysMin: integer("estimated_days_min").notNull(),
    estimatedDaysMax: integer("estimated_days_max").notNull(),
    enabled: boolean("enabled").default(true),
  },
  (table) => [
    index("rates_class_zone_idx").on(table.shippingClassId, table.zoneId),
  ]
);

// ─── Carts ──────────────────────────────────────────────────

export const carts = pgTable(
  "carts",
  {
    id: text("id").primaryKey(),
    sessionId: varchar("session_id", { length: 64 }).notNull().unique(),
    customerEmail: varchar("customer_email", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    index("carts_session_idx").on(table.sessionId),
  ]
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: text("id").primaryKey(),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [
    index("cart_items_cart_idx").on(table.cartId),
  ]
);

// ─── Orders ─────────────────────────────────────────────────

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    stripeSessionId: text("stripe_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    shippingAddress: jsonb("shipping_address").notNull(),
    subtotal: integer("subtotal").notNull(),      // cents
    shippingCost: integer("shipping_cost").notNull(),
    shippingMethod: varchar("shipping_method", { length: 20 }).notNull(),
    taxAmount: integer("tax_amount").notNull(),
    total: integer("total").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("orders_stripe_idx").on(table.stripeSessionId),
    index("orders_email_idx").on(table.customerEmail),
    index("orders_status_idx").on(table.status),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    imageUrl: text("image_url"),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(), // cents at purchase time
  },
  (table) => [
    index("order_items_order_idx").on(table.orderId),
  ]
);
