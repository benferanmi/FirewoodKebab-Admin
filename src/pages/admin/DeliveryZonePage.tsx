import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useFiltersStore } from "@/store/filtersStore";
import { useAuthStore } from "@/store/authStore";
import CreateZoneModal from "@/components/delivery/CreateZoneModal";
import DeleteZoneModal from "@/components/delivery/DeleteZoneModal";
import EditZoneModal from "@/components/delivery/EditZoneModal";
import { useAdminDeliveryZones, useToggleDeliveryZoneActive, useDeleteDeliveryZone } from "@/hooks/useDeliveryZone";



export default function AdminDeliveryZonesPage() {
  const { hasPermission } = useAuthStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const { deliveryZoneFilters, setDeliveryZoneFilters, resetDeliveryZoneFilters } =
    useFiltersStore();

  const { data: zonesData, isLoading, isError, refetch } =
    useAdminDeliveryZones();
  const toggleActive = useToggleDeliveryZoneActive();
  const deleteZone = useDeleteDeliveryZone();

  const canManage = hasPermission("MANAGE_DELIVERY_ZONES");

  const handleToggleActive = (id: string) => {
    toggleActive.mutate(id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleDeleteClick = (id: string) => {
    setSelectedZoneId(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedZoneId) return;
    deleteZone.mutate(selectedZoneId, {
      onSuccess: () => {
        setDeleteOpen(false);
        setSelectedZoneId(null);
        refetch();
      },
    });
  };

  const handleEditClick = (id: string) => {
    setSelectedZoneId(id);
    setEditOpen(true);
  };

  if (!canManage) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">
          You don't have permission to manage delivery zones
        </p>
      </div>
    );
  }

  const zones = zonesData?.data || [];
  const pagination = zonesData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delivery Zones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage delivery zones and coverage areas
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedZoneId(null);
            setCreateOpen(true);
          }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Zone
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filters</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {/* Search */}
          <div className="space-y-2">
            <Label className="text-xs">Search Zone</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zone name..."
                value={deliveryZoneFilters.search}
                onChange={(e) =>
                  setDeliveryZoneFilters({
                    search: e.target.value,
                    page: 1,
                  })
                }
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label className="text-xs">Type</Label>
            <Select
              value={deliveryZoneFilters.type}
              onValueChange={(value) =>
                setDeliveryZoneFilters({
                  type: value as any,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="zipcode">Zipcode</SelectItem>
                <SelectItem value="radius">Radius</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-xs">Status</Label>
            <Select
              value={deliveryZoneFilters.status}
              onValueChange={(value) =>
                setDeliveryZoneFilters({
                  status: value as any,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label className="text-xs">Sort By</Label>
            <Select
              value={deliveryZoneFilters.sortBy}
              onValueChange={(value) =>
                setDeliveryZoneFilters({
                  sortBy: value as any,
                })
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="fee">Delivery Fee</SelectItem>
                <SelectItem value="minOrder">Min Order</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset Filters Button */}
        {(deliveryZoneFilters.search ||
          deliveryZoneFilters.type !== "all" ||
          deliveryZoneFilters.status !== "all") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => resetDeliveryZoneFilters()}
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-red-500">
            Failed to load delivery zones
          </div>
        ) : zones.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-3">
              {deliveryZoneFilters.search
                ? "No zones match your search"
                : "No delivery zones created yet"}
            </p>
            <Button
              onClick={() => {
                setSelectedZoneId(null);
                setCreateOpen(true);
              }}
              size="sm"
            >
              Create First Zone
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold">Name</TableHead>
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Fee
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Min Order
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      ETA (min)
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-center">
                      Active
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.map((zone) => (
                    <TableRow key={zone._id} className="border-b border-border/50">
                      <TableCell className="py-3">
                        <div>
                          <p className="text-sm font-medium">{zone.name}</p>
                          {zone.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {zone.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted">
                          {zone.type === "zipcode" ? "ZIP" : "Radius"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium">
                          ${zone.deliveryFee.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm">
                          ${zone.minimumOrder.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm">
                          {zone.estimatedDeliveryTimeMin}-{zone.estimatedDeliveryTimeMax}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={zone.active}
                          onCheckedChange={() =>
                            handleToggleActive(zone._id!)
                          }
                          disabled={toggleActive.isPending}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(zone._id!)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(zone._id!)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination?.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                  of {pagination.total} zones
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDeliveryZoneFilters({
                        page: pagination.page - 1,
                      })
                    }
                    disabled={!pagination.hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={
                          pagination.page === i + 1 ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setDeliveryZoneFilters({ page: i + 1 })
                        }
                        className="h-8 w-8 p-0"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDeliveryZoneFilters({
                        page: pagination.page + 1,
                      })
                    }
                    disabled={!pagination.hasNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateZoneModal
        open={createOpen && !selectedZoneId}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          setCreateOpen(false);
          refetch();
        }}
      />

      {selectedZoneId && (
        <>
          <EditZoneModal
            open={editOpen}
            zoneId={selectedZoneId}
            onOpenChange={setEditOpen}
            onSuccess={() => {
              setEditOpen(false);
              refetch();
            }}
          />

          <DeleteZoneModal
            open={deleteOpen}
            zoneId={selectedZoneId}
            onOpenChange={setDeleteOpen}
            onConfirm={handleDeleteConfirm}
            isLoading={deleteZone.isPending}
          />
        </>
      )}
    </div>
  );
}