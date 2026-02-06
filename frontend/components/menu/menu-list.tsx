"use client";

import { useState, useMemo, useRef } from "react";
import { useMenu } from "@/lib/queries";
import { MenuItemCard } from "./menu-item-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/api";
import type { CartItem } from "@/hooks/use-cart";

interface MenuListProps {
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  cartItems: CartItem[];
}

export function MenuList({
  onAddToCart,
  onUpdateQuantity,
  cartItems,
}: MenuListProps) {
  const { data: menuItems, isLoading, error } = useMenu();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const categories = useMemo(() => {
    if (!menuItems) return [];
    return [...new Set(menuItems.map((item) => item.category))];
  }, [menuItems]);

  const cartQuantityMap = useMemo(() => {
    const map = new Map<string, number>();
    cartItems.forEach((ci) => map.set(ci.menuItem.id, ci.quantity));
    return map;
  }, [cartItems]);

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    let items = menuItems;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q),
      );
    }

    if (activeCategory) {
      items = items.filter((item) => item.category === activeCategory);
    }

    return items;
  }, [menuItems, searchQuery, activeCategory]);

  const groupedItems = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    filteredItems.forEach((item) => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });
    return grouped;
  }, [filteredItems]);

  const handleCategoryClick = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
      const el = sectionRefs.current[category];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-11 w-full max-w-md rounded-xl" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <X className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive text-lg font-medium">
          Failed to load menu
        </p>
        <p className="text-muted-foreground mt-2">
          Please check your connection and try again
        </p>
      </div>
    );
  }

  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          No menu items available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pizzas, burgers, drinks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-11 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-emerald-500"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          const count = menuItems.filter(
            (i) => i.category === category,
          ).length;
          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                isActive
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700",
              )}
            >
              {category}
              <Badge
                variant="secondary"
                className={cn(
                  "h-5 min-w-5 px-1.5 text-xs rounded-full",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400",
                )}
              >
                {count}
              </Badge>
            </button>
          );
        })}
      </div>

      {(searchQuery || activeCategory) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {filteredItems.length} item
            {filteredItems.length !== 1 ? "s" : ""}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No items found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different search term
          </p>
        </div>
      )}

      <div className="space-y-10">
        {Object.entries(groupedItems).map(([category, items]) => (
          <section
            key={category}
            ref={(el) => {
              sectionRefs.current[category] = el;
            }}
            className="scroll-mt-24"
          >
            <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={onAddToCart}
                  onUpdateQuantity={onUpdateQuantity}
                  cartQuantity={cartQuantityMap.get(item.id) || 0}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
