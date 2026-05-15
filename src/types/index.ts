export type Role = "admin" | "manager" | "cashier" | "customer";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: Role;
}

export interface Product {
  id?: number;
  sku: string | null;
  barcode: string | null;
  name: string;
  price: number;
  selling_price: number;
  stock: number;
  image_url?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = "cash" | "promptpay" | "credit_card" | "transfer";

export type OrderType = "pos" | "online";

export interface OrderRequest {
  user_id?: number;
  order_type: OrderType;
  payment_method: PaymentMethod;
  items: {
    product_id?: number;
    sku?: string | null;
    quantity: number;
    price: number;
  }[];
  total_price: number;
  received_amount?: number;
  change_amount?: number;
}

export interface PaymentNotification {
  type: "payment";
  status: "paid" | "failed";
  order_id: string;
}
