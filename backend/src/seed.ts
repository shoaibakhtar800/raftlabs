import "dotenv/config";
import prisma from "./lib/prisma";

const menuItems = [
  {
    name: "Margherita Pizza",
    description:
      "Classic pizza with fresh tomatoes, mozzarella cheese, and basil",
    price: 12.99,
    imageUrl:
      "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400",
    category: "Pizza",
  },
  {
    name: "Pepperoni Pizza",
    description: "Loaded with spicy pepperoni and melted mozzarella cheese",
    price: 14.99,
    imageUrl:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
    category: "Pizza",
  },
  {
    name: "BBQ Chicken Pizza",
    description: "Grilled chicken, BBQ sauce, red onions, and cilantro",
    price: 15.99,
    imageUrl:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
    category: "Pizza",
  },
  {
    name: "Classic Cheeseburger",
    description:
      "Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce",
    price: 9.99,
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    category: "Burgers",
  },
  {
    name: "Double Bacon Burger",
    description:
      "Two beef patties with crispy bacon, cheese, and caramelized onions",
    price: 13.99,
    imageUrl:
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400",
    category: "Burgers",
  },
  {
    name: "Veggie Burger",
    description: "Plant-based patty with avocado, sprouts, and chipotle mayo",
    price: 11.99,
    imageUrl:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400",
    category: "Burgers",
  },
  {
    name: "Chicken Wings",
    description: "Crispy wings tossed in your choice of buffalo or BBQ sauce",
    price: 10.99,
    imageUrl:
      "https://images.unsplash.com/photo-1608039755401-742074f0548d?q=80&w=400",
    category: "Sides",
  },
  {
    name: "French Fries",
    description: "Golden crispy fries seasoned with sea salt",
    price: 4.99,
    imageUrl:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
    category: "Sides",
  },
  {
    name: "Caesar Salad",
    description:
      "Fresh romaine lettuce, parmesan cheese, croutons, and Caesar dressing",
    price: 8.99,
    imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
    category: "Salads",
  },
  {
    name: "Chocolate Brownie",
    description: "Warm fudgy brownie served with vanilla ice cream",
    price: 6.99,
    imageUrl:
      "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400",
    category: "Desserts",
  },
  {
    name: "Cola",
    description: "Classic refreshing cola drink",
    price: 2.49,
    imageUrl:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400",
    category: "Drinks",
  },
  {
    name: "Lemonade",
    description: "Fresh squeezed lemonade with a hint of mint",
    price: 3.49,
    imageUrl:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400",
    category: "Drinks",
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: item,
    });
  }

  console.log(`✅ Seeded ${menuItems.length} menu items`);

  const count = await prisma.menuItem.count();
  console.log(`📊 Total menu items in database: ${count}`);

  await prisma.$disconnect();
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
