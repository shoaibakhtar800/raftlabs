"use client";

import { useCart } from "@/hooks/use-cart";
import { MenuList } from "@/components/menu/menu-list";
import { CartSheet } from "@/components/cart/cart-sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/lib/api";

export default function Home() {
  const cart = useCart();

  const handleAddToCart = (item: MenuItem) => {
    cart.addItem(item);
    toast.success(`${item.name} added to cart!`, {
      description: `$${item.price.toFixed(2)}`,
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                  FoodieExpress
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Delicious food, fast delivery
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <CartSheet cart={cart} />
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-amber-500/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Delicious Food
              </span>
              <br />
              <span className="text-zinc-900 dark:text-white">
                Delivered Fast
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Order from our menu of delicious pizzas, burgers, sides, and more.
              Fast delivery right to your doorstep!
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 pb-28 md:pb-16">
        <MenuList
          onAddToCart={handleAddToCart}
          onUpdateQuantity={cart.updateQuantity}
          cartItems={cart.items}
        />
      </main>

      {cart.totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <div className="bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
            <CartSheet cart={cart} trigger="mobile-bar" />
          </div>
        </div>
      )}

      <footer className="border-t border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold">FoodieExpress</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 FoodieExpress. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
