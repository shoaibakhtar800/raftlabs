"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import type { CartItem as CartItemType } from "@/hooks/use-cart";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { menuItem, quantity } = item;

  return (
    <div className="flex gap-3 py-4 border-b last:border-0">
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={menuItem.imageUrl}
          alt={menuItem.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm truncate">{menuItem.name}</h4>
          <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            ${(menuItem.price * quantity).toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          ${menuItem.price.toFixed(2)} each
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => onUpdateQuantity(menuItem.id, quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-6 text-center tabular-nums">
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => onUpdateQuantity(menuItem.id, quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(menuItem.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
