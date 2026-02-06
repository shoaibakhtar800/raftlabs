import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";

// Mock Prisma
vi.mock("../lib/prisma.js", () => {
  return {
    default: {
      menuItem: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    },
  };
});

import prisma from "../lib/prisma.js";

const mockMenuItems = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Margherita Pizza",
    description: "Classic pizza with fresh tomatoes and mozzarella",
    price: 12.99,
    imageUrl: "https://example.com/pizza.jpg",
    category: "Pizza",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Classic Cheeseburger",
    description: "Juicy beef patty with cheddar cheese",
    price: 9.99,
    imageUrl: "https://example.com/burger.jpg",
    category: "Burgers",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("Menu API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/menu", () => {
    it("should return all menu items", async () => {
      vi.mocked(prisma.menuItem.findMany).mockResolvedValue(
        mockMenuItems as never,
      );

      const res = await request(app).get("/api/menu");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].name).toBe("Margherita Pizza");
    });

    it("should return empty array when no items exist", async () => {
      vi.mocked(prisma.menuItem.findMany).mockResolvedValue([] as never);

      const res = await request(app).get("/api/menu");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it("should filter by category when query param is provided", async () => {
      vi.mocked(prisma.menuItem.findMany).mockResolvedValue([
        mockMenuItems[0],
      ] as never);

      const res = await request(app).get("/api/menu?category=Pizza");

      expect(res.status).toBe(200);
      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { category: "Pizza" },
        orderBy: { category: "asc" },
      });
    });

    it("should handle server errors gracefully", async () => {
      vi.mocked(prisma.menuItem.findMany).mockRejectedValue(
        new Error("DB error"),
      );

      const res = await request(app).get("/api/menu");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Failed to fetch menu items");
    });
  });

  describe("GET /api/menu/:id", () => {
    it("should return a single menu item by ID", async () => {
      vi.mocked(prisma.menuItem.findUnique).mockResolvedValue(
        mockMenuItems[0] as never,
      );

      const res = await request(app).get(
        `/api/menu/${mockMenuItems[0].id}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Margherita Pizza");
    });

    it("should return 404 when menu item not found", async () => {
      vi.mocked(prisma.menuItem.findUnique).mockResolvedValue(null as never);

      const res = await request(app).get(
        "/api/menu/550e8400-e29b-41d4-a716-446655440099",
      );

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Menu item not found");
    });

    it("should return 400 for invalid UUID format", async () => {
      const res = await request(app).get("/api/menu/not-a-valid-uuid");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Invalid menu item ID format");
    });

    it("should handle server errors gracefully", async () => {
      vi.mocked(prisma.menuItem.findUnique).mockRejectedValue(
        new Error("DB error"),
      );

      const res = await request(app).get(
        `/api/menu/${mockMenuItems[0].id}`,
      );

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
