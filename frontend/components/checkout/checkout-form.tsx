"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useCreateOrder } from "@/lib/queries";
import type { UseCartReturn } from "@/hooks/use-cart";
import { toast } from "sonner";

const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  customerPhone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be less than 15 digits"),
  customerAddress: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must be less than 500 characters"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  cart: UseCartReturn;
  onBack: () => void;
  onSuccess: () => void;
}

export function CheckoutForm({ cart, onBack, onSuccess }: CheckoutFormProps) {
  const router = useRouter();
  const createOrder = useCreateOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
    },
  });

  const onSubmit = async (values: CheckoutFormValues) => {
    setIsSubmitting(true);

    try {
      const order = await createOrder.mutateAsync({
        ...values,
        items: cart.items.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
        })),
      });

      setOrderSuccess(true);
      cart.clearCart();

      toast.success("Order placed successfully!", {
        description: "You'll be redirected to track your order.",
      });

      setTimeout(() => {
        onSuccess();
        router.push(`/order/${order.id}`);
      }, 2000);
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
      console.error("Order error:", error);
    } finally {
      if (!orderSuccess) {
        setIsSubmitting(false);
      }
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center animate-in zoom-in-50 duration-500">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-in zoom-in-50 duration-700" />
          </div>
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-emerald-500/20 animate-ping" />
        </div>
        <h3 className="text-xl font-bold mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
          Order Placed!
        </h3>
        <p className="text-muted-foreground mt-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500">
          Redirecting to order tracking...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="self-start mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cart
      </Button>

      <div className="flex-1 overflow-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Main Street, Apt 4B, City, State 12345"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4 mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({cart.totalItems} items)
                </span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ${cart.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                `Place Order • $${cart.totalAmount.toFixed(2)}`
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
