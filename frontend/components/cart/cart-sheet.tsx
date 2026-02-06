"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { CartItem } from "./cart-item";
import { CheckoutForm } from "../checkout/checkout-form";
import type { UseCartReturn } from "@/hooks/use-cart";

interface CartSheetProps {
  cart: UseCartReturn;
  trigger?: "icon" | "mobile-bar";
}

export function CartSheet({ cart, trigger = "icon" }: CartSheetProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOrderSuccess = () => {
    setShowCheckout(false);
    setOpen(false);
  };

  const triggerElement =
    trigger === "mobile-bar" ? (
      <SheetTrigger asChild>
        <button className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-white text-emerald-700 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cart.totalItems}
              </span>
            </div>
            <span className="font-medium">
              {cart.totalItems} item{cart.totalItems !== 1 ? "s" : ""} in cart
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              ${cart.totalAmount.toFixed(2)}
            </span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </button>
      </SheetTrigger>
    ) : (
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-11 w-11 rounded-full border-2 hover:border-emerald-500 transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          {cart.totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-emerald-500 hover:bg-emerald-500 text-white text-xs">
              {cart.totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {triggerElement}
      <SheetContent className="w-full p-4 sm:max-w-lg flex flex-col">
        <SheetHeader className="p-0">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {showCheckout ? "Checkout" : "Your Cart"}
            {!showCheckout && cart.totalItems > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
              >
                {cart.totalItems} item{cart.totalItems !== 1 ? "s" : ""}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {showCheckout ? (
          <CheckoutForm
            cart={cart}
            onBack={() => setShowCheckout(false)}
            onSuccess={handleOrderSuccess}
          />
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <p className="font-medium text-muted-foreground">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Add some delicious items from the menu!
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {cart.items.map((item) => (
                    <CartItem
                      key={item.menuItem.id}
                      item={item}
                      onUpdateQuantity={cart.updateQuantity}
                      onRemove={cart.removeItem}
                    />
                  ))}
                </div>
              )}
            </div>

            {cart.items.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal ({cart.totalItems} items)</span>
                    <span>${cart.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Free
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ${cart.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                  size="lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
