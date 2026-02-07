"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
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
  const value = JSON.stringify(items);
  localStorage.setItem(CART_STORAGE_KEY, value);
  window.dispatchEvent(
    new StorageEvent("storage", { key: CART_STORAGE_KEY, newValue: value }),
  );
}

function readCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
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

  const items = useMemo<CartItem[]>(() => {
    try {
      return JSON.parse(storedData);
    } catch {
      return [];
    }
  }, [storedData]);

  const addItem = useCallback((menuItem: MenuItem) => {
    const current = readCart();
    const existing = current.find((item) => item.menuItem.id === menuItem.id);
    if (existing) {
      saveCartToStorage(
        current.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      saveCartToStorage([...current, { menuItem, quantity: 1 }]);
    }
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    saveCartToStorage(readCart().filter((item) => item.menuItem.id !== menuItemId));
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    const current = readCart();
    if (quantity <= 0) {
      saveCartToStorage(current.filter((item) => item.menuItem.id !== menuItemId));
      return;
    }
    saveCartToStorage(
      current.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    saveCartToStorage([]);
  }, []);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0,
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const state: CartState = { items, totalAmount, totalItems };

  return { ...state, addItem, removeItem, updateQuantity, clearCart };
}

export type UseCartReturn = ReturnType<typeof useCart>;
