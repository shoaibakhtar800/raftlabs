import { describe, it, expect } from "vitest";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  uuidParamSchema,
  isValidStatusTransition,
} from "./validation.js";

describe("uuidParamSchema", () => {
  it("should accept a valid UUID", () => {
    const result = uuidParamSchema.safeParse(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(result.success).toBe(true);
  });

  it("should reject an invalid UUID", () => {
    const result = uuidParamSchema.safeParse("not-a-uuid");
    expect(result.success).toBe(false);
  });

  it("should reject an empty string", () => {
    const result = uuidParamSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("should reject a number", () => {
    const result = uuidParamSchema.safeParse(123);
    expect(result.success).toBe(false);
  });
});

describe("createOrderSchema", () => {
  const validOrder = {
    customerName: "John Doe",
    customerPhone: "1234567890",
    customerAddress: "123 Main Street, City, State 12345",
    items: [
      {
        menuItemId: "550e8400-e29b-41d4-a716-446655440000",
        quantity: 2,
      },
    ],
  };

  it("should accept a valid order", () => {
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it("should reject a short customer name", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      customerName: "J",
    });
    expect(result.success).toBe(false);
  });

  it("should reject an empty customer name", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      customerName: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject a name longer than 100 characters", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      customerName: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("should reject a short phone number", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      customerPhone: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("should reject an invalid phone number format", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      customerPhone: "abc1234567",
    });
    expect(result.success).toBe(false);
  });

  it("should accept phone numbers with special characters", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      customerPhone: "+1 234-567890",
    });
    expect(result.success).toBe(true);
  });

  it("should reject a short address", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      customerAddress: "Short",
    });
    expect(result.success).toBe(false);
  });

  it("should reject an address longer than 500 characters", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      customerAddress: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("should reject an order with no items", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject an item with quantity 0", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      items: [
        {
          menuItemId: "550e8400-e29b-41d4-a716-446655440000",
          quantity: 0,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject an item with negative quantity", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      items: [
        {
          menuItemId: "550e8400-e29b-41d4-a716-446655440000",
          quantity: -1,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject an item with decimal quantity", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      items: [
        {
          menuItemId: "550e8400-e29b-41d4-a716-446655440000",
          quantity: 1.5,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject an item with invalid menuItemId", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      items: [{ menuItemId: "not-a-uuid", quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("should accept multiple items", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      items: [
        {
          menuItemId: "550e8400-e29b-41d4-a716-446655440000",
          quantity: 2,
        },
        {
          menuItemId: "660e8400-e29b-41d4-a716-446655440001",
          quantity: 1,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject when required fields are missing", () => {
    const result = createOrderSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateOrderStatusSchema", () => {
  it("should accept ORDER_RECEIVED", () => {
    const result = updateOrderStatusSchema.safeParse({
      status: "ORDER_RECEIVED",
    });
    expect(result.success).toBe(true);
  });

  it("should accept PREPARING", () => {
    const result = updateOrderStatusSchema.safeParse({ status: "PREPARING" });
    expect(result.success).toBe(true);
  });

  it("should accept OUT_FOR_DELIVERY", () => {
    const result = updateOrderStatusSchema.safeParse({
      status: "OUT_FOR_DELIVERY",
    });
    expect(result.success).toBe(true);
  });

  it("should accept DELIVERED", () => {
    const result = updateOrderStatusSchema.safeParse({ status: "DELIVERED" });
    expect(result.success).toBe(true);
  });

  it("should reject an invalid status", () => {
    const result = updateOrderStatusSchema.safeParse({ status: "CANCELLED" });
    expect(result.success).toBe(false);
  });

  it("should reject an empty status", () => {
    const result = updateOrderStatusSchema.safeParse({ status: "" });
    expect(result.success).toBe(false);
  });

  it("should reject missing status", () => {
    const result = updateOrderStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("isValidStatusTransition", () => {
  it("should allow ORDER_RECEIVED -> PREPARING", () => {
    expect(isValidStatusTransition("ORDER_RECEIVED", "PREPARING")).toBe(true);
  });

  it("should allow ORDER_RECEIVED -> OUT_FOR_DELIVERY (skip)", () => {
    expect(isValidStatusTransition("ORDER_RECEIVED", "OUT_FOR_DELIVERY")).toBe(
      true,
    );
  });

  it("should allow ORDER_RECEIVED -> DELIVERED (skip)", () => {
    expect(isValidStatusTransition("ORDER_RECEIVED", "DELIVERED")).toBe(true);
  });

  it("should allow PREPARING -> OUT_FOR_DELIVERY", () => {
    expect(isValidStatusTransition("PREPARING", "OUT_FOR_DELIVERY")).toBe(true);
  });

  it("should allow PREPARING -> DELIVERED", () => {
    expect(isValidStatusTransition("PREPARING", "DELIVERED")).toBe(true);
  });

  it("should allow OUT_FOR_DELIVERY -> DELIVERED", () => {
    expect(isValidStatusTransition("OUT_FOR_DELIVERY", "DELIVERED")).toBe(true);
  });

  it("should NOT allow backward: PREPARING -> ORDER_RECEIVED", () => {
    expect(isValidStatusTransition("PREPARING", "ORDER_RECEIVED")).toBe(false);
  });

  it("should NOT allow backward: DELIVERED -> PREPARING", () => {
    expect(isValidStatusTransition("DELIVERED", "PREPARING")).toBe(false);
  });

  it("should NOT allow same status: PREPARING -> PREPARING", () => {
    expect(isValidStatusTransition("PREPARING", "PREPARING")).toBe(false);
  });

  it("should NOT allow DELIVERED -> DELIVERED", () => {
    expect(isValidStatusTransition("DELIVERED", "DELIVERED")).toBe(false);
  });
});
