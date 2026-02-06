"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import type { MenuItem } from "@/lib/api";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  cartQuantity: number;
}

export function MenuItemCard({
  item,
  onAddToCart,
  onUpdateQuantity,
  cartQuantity,
}: MenuItemCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border-0 shadow-sm group hover:shadow-lg transition-all duration-300 bg-white dark:bg-zinc-900 flex flex-col">
      <div className="relative h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
        {imgError ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <ShoppingCart className="h-10 w-10 mx-auto mb-1 opacity-40" />
              <span className="text-xs opacity-60">No image</span>
            </div>
          </div>
        ) : (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <Badge className="absolute top-3 left-3 bg-white/90 text-zinc-900 hover:bg-white/95 shadow-sm text-xs">
          {item.category}
        </Badge>
        {cartQuantity > 0 && (
          <Badge className="absolute top-3 right-3 bg-emerald-500 text-white hover:bg-emerald-500 shadow-sm text-xs">
            {cartQuantity} in cart
          </Badge>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-tight line-clamp-1">
            {item.name}
          </h3>
          <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5 flex-1">
          {item.description}
        </p>

        <div className="mt-3">
          {cartQuantity === 0 ? (
            <Button
              onClick={() => onAddToCart(item)}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                onClick={() => onUpdateQuantity(item.id, cartQuantity - 1)}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="font-semibold text-base tabular-nums">
                {cartQuantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                onClick={() => onUpdateQuantity(item.id, cartQuantity + 1)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
