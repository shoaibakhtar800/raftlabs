"use client";

import { useEffect } from "react";
import { useOrder, useSimulateOrderProgress } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Clock,
  ChefHat,
  Truck,
  Package,
  RefreshCw,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import type { OrderStatus as OrderStatusType } from "@/lib/api";

interface OrderStatusProps {
  orderId: string;
}

const statusConfig: Record<
  OrderStatusType,
  { label: string; description: string; icon: React.ElementType; color: string }
> = {
  ORDER_RECEIVED: {
    label: "Order Received",
    description: "Your order has been confirmed",
    icon: Package,
    color: "bg-blue-500",
  },
  PREPARING: {
    label: "Preparing",
    description: "The kitchen is preparing your food",
    icon: ChefHat,
    color: "bg-amber-500",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    description: "Your rider is on the way",
    icon: Truck,
    color: "bg-purple-500",
  },
  DELIVERED: {
    label: "Delivered",
    description: "Enjoy your meal!",
    icon: Check,
    color: "bg-emerald-500",
  },
};

const statusOrder: OrderStatusType[] = [
  "ORDER_RECEIVED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function getEstimatedTime(status: OrderStatusType): string {
  switch (status) {
    case "ORDER_RECEIVED":
      return "30-45 min";
    case "PREPARING":
      return "20-35 min";
    case "OUT_FOR_DELIVERY":
      return "10-15 min";
    case "DELIVERED":
      return "Delivered";
  }
}

export function OrderStatus({ orderId }: OrderStatusProps) {
  const { data: order, isLoading, error } = useOrder(orderId);
  const simulateProgress = useSimulateOrderProgress();

  useEffect(() => {
    if (!order) return;
    if (order.status === "DELIVERED") return;

    const timer = setTimeout(() => {
      simulateProgress.mutate(orderId);
    }, 10000);

    return () => clearTimeout(timer);
  }, [order, orderId, simulateProgress]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <Package className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive text-lg font-medium">Order not found</p>
        <p className="text-muted-foreground mt-2">
          We couldn&apos;t find this order. Please check the order ID.
        </p>
      </div>
    );
  }

  const currentStatusIndex = statusOrder.indexOf(order.status);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order Status</h1>
          <p className="text-muted-foreground">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {order.status !== "DELIVERED" && (
            <div className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full">
              <Clock className="h-4 w-4" />
              <span>Est. {getEstimatedTime(order.status)}</span>
            </div>
          )}
          <Badge
            className={`${statusConfig[order.status].color} text-white px-4 py-2`}
          >
            {statusConfig[order.status].label}
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-0">
            {statusOrder.map((status, index) => {
              const config = statusConfig[status];
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isLast = index === statusOrder.length - 1;
              const Icon = config.icon;

              return (
                <div key={status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 flex-shrink-0 ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                          : "bg-zinc-100 dark:bg-zinc-800 text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-emerald-500/20 scale-110" : ""}`}
                    >
                      {isCompleted && !isCurrent ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 min-h-8 transition-colors duration-500 ${
                          index < currentStatusIndex
                            ? "bg-emerald-500"
                            : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                      />
                    )}
                  </div>
                  <div className={`${isLast ? "pb-0" : "pb-8"} pt-1.5`}>
                    <p
                      className={`font-medium leading-tight ${
                        isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {config.label}
                    </p>
                    <p
                      className={`text-sm mt-0.5 ${
                        isCurrent
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {config.description}
                    </p>
                    {isCurrent && order.status !== "DELIVERED" && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 animate-pulse mt-1">
                        In Progress...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {item.quantity}
                  </Badge>
                  <span>{item.menuItem.name}</span>
                </div>
                <span className="font-medium">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Delivery</span>
              <span className="text-emerald-600">Free</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{order.customerPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="font-medium">{order.customerAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.status !== "DELIVERED" && (
        <Button
          variant="outline"
          onClick={() => simulateProgress.mutate(orderId)}
          disabled={simulateProgress.isPending}
          className="w-full"
        >
          {simulateProgress.isPending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Simulate Next Status (Demo)
        </Button>
      )}
    </div>
  );
}
