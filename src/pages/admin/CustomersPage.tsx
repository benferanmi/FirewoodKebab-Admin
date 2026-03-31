import { useState } from "react";
import {
  Search,
  Shield,
  ShieldOff,
  MoreHorizontal,
  ClipboardList,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useCustomers,
  useBlockCustomer,
  useUnblockCustomer,
  useCustomerOrders,
} from "@/hooks/useCustomers";
import { useDebounce } from "@/hooks/useDebounce";
import { useFiltersStore } from "@/store/filtersStore";
import { useAuthStore } from "@/store/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Customer } from "@/types/admin";

// ─── Customer Orders Modal ────────────────────────────────────────────────────
function CustomerOrdersDialog({
  customer,
  open,
  onClose,
}: {
  customer: Customer;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = useCustomerOrders(customer._id, {
    page: 1,
    limit: 10,
  });
  const orders = data?.data || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Orders — {customer.firstName} {customer.lastName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No orders found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Order ID", "Date", "Items", "Total", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr
                    key={o._id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      #{o._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2.5">{o.items?.length ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold">
                      ${(o.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant={
                          o.status === "delivered"
                            ? "secondary"
                            : o.status === "cancelled"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-[10px] capitalize"
                      >
                        {o.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Row Actions Menu ─────────────────────────────────────────────────────────
function CustomerRowMenu({
  customer,
  onViewOrders,
  onBlock,
  onDelete,
}: {
  customer: Customer;
  onViewOrders: () => void;
  onBlock: () => void;
  onDelete: () => void;
}) {
  const { hasPermission } = useAuthStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onViewOrders();
          }}
        >
          <ClipboardList className="h-3.5 w-3.5 mr-2" />
          View Orders
        </DropdownMenuItem>

        {hasPermission("BLOCK_CUSTOMER") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onBlock();
              }}
            >
              {customer.isBlocked ? (
                <>
                  <ShieldOff className="h-3.5 w-3.5 mr-2" />
                  Unblock Customer
                </>
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5 mr-2" />
                  Block Customer
                </>
              )}
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Delete Customer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const { customerFilters, setCustomerFilters } = useFiltersStore();
  const debouncedSearch = useDebounce(customerFilters.search, 300);
  const { hasPermission } = useAuthStore();

  const { data: customersData, isLoading } = useCustomers({
    search: debouncedSearch || undefined,
    page: customerFilters.page,
    limit: customerFilters.limit,
  });

  const blockMutation = useBlockCustomer();
  const unblockMutation = useUnblockCustomer();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [blockDialog, setBlockDialog] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [ordersDialog, setOrdersDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const customers = customersData?.data || [];

  // ── handlers ──────────────────────────────────────────────────────────────
  const openBlockDialog = (c: Customer) => {
    setSelectedCustomer(c);
    setBlockDialog(true);
  };

  const openOrdersDialog = (c: Customer) => {
    setSelectedCustomer(c);
    setOrdersDialog(true);
  };

  const openDeleteDialog = (c: Customer) => {
    setSelectedCustomer(c);
    setDeleteDialog(true);
  };

  const handleBlock = () => {
    if (!selectedCustomer) return;
    blockMutation.mutate(
      { id: selectedCustomer._id, reason: blockReason },
      {
        onSuccess: () => {
          setBlockDialog(false);
          setBlockReason("");
          setSelectedCustomer(null);
        },
      }
    );
  };

  const handleUnblock = (c: Customer) => {
    unblockMutation.mutate(c._id, {
      onSuccess: () => setSelectedCustomer(null),
    });
  };

  const handleDeleteConfirm = () => {
    // 🔌 wire up deleteMutation.mutate(selectedCustomer._id) here
    setDeleteDialog(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-4">
      {/* ── Search ── */}
      <div className="glass-card rounded-xl p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers…"
            value={customerFilters.search}
            onChange={(e) =>
              setCustomerFilters({ search: e.target.value, page: 1 })
            }
            className="pl-9 h-9 bg-muted/50 border-transparent text-sm"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[
                "Customer",
                "Phone",
                "Status",
                "Verified",
                "Joined",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c._id}
                onClick={() => setSelectedCustomer(c)}
                className="group border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
              >
                {/* Name + Email */}
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </td>

                {/* Phone */}
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {c.phone}
                </td>

                {/* Active / Blocked / Inactive */}
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      c.isBlocked
                        ? "destructive"
                        : c.isActive
                        ? "secondary"
                        : "outline"
                    }
                    className="text-[10px]"
                  >
                    {c.isBlocked ? "Blocked" : c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>

                {/* Email + Phone verified */}
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <Badge
                      variant={c.isEmailVerified ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      Email
                    </Badge>
                    <Badge
                      variant={c.isPhoneVerified ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      Phone
                    </Badge>
                  </div>
                </td>

                {/* Joined */}
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString("en-NG", {
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                {/* Actions */}
                <td
                  className="px-4 py-3 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CustomerRowMenu
                    customer={c}
                    onViewOrders={() => openOrdersDialog(c)}
                    onBlock={() =>
                      c.isBlocked ? handleUnblock(c) : openBlockDialog(c)
                    }
                    onDelete={() => openDeleteDialog(c)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        )}
        {!isLoading && customers.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No customers found.
          </div>
        )}
      </div>

      {/* ── Customer Detail Dialog ── */}
      <Dialog
        open={
          !!selectedCustomer && !blockDialog && !ordersDialog && !deleteDialog
        }
        onOpenChange={() => setSelectedCustomer(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4">
              {/* Basic info */}
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>{selectedCustomer.email}</p>
                <p>{selectedCustomer.phone}</p>
                <p className="capitalize">Role: {selectedCustomer.role}</p>
              </div>

              {/* Verification */}
              <div className="flex gap-2">
                <Badge
                  variant={
                    selectedCustomer.isEmailVerified ? "secondary" : "outline"
                  }
                >
                  {selectedCustomer.isEmailVerified
                    ? "Email Verified"
                    : "Email Unverified"}
                </Badge>
                <Badge
                  variant={
                    selectedCustomer.isPhoneVerified ? "secondary" : "outline"
                  }
                >
                  {selectedCustomer.isPhoneVerified
                    ? "Phone Verified"
                    : "Phone Unverified"}
                </Badge>
              </div>

              {/* Addresses */}
              {selectedCustomer.addresses?.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase font-semibold text-muted-foreground mb-2">
                    Addresses
                  </p>
                  <div className="space-y-2">
                    {selectedCustomer.addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground"
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-medium text-foreground capitalize">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <Badge
                              className="text-[9px] h-4"
                              variant="secondary"
                            >
                              Default
                            </Badge>
                          )}
                        </div>
                        <p>
                          {addr.street}, {addr.city}, {addr.state}{" "}
                          {addr.zipCode}, {addr.country}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setOrdersDialog(true)}
                >
                  <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
                  View Orders
                </Button>

                {hasPermission("BLOCK_CUSTOMER") && (
                  <Button
                    variant={
                      selectedCustomer.isBlocked ? "default" : "destructive"
                    }
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      selectedCustomer.isBlocked
                        ? handleUnblock(selectedCustomer)
                        : openBlockDialog(selectedCustomer)
                    }
                    disabled={
                      blockMutation.isPending || unblockMutation.isPending
                    }
                  >
                    {selectedCustomer.isBlocked ? (
                      <>
                        <ShieldOff className="h-3.5 w-3.5 mr-1.5" />
                        Unblock
                      </>
                    ) : (
                      <>
                        <Shield className="h-3.5 w-3.5 mr-1.5" />
                        Block
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Orders Dialog ── */}
      {selectedCustomer && (
        <CustomerOrdersDialog
          customer={selectedCustomer}
          open={ordersDialog}
          onClose={() => setOrdersDialog(false)}
        />
      )}

      {/* ── Block Reason Dialog ── */}
      <Dialog open={blockDialog} onOpenChange={setBlockDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Block Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Reason</Label>
            <Textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="text-sm min-h-[80px]"
              placeholder="Why are you blocking this customer?"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBlockDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBlock}
              disabled={blockMutation.isPending || !blockReason}
            >
              {blockMutation.isPending ? "Blocking…" : "Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete{" "}
            <span className="font-medium text-foreground">
              {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}