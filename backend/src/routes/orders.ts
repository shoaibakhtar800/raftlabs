import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  uuidParamSchema,
  isValidStatusTransition,
  STATUS_ORDER,
} from "../lib/validation";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const validation = createOrderSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { customerName, customerPhone, customerAddress, items } =
      validation.data;

    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    if (menuItems.length !== menuItemIds.length) {
      const foundIds = new Set(menuItems.map((m) => m.id));
      const missingIds = menuItemIds.filter((id) => !foundIds.has(id));
      res.status(400).json({
        success: false,
        error: "One or more menu items not found",
        details: { missingItems: missingIds },
      });
      return;
    }

    type MenuItemType = (typeof menuItems)[number];
    const menuItemMap = new Map<string, MenuItemType>(
      menuItems.map((item) => [item.id, item]),
    );
    let totalAmount = 0;

    const orderItems = items.map((item) => {
      const menuItem = menuItemMap.get(item.menuItemId)!;
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
      };
    });

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const idValidation = uuidParamSchema.safeParse(req.params.id);
    if (!idValidation.success) {
      res.status(400).json({ success: false, error: "Invalid order ID format" });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: idValidation.data },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, error: "Failed to fetch order" });
  }
});

router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const idValidation = uuidParamSchema.safeParse(req.params.id);
    if (!idValidation.success) {
      res.status(400).json({ success: false, error: "Invalid order ID format" });
      return;
    }

    const validation = updateOrderStatusSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { status } = validation.data;

    const existingOrder = await prisma.order.findUnique({
      where: { id: idValidation.data },
    });

    if (!existingOrder) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    if (!isValidStatusTransition(existingOrder.status, status)) {
      res.status(400).json({
        success: false,
        error: `Cannot transition from ${existingOrder.status} to ${status}. Status can only move forward.`,
      });
      return;
    }

    const order = await prisma.order.update({
      where: { id: idValidation.data },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update order status" });
  }
});

router.post("/:id/simulate", async (req: Request, res: Response) => {
  try {
    const idValidation = uuidParamSchema.safeParse(req.params.id);
    if (!idValidation.success) {
      res.status(400).json({ success: false, error: "Invalid order ID format" });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: idValidation.data },
    });

    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    const currentIndex = STATUS_ORDER.indexOf(
      order.status as (typeof STATUS_ORDER)[number],
    );

    if (currentIndex >= STATUS_ORDER.length - 1) {
      const fullOrder = await prisma.order.findUnique({
        where: { id: idValidation.data },
        include: { items: { include: { menuItem: true } } },
      });
      res.json({ success: true, data: fullOrder });
      return;
    }

    const nextStatus = STATUS_ORDER[currentIndex + 1];

    const updatedOrder = await prisma.order.update({
      where: { id: idValidation.data },
      data: { status: nextStatus },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Error simulating order progress:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to simulate order progress" });
  }
});

export default router;
