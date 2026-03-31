import { useState } from "react";
import { Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/common/StatusBadge";
import { useOrders, useUpdateOrderStatus, useCancelOrder, useExportOrders } from "@/hooks/useOrders";
import { useFiltersStore } from "@/store/filtersStore";
import { useDebounce } from "@/hooks/useDebounce";
import { Order, OrderStatus } from "@/types/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";

export default function OrdersPage() {
  const { orderFilters, setOrderFilters } = useFiltersStore();
  const debouncedSearch = useDebounce(orderFilters.search, 300);
  const { hasPermission } = useAuthStore();

  const { data: ordersData, isLoading } = useOrders({
    status: orderFilters.status === "all" ? undefined : orderFilters.status as OrderStatus,
    search: debouncedSearch || undefined,
    page: orderFilters.page,
    limit: orderFilters.limit,
  });

  const updateStatusMutation = useUpdateOrderStatus();
  const cancelMutation = useCancelOrder();
  const exportMutation = useExportOrders();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("confirmed");
  const [statusNote, setStatusNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const orders = ordersData?.data || [];

  const handleUpdateStatus = () => {
    if (!selectedOrder) return;
    updateStatusMutation.mutate(
      { id: selectedOrder._id, data: { status: newStatus, note: statusNote || undefined } },
      {
        onSuccess: () => {
          setStatusUpdateDialog(false);
          setStatusNote("");
          setSelectedOrder(null);
        },
      }
    );
  };

  const handleCancelOrder = () => {
    if (!selectedOrder) return;
    cancelMutation.mutate(
      { id: selectedOrder._id, data: { reason: cancelReason } },
      {
        onSuccess: () => {
          setCancelDialog(false);
          setCancelReason("");
          setSelectedOrder(null);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={orderFilters.search}
            onChange={(e) => setOrderFilters({ search: e.target.value, page: 1 })}
            className="pl-9 h-9 bg-muted/50 border-transparent text-sm"
          />
        </div>
        <Select value={orderFilters.status || "all"} onValueChange={(v) => setOrderFilters({ status: v as any, page: 1 })}>
          <SelectTrigger className="w-[160px] h-9 text-sm bg-muted/50 border-transparent">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {hasPermission("EXPORT_DATA") && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={() => exportMutation.mutate({ format: "csv" })}
            disabled={exportMutation.isPending}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> {exportMutation.isPending ? "Exporting..." : "Export"}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Order #</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono font-medium text-foreground">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{order.userId.firstName} {order.userId.lastName}</p>
                    <p className="text-xs text-muted-foreground">{order.userId.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{order.items.length} items</td>
                  <td className="px-4 py-3 text-sm font-semibold font-mono text-foreground">${order.total.toLocaleString()}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3"><PaymentStatusBadge status={order.paymentStatus} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && orders.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No orders found</div>
        )}
        {isLoading && (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading orders...</div>
        )}
      </div>

      {/* Pagination */}
      {ordersData?.pagination && ordersData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Page {ordersData.pagination.page} of {ordersData.pagination.totalPages} ({ordersData.pagination.total} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={!ordersData.pagination.hasPrev}
              onClick={() => setOrderFilters({ page: orderFilters.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={!ordersData.pagination.hasNext}
              onClick={() => setOrderFilters({ page: orderFilters.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder && !statusUpdateDialog && !cancelDialog} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono">{selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <OrderStatusBadge status={selectedOrder.status} />
                <PaymentStatusBadge status={selectedOrder.paymentStatus} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{selectedOrder.userId.firstName} {selectedOrder.userId.lastName}</p>
                <p className="text-xs text-muted-foreground">{selectedOrder.userId.email} · {selectedOrder.userId.phone}</p>
                <p className="text-xs text-muted-foreground capitalize">Type: {selectedOrder.deliveryType}</p>
              </div>
              <div className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Items</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.quantity}× {item.menuItemName}</span>
                    <span className="font-mono">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span><span>${selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Delivery</span><span>${selectedOrder.deliveryFee.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-xs text-success">
                      <span>Discount</span><span>-${selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                    <span>Total</span><span className="font-mono">${selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {hasPermission("UPDATE_ORDER_STATUS") && selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                  <Button size="sm" className="flex-1" onClick={() => setStatusUpdateDialog(true)}>
                    Update Status
                  </Button>
                )}
                {hasPermission("CANCEL_ORDER") && selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                  <Button size="sm" variant="destructive" onClick={() => setCancelDialog(true)}>Cancel</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialog} onOpenChange={setStatusUpdateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">New Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Note (optional)</Label>
              <Textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} className="text-sm min-h-[60px]" placeholder="Add a note..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setStatusUpdateDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Reason for cancellation</Label>
            <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="text-sm min-h-[80px]" placeholder="Enter reason..." />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCancelDialog(false)}>Back</Button>
            <Button size="sm" variant="destructive" onClick={handleCancelOrder} disabled={cancelMutation.isPending || !cancelReason}>
              {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
