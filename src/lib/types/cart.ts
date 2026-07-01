// ─── Cart Types ───────────────────────────────────────────────

export interface CartItem {
  productId: string;
  quantity: number;
  title: string;
  imageUrl: string;
  price: number;             // unit price in cents
  type: "original" | "print";
}

export interface Cart {
  id: string;
  sessionId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;          // in cents
  shippingCost: number | null;
  taxAmount: number | null;
  total: number | null;      // null until shipping calculated
}

export interface AddToCartRequest {
  productId: string;
  quantity?: number;          // defaults to 1
}

export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;           // 0 = remove
}

// ─── Cart Context (client-side) ─────────────────────────────

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  isLoading: boolean;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}
