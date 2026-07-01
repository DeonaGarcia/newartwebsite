import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * POST /api/admin/shipping/migrate
 * Run the shipping system migration SQL.
 * Protected by admin password.
 */
export async function POST(req: NextRequest) {
  try {
    const password = req.headers.get("x-admin-password") ||
      req.cookies.get("admin_session")?.value;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run migration SQL inline (since file reads may not work in Vercel)
    const statements = [
      // Shipping classes
      `CREATE TABLE IF NOT EXISTS shipping_classes (
        id TEXT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        label VARCHAR(100) NOT NULL,
        description TEXT,
        max_weight_oz REAL DEFAULT 1200,
        max_dimension_in REAL DEFAULT 108
      )`,

      // Shipping zones
      `CREATE TABLE IF NOT EXISTS shipping_zones (
        id TEXT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        states JSONB NOT NULL
      )`,

      // Product shipping
      `CREATE TABLE IF NOT EXISTS product_shipping (
        product_id TEXT PRIMARY KEY,
        weight_oz REAL NOT NULL,
        length_in REAL NOT NULL,
        width_in REAL NOT NULL,
        height_in REAL NOT NULL,
        shipping_class_id TEXT NOT NULL REFERENCES shipping_classes(id),
        requires_separate_box BOOLEAN DEFAULT TRUE,
        is_oversized BOOLEAN DEFAULT FALSE,
        origin_zip VARCHAR(10) DEFAULT '96740',
        price INTEGER,
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      // Shipping rates
      `CREATE TABLE IF NOT EXISTS shipping_rates (
        id TEXT PRIMARY KEY,
        shipping_class_id TEXT NOT NULL REFERENCES shipping_classes(id),
        zone_id TEXT NOT NULL REFERENCES shipping_zones(id),
        method VARCHAR(20) NOT NULL,
        base_rate INTEGER NOT NULL,
        per_pound_rate INTEGER DEFAULT 0,
        min_weight_oz REAL DEFAULT 0,
        max_weight_oz REAL DEFAULT 99999,
        estimated_days_min INTEGER NOT NULL,
        estimated_days_max INTEGER NOT NULL,
        enabled BOOLEAN DEFAULT TRUE
      )`,

      `CREATE INDEX IF NOT EXISTS rates_class_zone_idx ON shipping_rates(shipping_class_id, zone_id)`,

      // Carts
      `CREATE TABLE IF NOT EXISTS carts (
        id TEXT PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL UNIQUE,
        customer_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP
      )`,

      `CREATE INDEX IF NOT EXISTS carts_session_idx ON carts(session_id)`,

      // Cart items
      `CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1
      )`,

      `CREATE INDEX IF NOT EXISTS cart_items_cart_idx ON cart_items(cart_id)`,

      // Orders
      `CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        stripe_session_id TEXT UNIQUE,
        stripe_payment_intent_id TEXT,
        customer_email VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        shipping_address JSONB NOT NULL,
        subtotal INTEGER NOT NULL,
        shipping_cost INTEGER NOT NULL,
        shipping_method VARCHAR(20) NOT NULL,
        tax_amount INTEGER NOT NULL,
        total INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE INDEX IF NOT EXISTS orders_stripe_idx ON orders(stripe_session_id)`,
      `CREATE INDEX IF NOT EXISTS orders_email_idx ON orders(customer_email)`,
      `CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status)`,

      // Order items
      `CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL,
        title VARCHAR(255) NOT NULL,
        image_url TEXT,
        quantity INTEGER NOT NULL,
        unit_price INTEGER NOT NULL
      )`,

      `CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id)`,
    ];

    // Run each statement
    for (const stmt of statements) {
      await sql.query(stmt);
    }

    // Seed default data
    await sql.query(`
      INSERT INTO shipping_classes (id, name, label, description, max_weight_oz, max_dimension_in) VALUES
        ('small-print', 'small-print', 'Small Print', 'Prints up to 16x20', 128, 30),
        ('medium-painting', 'medium-painting', 'Medium Painting', 'Paintings up to 24x36', 640, 48),
        ('large-painting', 'large-painting', 'Large Painting', 'Paintings 36-60"', 1200, 72),
        ('oversized', 'oversized', 'Oversized', 'Art over 60" or 75 lbs', 99999, 999)
      ON CONFLICT (id) DO NOTHING
    `);

    await sql.query(`
      INSERT INTO shipping_zones (id, name, states) VALUES
        ('hawaii', 'Hawaii (Local)', '["HI"]'),
        ('west-coast', 'West Coast', '["CA","OR","WA","NV","AZ","UT","ID","MT","WY","CO","NM"]'),
        ('central', 'Central', '["TX","OK","KS","NE","SD","ND","MN","IA","MO","AR","LA","WI","IL","IN","MI","OH","KY","TN","MS","AL"]'),
        ('east-coast', 'East Coast', '["ME","NH","VT","MA","RI","CT","NY","NJ","PA","DE","MD","VA","WV","NC","SC","GA","FL","DC"]'),
        ('alaska', 'Alaska', '["AK"]')
      ON CONFLICT (id) DO NOTHING
    `);

    await sql.query(`
      INSERT INTO shipping_rates (id, shipping_class_id, zone_id, method, base_rate, per_pound_rate, estimated_days_min, estimated_days_max) VALUES
        ('sp-hi-std', 'small-print', 'hawaii', 'standard', 1200, 0, 2, 4),
        ('sp-wc-std', 'small-print', 'west-coast', 'standard', 2500, 100, 5, 8),
        ('sp-ct-std', 'small-print', 'central', 'standard', 2800, 100, 7, 10),
        ('sp-ec-std', 'small-print', 'east-coast', 'standard', 3200, 100, 7, 12),
        ('sp-ak-std', 'small-print', 'alaska', 'standard', 3500, 150, 8, 14),
        ('sp-wc-exp', 'small-print', 'west-coast', 'express', 4500, 150, 2, 4),
        ('sp-ct-exp', 'small-print', 'central', 'express', 5000, 150, 3, 5),
        ('sp-ec-exp', 'small-print', 'east-coast', 'express', 5500, 150, 3, 5),
        ('mp-hi-std', 'medium-painting', 'hawaii', 'standard', 2500, 200, 2, 4),
        ('mp-wc-std', 'medium-painting', 'west-coast', 'standard', 5500, 300, 5, 10),
        ('mp-ct-std', 'medium-painting', 'central', 'standard', 6500, 350, 7, 12),
        ('mp-ec-std', 'medium-painting', 'east-coast', 'standard', 7500, 400, 8, 14),
        ('mp-ak-std', 'medium-painting', 'alaska', 'standard', 8000, 400, 10, 16),
        ('mp-wc-exp', 'medium-painting', 'west-coast', 'express', 9500, 450, 3, 5),
        ('mp-ct-exp', 'medium-painting', 'central', 'express', 10500, 500, 3, 6),
        ('mp-ec-exp', 'medium-painting', 'east-coast', 'express', 11500, 500, 4, 6),
        ('lp-hi-std', 'large-painting', 'hawaii', 'standard', 5000, 400, 3, 5),
        ('lp-wc-std', 'large-painting', 'west-coast', 'standard', 12000, 500, 7, 14),
        ('lp-ct-std', 'large-painting', 'central', 'standard', 15000, 600, 10, 16),
        ('lp-ec-std', 'large-painting', 'east-coast', 'standard', 18000, 700, 10, 18),
        ('lp-ak-std', 'large-painting', 'alaska', 'standard', 16000, 600, 12, 20),
        ('os-wc-frt', 'oversized', 'west-coast', 'freight', 25000, 800, 14, 21),
        ('os-ct-frt', 'oversized', 'central', 'freight', 30000, 900, 14, 28),
        ('os-ec-frt', 'oversized', 'east-coast', 'freight', 35000, 1000, 14, 28)
      ON CONFLICT (id) DO NOTHING
    `);

    return NextResponse.json({
      success: true,
      message: "Migration complete — tables created, seed data inserted",
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: `Migration failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
