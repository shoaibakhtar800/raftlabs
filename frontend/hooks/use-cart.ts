"use client";

import { useState, useCallback, useEffect, useSyncExternalStore } from "react";
import type { MenuItem } from "@/lib/api";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

const CART_STORAGE_KEY = "food-delivery-cart";

function saveCartToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string {
  return localStorage.getItem(CART_STORAGE_KEY) || "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

export function useCart() {
  const storedData = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(storedData);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const parsed = JSON.parse(storedData);
      setItems(parsed);
    } catch {
      setItems([]);
    }
  }, [storedData]);

  const updateItems = useCallback((updater: (prev: CartItem[]) => CartItem[]) => {
    setItems((prev) => {
      const next = updater(prev);
      saveCartToStorage(next);
      return next;
    });
  }, []);

  const addItem = useCallback((menuItem: MenuItem) => {
    updateItems((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  }, [updateItems]);

  const removeItem = useCallback((menuItemId: string) => {
    updateItems((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));
  }, [updateItems]);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      updateItems((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));
      return;
    }
    updateItems((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item,
      ),
    );
  }, [updateItems]);

  const clearCart = useCallback(() => {
    updateItems(() => []);
  }, [updateItems]);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0,
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const state: CartState = {
    items,
    totalAmount,
    totalItems,
  };

  return {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}

export type UseCartReturn = ReturnType<typeof useCart>;
