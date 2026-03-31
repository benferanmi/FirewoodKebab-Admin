import { cn } from "@/lib/utils";
import { OrderStatus, PaymentStatus } from "@/types/admin";

const orderStatusStyles: Record<OrderStatus, string> = {
  pending: "bg-warning/15 text-warning border-warning/25",
  confirmed: "bg-info/15 text-info border-info/25",
  preparing: "bg-chart-4/15 text-chart-4 border-chart-4/25",
  out_for_delivery: "bg-primary/15 text-primary border-primary/25",
  delivered: "bg-success/15 text-success border-success/25",
  cancelled: "bg-destructive/15 text-destructive border-destructive/25",
};

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  pending: "bg-warning/15 text-warning border-warning/25",
  initiated: "bg-info/15 text-info border-info/25",
  successful: "bg-success/15 text-success border-success/25",
  failed: "bg-destructive/15 text-destructive border-destructive/25",
  refunded: "bg-muted text-muted-foreground border-border",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", orderStatusStyles[status])}>
      {orderStatusLabels[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", paymentStatusStyles[status])}>
      {status}
    </span>
  );
}
