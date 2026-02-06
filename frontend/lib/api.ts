const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "ORDER_RECEIVED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  menuItemId: string;
  menuItem: MenuItem;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: { menuItemId: string; quantity: number }[];
}

export async function getMenu(): Promise<MenuItem[]> {
  const response = await apiRequest<MenuItem[]>("/api/menu");
  return response.data || [];
}

export async function getMenuItem(id: string): Promise<MenuItem | null> {
  const response = await apiRequest<MenuItem>(`/api/menu/${id}`);
  return response.data || null;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await apiRequest<Order>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!response.data) throw new Error("Failed to create order");
  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response = await apiRequest<Order[]>("/api/orders");
  return response.data || [];
}

export async function getOrder(id: string): Promise<Order | null> {
  const response = await apiRequest<Order>(`/api/orders/${id}`);
  return response.data || null;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | null> {
  const response = await apiRequest<Order>(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response.data || null;
}

export async function simulateOrderProgress(id: string): Promise<Order | null> {
  const response = await apiRequest<Order>(`/api/orders/${id}/simulate`, {
    method: "POST",
  });
  return response.data || null;
}
