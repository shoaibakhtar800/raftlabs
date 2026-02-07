import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { uuidParamSchema } from "../lib/validation.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;

    const menuItems = await prisma.menuItem.findMany({
      where: category ? { category } : undefined,
      orderBy: { category: "asc" },
    });

    res.json({ success: true, data: menuItems });
  } catch (error) {
    console.error("Error fetching menu:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch menu items" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const idValidation = uuidParamSchema.safeParse(req.params.id);
    if (!idValidation.success) {
      res.status(400).json({ success: false, error: "Invalid menu item ID format" });
      return;
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: idValidation.data },
    });

    if (!menuItem) {
      res.status(404).json({ success: false, error: "Menu item not found" });
      return;
    }

    res.json({ success: true, data: menuItem });
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch menu item" });
  }
});

export default router;
