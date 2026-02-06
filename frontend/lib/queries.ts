"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMenu,
  getOrder,
  createOrder,
  simulateOrderProgress,
  type CreateOrderInput,
  type MenuItem,
  type Order,
} from "./api";

export const queryKeys = {
  menu: ["menu"] as const,
  order: (id: string) => ["order", id] as const,
  orders: ["orders"] as const,
};

export function useMenu() {
  return useQuery<MenuItem[]>({
    queryKey: queryKeys.menu,
    queryFn: getMenu,
  });
}

export function useOrder(id: string) {
  return useQuery<Order | null>({
    queryKey: queryKeys.order(id),
    queryFn: () => getOrder(id),
    enabled: !!id,
    refetchInterval: 3000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

export function useSimulateOrderProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => simulateOrderProgress(id),
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(queryKeys.order(data.id), data);
      }
    },
  });
}
