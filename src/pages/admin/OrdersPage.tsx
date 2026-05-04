import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  MapPin,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/common/StatusBadge";
import {
  useOrders,
  useUpdateOrderStatus,
  useCancelOrder,
  useExportOrders,
  useRefundOrder,
} from "@/hooks/useOrders";
import { useFiltersStore } from "@/store/filtersStore";
import { useDebounce } from "@/hooks/useDebounce";
import { Order, OrderStatus } from "@/types/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortField = "createdAt" | "total" | "status";
type SortOrder = "asc" | "desc";

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <tr className="border-b border-border/50">
      {[130, 150, 60, 80, 90, 90, 100].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded bg-muted animate-pulse"
            style={{ width: w }}
          />
          {i === 1 && (
            <div
              className="h-3 rounded bg-muted animate-pulse mt-1.5"
              style={{ width: 90 }}
            />
          )}
        </td>
      ))}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Sortable column header
// ---------------------------------------------------------------------------

interface SortableHeaderProps {
  label: string;
  field: SortField;
  currentField: string;
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
}

function SortableHeader({
  label,
  field,
  currentField,
  currentOrder,
  onSort,
}: SortableHeaderProps) {
  const active = currentField === field;
  return (
    <th
      className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none group"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          currentOrder === "asc" ? (
            <ArrowUp className="h-3 w-3 text-foreground" />
          ) : (
            <ArrowDown className="h-3 w-3 text-foreground" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
        )}
      </span>
    </th>
  );
}

// ---------------------------------------------------------------------------
// Status history timeline (inside detail dialog)
// ---------------------------------------------------------------------------

function StatusTimeline({ history }: { history: Order["statusHistory"] }) {
  if (!history?.length) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Status history
      </p>
      <div className="relative pl-4">
        {/* vertical rule */}
        <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border" />
        {history.map((entry, i) => (
          <div key={i} className="relative mb-3 last:mb-0">
            <div className="absolute -left-4 top-[5px] h-2.5 w-2.5 rounded-full border-2 border-background bg-muted-foreground/50" />
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium capitalize text-foreground">
                {entry.status.replace(/_/g, " ")}
              </span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {new Date(entry.updatedAt).toLocaleString("en-NG", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {entry.note && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {entry.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Active filter pills
// ---------------------------------------------------------------------------

interface ActiveFiltersProps {
  filters: {
    status: string;
    paymentStatus: string;
    startDate: string;
    endDate: string;
  };
  onClear: (key: string) => void;
  onClearAll: () => void;
}

function ActiveFilters({ filters, onClear, onClearAll }: ActiveFiltersProps) {
  const active = [
    filters.status !== "all" && {
      key: "status",
      label: `Status: ${filters.status.replace(/_/g, " ")}`,
    },
    filters.paymentStatus !== "all" && {
      key: "paymentStatus",
      label: `Payment: ${filters.paymentStatus}`,
    },
    filters.startDate && {
      key: "startDate",
      label: `From: ${filters.startDate}`,
    },
    filters.endDate && { key: "endDate", label: `To: ${filters.endDate}` },
  ].filter(Boolean) as { key: string; label: string }[];

  if (!active.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {active.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-foreground"
        >
          {label}
          <button
            onClick={() => onClear(key)}
            className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function OrdersPage() {
  const { orderFilters, setOrderFilters, resetOrderFilters } =
    useFiltersStore();
  const debouncedSearch = useDebounce(orderFilters.search, 300);
  const { hasPermission } = useAuthStore();

  // Local sort state (handled client-side via query params passed to API)
  const sortBy: SortField = (orderFilters.sortBy as SortField) ?? "createdAt";
  const sortOrder: SortOrder = (orderFilters.sortOrder as SortOrder) ?? "desc";

  const { data: ordersData, isLoading } = useOrders({
    status:
      orderFilters.status === "all"
        ? undefined
        : (orderFilters.status as OrderStatus),
    paymentStatus:
      orderFilters.paymentStatus === "all"
        ? undefined
        : (orderFilters.paymentStatus as any),
    search: debouncedSearch || undefined,
    startDate: orderFilters.startDate || undefined,
    endDate: orderFilters.endDate || undefined,
    page: orderFilters.page,
    limit: orderFilters.limit,
    // Pass sort to API if your backend supports it; otherwise sort client-side below
    // sortBy,
    // sortOrder,
  });

  const updateStatusMutation = useUpdateOrderStatus();
  const cancelMutation = useCancelOrder();
  const exportMutation = useExportOrders();
  const refundMutation = useRefundOrder();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [refundDialog, setRefundDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("confirmed");
  const [statusNote, setStatusNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // Client-side sort (remove if your API handles sorting)
  const orders = [...(ordersData?.data ?? [])].sort((a, b) => {
    let valA: any, valB: any;
    if (sortBy === "createdAt") {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
    } else if (sortBy === "total") {
      valA = a.total;
      valB = b.total;
    } else if (sortBy === "status") {
      valA = a.status;
      valB = b.status;
    } else {
      valA = 0;
      valB = 0;
    }
    return sortOrder === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
  });

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setOrderFilters({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
    } else {
      setOrderFilters({ sortBy: field, sortOrder: "desc" });
    }
  }

  function handleClearFilter(key: string) {
    const defaults: Record<string, string> = {
      status: "all",
      paymentStatus: "all",
      startDate: "",
      endDate: "",
    };
    setOrderFilters({ [key]: defaults[key], page: 1 } as any);
  }

  function handleClearAllFilters() {
    setOrderFilters({
      status: "all",
      paymentStatus: "all",
      startDate: "",
      endDate: "",
      search: "",
      page: 1,
    });
  }

  // Dialog helpers
  function openStatusDialog(order: Order, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedOrder(order);
    setNewStatus("confirmed");
    setStatusNote("");
    setStatusUpdateDialog(true);
  }

  function openCancelDialog(order: Order, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedOrder(order);
    setCancelReason("");
    setCancelDialog(true);
  }

  function openRefundDialog(order: Order, e?: React.MouseEvent) {
    e?.stopPropagation();
    setSelectedOrder(order);
    setRefundAmount(String(order.total));
    setRefundReason("");
    setRefundDialog(true);
  }

  function handleUpdateStatus() {
    if (!selectedOrder) return;
    updateStatusMutation.mutate(
      {
        id: selectedOrder._id,
        data: { status: newStatus, note: statusNote || undefined },
      },
      {
        onSuccess: () => {
          setStatusUpdateDialog(false);
          setStatusNote("");
          setSelectedOrder(null);
        },
      },
    );
  }

  function handleCancelOrder() {
    if (!selectedOrder) return;
    cancelMutation.mutate(
      { id: selectedOrder._id, data: { reason: cancelReason } },
      {
        onSuccess: () => {
          setCancelDialog(false);
          setCancelReason("");
          setSelectedOrder(null);
        },
      },
    );
  }

  function handleRefundOrder() {
    if (!selectedOrder) return;
    refundMutation.mutate(
      {
        id: selectedOrder._id,
        data: { amount: Number(refundAmount), reason: refundReason },
      },
      {
        onSuccess: () => {
          setRefundDialog(false);
          setRefundAmount("");
          setRefundReason("");
          setSelectedOrder(null);
        },
      },
    );
  }

  const pagination = ordersData?.pagination;
  const canUpdateStatus = hasPermission("UPDATE_ORDER_STATUS");
  const canCancel = hasPermission("CANCEL_ORDER");
  const canRefund = hasPermission("REFUND_ORDER");

  const isDetailOpen =
    !!selectedOrder && !statusUpdateDialog && !cancelDialog && !refundDialog;

  return (
    <div className="space-y-4">
      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        {/* Row 1: search + status + payment + export */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order # or customer..."
              value={orderFilters.search}
              onChange={(e) =>
                setOrderFilters({ search: e.target.value, page: 1 })
              }
              className="pl-9 h-9 bg-muted/50 border-transparent text-sm"
            />
          </div>

          {/* Order status */}
          <Select
            value={orderFilters.status || "all"}
            onValueChange={(v) =>
              setOrderFilters({ status: v as any, page: 1 })
            }
          >
            <SelectTrigger className="w-[155px] h-9 text-sm bg-muted/50 border-transparent">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Order status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="out_for_delivery">Out for delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment status — NEW */}
          <Select
            value={orderFilters.paymentStatus || "all"}
            onValueChange={(v) =>
              setOrderFilters({ paymentStatus: v as any, page: 1 })
            }
          >
            <SelectTrigger className="w-[150px] h-9 text-sm bg-muted/50 border-transparent">
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="initiated">Initiated</SelectItem>
              <SelectItem value="successful">Successful</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          {/* Export */}
          {hasPermission("EXPORT_DATA") && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs ml-auto"
              onClick={() => exportMutation.mutate({ format: "csv" })}
              disabled={exportMutation.isPending}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {exportMutation.isPending ? "Exporting..." : "Export CSV"}
            </Button>
          )}
        </div>

        {/* Row 2: date range — NEW */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">
              From
            </Label>
            <Input
              type="date"
              value={orderFilters.startDate || ""}
              onChange={(e) =>
                setOrderFilters({ startDate: e.target.value, page: 1 })
              }
              className="h-8 text-xs bg-muted/50 border-transparent w-[140px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">
              To
            </Label>
            <Input
              type="date"
              value={orderFilters.endDate || ""}
              onChange={(e) =>
                setOrderFilters({ endDate: e.target.value, page: 1 })
              }
              className="h-8 text-xs bg-muted/50 border-transparent w-[140px]"
            />
          </div>
          {/* Summary when we have data */}
          {!isLoading && pagination && (
            <span className="text-xs text-muted-foreground ml-auto">
              {pagination.total.toLocaleString()} order
              {pagination.total !== 1 ? "s" : ""} found
            </span>
          )}
        </div>

        {/* Row 3: active filter pills — NEW */}
        <ActiveFilters
          filters={{
            status: orderFilters.status || "all",
            paymentStatus: orderFilters.paymentStatus || "all",
            startDate: orderFilters.startDate || "",
            endDate: orderFilters.endDate || "",
          }}
          onClear={handleClearFilter}
          onClearAll={handleClearAllFilters}
        />
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Items
                </th>
                <SortableHeader
                  label="Total"
                  field="total"
                  currentField={sortBy}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Status"
                  field="status"
                  currentField={sortBy}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Payment
                </th>
                <SortableHeader
                  label="Date"
                  field="createdAt"
                  currentField={sortBy}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
                {/* Actions column — only shown if user has any action permission */}
                {(canUpdateStatus || canCancel) && (
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                : orders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-mono font-medium text-foreground">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">
                          {order.userId?.firstName || order.guestName || "-"} {order.userId?.lastName || ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.userId?.phone || order.guestPhone || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold font-mono text-foreground">
                        ₦{order.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Inline quick actions — NEW */}
                      {(canUpdateStatus || canCancel) && (
                        <td
                          className="px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1.5">
                            {canUpdateStatus &&
                              order.status !== "cancelled" &&
                              order.status !== "delivered" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-[11px]"
                                  onClick={(e) => openStatusDialog(order, e)}
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Update
                                </Button>
                              )}
                            {canCancel &&
                              order.status !== "cancelled" &&
                              order.status !== "delivered" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={(e) => openCancelDialog(order, e)}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && orders.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">No orders found</p>
            <button
              onClick={handleClearAllFilters}
              className="mt-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ── Pagination — FIXED ──────────────────────────────────────── */}
      {!isLoading && pagination && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ·{" "}
            {pagination.total.toLocaleString()} total order
            {pagination.total !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={!pagination.hasPrev}
              onClick={() => setOrderFilters({ page: orderFilters.page - 1 })}
            >
              ← Previous
            </Button>
            {/* Page number pills */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.page) <= 1,
              )
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1)
                  acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="text-xs text-muted-foreground px-1"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === pagination.page ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0 text-xs"
                    onClick={() => setOrderFilters({ page: p as number })}
                  >
                    {p}
                  </Button>
                ),
              )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={!pagination.hasNext}
              onClick={() => setOrderFilters({ page: orderFilters.page + 1 })}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* ── Order Detail Dialog ──────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-base">
              {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-5">
              {/* Status badges */}
              <div className="flex gap-2">
                <OrderStatusBadge status={selectedOrder.status} />
                <PaymentStatusBadge status={selectedOrder.paymentStatus} />
              </div>

              {/* Customer info */}
              <div className="rounded-lg border border-border p-3 space-y-0.5">
                <p className="text-sm font-medium">
                  {selectedOrder.userId?.firstName || selectedOrder?.guestName || "-"}{" "}
                  {selectedOrder.userId?.lastName || "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedOrder.userId?.email || selectedOrder.guestEmail || "-"} · {selectedOrder.userId?.phone || selectedOrder.guestPhone ||"-"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  Type: {selectedOrder.deliveryType}
                </p>
              </div>

              {/* Delivery address — NEW */}
              {selectedOrder.deliveryAddress && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Delivery address
                  </p>
                  <p className="text-sm text-foreground">
                    {selectedOrder.deliveryAddress.street}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[
                      selectedOrder.deliveryAddress.street,
                      selectedOrder.deliveryAddress.zipCode,
                      selectedOrder.zoneName,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {selectedOrder.estimatedDeliveryTime && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ETA:{" "}
                      {new Date(
                        selectedOrder.estimatedDeliveryTime,
                      ).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Special instructions — NEW */}
              {selectedOrder.specialInstructions && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Special instructions
                  </p>
                  <p className="text-sm text-foreground">
                    {selectedOrder.specialInstructions}
                  </p>
                </div>
              )}

              {/* Items + totals */}
              <div className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Items
                </p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm gap-2">
                    <span className="text-foreground">
                      {item.quantity}× {item.menuItemName}
                      {/* {item.variants?.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (
                          {item.variants
                            .map((v: any) => v.selectedOption)
                            .join(", ")}
                          )
                        </span>
                      )} */}
                    </span>
                    <span className="font-mono whitespace-nowrap">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₦{selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Delivery fee</span>
                    <span>₦{selectedOrder.deliveryFee.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
                      <span>
                        Discount
                        {selectedOrder.couponCode
                          ? ` (${selectedOrder.couponCode})`
                          : ""}
                      </span>
                      <span>-₦{selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.tipAmount > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Tip</span>
                      <span>₦{selectedOrder.tipAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                    <span>Total</span>
                    <span className="font-mono">
                      ₦{selectedOrder.total.toLocaleString()}
                    </span>
                  </div>
                  {selectedOrder.totalWithTip &&
                    selectedOrder.totalWithTip !== selectedOrder.total && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Charged (with tip)</span>
                        <span className="font-mono">
                          ₦{selectedOrder.totalWithTip.toLocaleString()}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Status history timeline — NEW */}
              {selectedOrder.statusHistory?.length > 0 && (
                <div className="rounded-lg border border-border p-3">
                  <StatusTimeline history={selectedOrder.statusHistory} />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {canUpdateStatus &&
                  selectedOrder.status !== "cancelled" &&
                  selectedOrder.status !== "delivered" && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setStatusUpdateDialog(true)}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Update status
                    </Button>
                  )}
                {canRefund &&
                  selectedOrder.paymentStatus === "successful" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRefundDialog(selectedOrder)}
                    >
                      Refund
                    </Button>
                  )}
                {canCancel &&
                  selectedOrder.status !== "cancelled" &&
                  selectedOrder.status !== "delivered" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setCancelDialog(true)}
                    >
                      Cancel order
                    </Button>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Status Update Dialog ─────────────────────────────────────── */}
      <Dialog open={statusUpdateDialog} onOpenChange={setStatusUpdateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update order status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">New status</Label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as OrderStatus)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="out_for_delivery">
                    Out for delivery
                  </SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">
                Note <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="text-sm min-h-[60px]"
                placeholder="Add a note visible in status history..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusUpdateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Dialog ────────────────────────────────────────────── */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel order</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Reason for cancellation</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="text-sm min-h-[80px]"
              placeholder="Enter reason..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelDialog(false)}
            >
              Back
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={cancelMutation.isPending || !cancelReason.trim()}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Confirm cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Refund Dialog — NEW ──────────────────────────────────────── */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Process refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Refund amount (₦)</Label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="h-9 text-sm font-mono"
                min={1}
                max={selectedOrder?.total}
                placeholder="0.00"
              />
              {selectedOrder && (
                <p className="text-[11px] text-muted-foreground">
                  Max: ₦{selectedOrder.total.toLocaleString()}
                  {" · "}
                  <button
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                    onClick={() => setRefundAmount(String(selectedOrder.total))}
                  >
                    Full refund
                  </button>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Reason</Label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="text-sm min-h-[70px]"
                placeholder="Reason for refund..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefundDialog(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRefundOrder}
              disabled={
                refundMutation.isPending ||
                !refundReason.trim() ||
                !refundAmount ||
                Number(refundAmount) <= 0
              }
            >
              {refundMutation.isPending ? "Processing..." : "Process refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
