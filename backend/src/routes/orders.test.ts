import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";

// Mock Prisma
vi.mock("../lib/prisma.js", () => {
  return {
    default: {
      menuItem: {
        findMany: vi.fn(),
      },
      order: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

import prisma from "../lib/prisma.js";

const VALID_UUID_1 = "550e8400-e29b-41d4-a716-446655440001";
const VALID_UUID_2 = "550e8400-e29b-41d4-a716-446655440002";
const ORDER_UUID = "660e8400-e29b-41d4-a716-446655440010";

const mockMenuItem = {
  id: VALID_UUID_1,
  name: "Margherita Pizza",
  description: "Classic pizza",
  price: 12.99,
  imageUrl: "https://example.com/pizza.jpg",
  category: "Pizza",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockOrder = {
  id: ORDER_UUID,
  customerName: "John Doe",
  customerPhone: "1234567890",
  customerAddress: "123 Main Street, City, State 12345",
  status: "ORDER_RECEIVED",
  totalAmount: 25.98,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: "item-1",
      quantity: 2,
      unitPrice: 12.99,
      menuItemId: VALID_UUID_1,
      menuItem: mockMenuItem,
    },
  ],
};

describe("Orders API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/orders", () => {
    const validOrderInput = {
      customerName: "John Doe",
      customerPhone: "1234567890",
      customerAddress: "123 Main Street, City, State 12345",
      items: [{ menuItemId: VALID_UUID_1, quantity: 2 }],
    };

    it("should create an order successfully", async () => {
      vi.mocked(prisma.menuItem.findMany).mockResolvedValue([
        mockMenuItem,
      ] as never);
      vi.mocked(prisma.order.create).mockResolvedValue(mockOrder as never);

      const res = await request(app)
        .post("/api/orders")
        .send(validOrderInput);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customerName).toBe("John Doe");
    });

    it("should return 400 when customer name is too short", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({ ...validOrderInput, customerName: "J" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Validation failed");
    });

    it("should return 400 when phone is too short", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({ ...validOrderInput, customerPhone: "12345" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when address is too short", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({ ...validOrderInput, customerAddress: "Short" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when items array is empty", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({ ...validOrderInput, items: [] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when a menu item does not exist", async () => {
      vi.mocked(prisma.menuItem.findMany).mockResolvedValue([] as never);

      const res = await request(app)
        .post("/api/orders")
        .send(validOrderInput);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("One or more menu items not found");
    });

    it("should return 400 when body is empty", async () => {
      const res = await request(app).post("/api/orders").send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should handle server errors gracefully", async () => {
      vi.mocked(prisma.menuItem.findMany).mockRejectedValue(
        new Error("DB error"),
      );

      const res = await request(app)
        .post("/api/orders")
        .send(validOrderInput);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/orders", () => {
    it("should return all orders", async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([
        mockOrder,
      ] as never);

      const res = await request(app).get("/api/orders");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it("should return empty array when no orders exist", async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([] as never);

      const res = await request(app).get("/api/orders");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it("should handle server errors gracefully", async () => {
      vi.mocked(prisma.order.findMany).mockRejectedValue(
        new Error("DB error"),
      );

      const res = await request(app).get("/api/orders");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should return an order by ID", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(
        mockOrder as never,
      );

      const res = await request(app).get(`/api/orders/${ORDER_UUID}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(ORDER_UUID);
    });

    it("should return 404 when order not found", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null as never);

      const res = await request(app).get(
        "/api/orders/550e8400-e29b-41d4-a716-446655440099",
      );

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Order not found");
    });

    it("should return 400 for invalid UUID format", async () => {
      const res = await request(app).get("/api/orders/invalid-id");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid order ID format");
    });
  });

  describe("PATCH /api/orders/:id/status", () => {
    it("should update order status forward", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        ...mockOrder,
        status: "ORDER_RECEIVED",
      } as never);
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...mockOrder,
        status: "PREPARING",
      } as never);

      const res = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/status`)
        .send({ status: "PREPARING" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("PREPARING");
    });

    it("should reject backward status transition", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        ...mockOrder,
        status: "PREPARING",
      } as never);

      const res = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/status`)
        .send({ status: "ORDER_RECEIVED" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Cannot transition");
    });

    it("should reject same status transition", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        ...mockOrder,
        status: "PREPARING",
      } as never);

      const res = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/status`)
        .send({ status: "PREPARING" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Cannot transition");
    });

    it("should return 400 for invalid status value", async () => {
      const res = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/status`)
        .send({ status: "INVALID_STATUS" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid UUID", async () => {
      const res = await request(app)
        .patch("/api/orders/bad-id/status")
        .send({ status: "PREPARING" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid order ID format");
    });

    it("should return 404 when order not found", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null as never);

      const res = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/status`)
        .send({ status: "PREPARING" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Order not found");
    });
  });

  describe("POST /api/orders/:id/simulate", () => {
    it("should advance order to next status", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        ...mockOrder,
        status: "ORDER_RECEIVED",
      } as never);
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...mockOrder,
        status: "PREPARING",
      } as never);

      const res = await request(app).post(
        `/api/orders/${ORDER_UUID}/simulate`,
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("PREPARING");
    });

    it("should return current order when already DELIVERED", async () => {
      const deliveredOrder = {
        ...mockOrder,
        status: "DELIVERED",
      };
      vi.mocked(prisma.order.findUnique).mockResolvedValue(
        deliveredOrder as never,
      );

      const res = await request(app).post(
        `/api/orders/${ORDER_UUID}/simulate`,
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 when order not found", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null as never);

      const res = await request(app).post(
        `/api/orders/${ORDER_UUID}/simulate`,
      );

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Order not found");
    });

    it("should return 400 for invalid UUID", async () => {
      const res = await request(app).post(
        "/api/orders/not-valid/simulate",
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid order ID format");
    });
  });
});

describe("Health Check", () => {
  it("should return ok status", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });
});
