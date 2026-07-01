// ─── Order Types ──────────────────────────────────────────────

export interface Order {
  id: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  customerEmail: string;
  customerName: string;
  shippingAddress: ShippingAddress;
  subtotal: number;          // cents
  shippingCost: number;      // cents
  shippingMethod: string;
  taxAmount: number;         // cents
  total: number;             // cents
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;         // cents at time of purchase
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;           // "US"
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface CheckoutSessionRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  shippingCost: number;      // cents
}
