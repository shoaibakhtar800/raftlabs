import { z } from "zod";

export const uuidParamSchema = z.string().uuid("Invalid ID format");

export const createOrderSchema = z.object({
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  customerPhone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be less than 15 digits")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  customerAddress: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must be less than 500 characters"),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid("Invalid menu item ID"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "Order must have at least one item"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "ORDER_RECEIVED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ]),
});

export const STATUS_ORDER = [
  "ORDER_RECEIVED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export function isValidStatusTransition(
  currentStatus: string,
  newStatus: string,
): boolean {
  const currentIndex = STATUS_ORDER.indexOf(
    currentStatus as (typeof STATUS_ORDER)[number],
  );
  const newIndex = STATUS_ORDER.indexOf(
    newStatus as (typeof STATUS_ORDER)[number],
  );
  return newIndex > currentIndex;
}

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
