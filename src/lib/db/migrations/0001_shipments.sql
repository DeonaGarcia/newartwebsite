CREATE TABLE IF NOT EXISTS shipments (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id        TEXT NOT NULL,
  product_id      TEXT NOT NULL,
  easypost_shipment_id TEXT,
  carrier         TEXT,
  service         TEXT,
  rate_cost       NUMERIC(10,2),
  label_url       TEXT,
  tracking_number TEXT,
  tracking_url    TEXT,
  destination_name    TEXT NOT NULL,
  destination_street1 TEXT NOT NULL,
  destination_city    TEXT NOT NULL,
  destination_state   TEXT NOT NULL,
  destination_zip     TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','rates_fetched','label_purchased','shipped','delivered','error')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_product ON shipments(product_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
