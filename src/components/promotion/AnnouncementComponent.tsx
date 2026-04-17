import { useState } from "react";
import { Bell, Trash2, Edit2, Plus, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "@/services/api/announcement";
import { useCustomers } from "@/hooks/useCustomers";
import { useDebounce } from "@/hooks/useDebounce";
import { IAnnouncement } from "@/types/admin";

export default function AnnouncementComponent() {
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isBroadcast, setIsBroadcast] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    backgroundColor: "#f5f5f5",
    ctaText: "",
    ctaLink: "",
  });

  // Customer picker state
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerPage, setCustomerPage] = useState(1);
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);

  const { data, isLoading, error } = useAnnouncements({ page, limit: 10 });
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const { data: customersData, isLoading: customersLoading } = useCustomers({
    search: debouncedCustomerSearch || undefined,
    page: customerPage,
    limit: 8,
  });

  const availableCustomers = customersData?.data || [];
  const customerPagination = customersData?.pagination;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      isBroadcast,
      targetUserIds: !isBroadcast ? selectedUsers : undefined,
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: payload });
    } else {
      await createMutation.mutateAsync(payload as any);
    }

    resetForm();
    setIsOpen(false);
  };

  const handleEdit = (announcement: IAnnouncement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      backgroundColor: announcement.backgroundColor || "#f5f5f5",
      ctaText: announcement.ctaText || "",
      ctaLink: announcement.ctaLink || "",
    });
    setIsBroadcast(announcement.isBroadcast);
    setEditingId(announcement.id || "");
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      backgroundColor: "#f5f5f5",
      ctaText: "",
      ctaLink: "",
    });
    setSelectedUsers([]);
    setIsBroadcast(true);
    setEditingId(null);
    setCustomerSearch("");
    setCustomerPage(1);
  };

  const toggleUser = (id: string, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, id] : prev.filter((uid) => uid !== id),
    );
  };

  if (isLoading)
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  if (error)
    return <div className="text-red-500">Error loading announcements</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Announcements</h3>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <Plus className="h-4 w-4" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Announcement" : "Create Announcement"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Announcement title"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Announcement message"
                  required
                  rows={4}
                />
              </div>

              {/* Background Color */}
              <div>
                <Label htmlFor="bgColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        backgroundColor: e.target.value,
                      })
                    }
                    className="w-14 p-1 h-9"
                  />
                  <Input
                    value={formData.backgroundColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        backgroundColor: e.target.value,
                      })
                    }
                    placeholder="#f5f5f5"
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ctaText">CTA Text</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) =>
                      setFormData({ ...formData, ctaText: e.target.value })
                    }
                    placeholder="e.g., Learn More"
                  />
                </div>
                <div>
                  <Label htmlFor="ctaLink">CTA Link</Label>
                  <Input
                    id="ctaLink"
                    value={formData.ctaLink}
                    onChange={(e) =>
                      setFormData({ ...formData, ctaLink: e.target.value })
                    }
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>
              </div>

              {/* Broadcast Toggle */}
              <div className="space-y-3">
                <Label>Announcement Type</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isBroadcast}
                      onCheckedChange={(checked) =>
                        setIsBroadcast(checked as boolean)
                      }
                    />
                    <span className="text-sm">Broadcast to all users</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={!isBroadcast}
                      onCheckedChange={(checked) => setIsBroadcast(!checked)}
                    />
                    <span className="text-sm">Send to specific users</span>
                  </label>
                </div>
              </div>

              {/* Customer Selection */}
              {!isBroadcast && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      Select Customers *
                      {selectedUsers.length > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          ({selectedUsers.length} selected)
                        </span>
                      )}
                    </Label>
                    {selectedUsers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedUsers([])}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email…"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setCustomerPage(1);
                      }}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>

                  {/* Customer list */}
                  <div className="border rounded-md overflow-hidden">
                    {customersLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : availableCustomers.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No customers found.
                      </div>
                    ) : (
                      <div className="divide-y max-h-48 overflow-y-auto">
                        {availableCustomers.map((customer) => (
                          <label
                            key={customer._id}
                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                          >
                            <Checkbox
                              checked={selectedUsers.includes(customer._id)}
                              onCheckedChange={(checked) =>
                                toggleUser(customer._id, checked as boolean)
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {customer.firstName} {customer.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {customer.email}
                              </p>
                            </div>
                            <Badge
                              variant={
                                customer.isBlocked
                                  ? "destructive"
                                  : customer.isActive
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-[10px] shrink-0"
                            >
                              {customer.isBlocked
                                ? "Blocked"
                                : customer.isActive
                                  ? "Active"
                                  : "Inactive"}
                            </Badge>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Customer pagination */}
                    {customerPagination && customerPagination.pages > 1 && (
                      <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/20">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            setCustomerPage((p) => Math.max(1, p - 1))
                          }
                          disabled={customerPage === 1 || customersLoading}
                        >
                          Previous
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          Page {customerPage} of {customerPagination.pages}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            setCustomerPage((p) =>
                              Math.min(customerPagination.pages, p + 1),
                            )
                          }
                          disabled={
                            customerPage === customerPagination.pages ||
                            customersLoading
                          }
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    (!isBroadcast && selectedUsers.length === 0)
                  }
                >
                  {editingId ? "Update" : "Create"} Announcement
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((ann: IAnnouncement) => (
                <TableRow key={ann.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ann.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {ann.message}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ann.isBroadcast ? "default" : "secondary"}>
                      {ann.isBroadcast ? "Broadcast" : "Targeted"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ann.createdAt &&
                      format(new Date(ann.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(ann)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ann.id || "")}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  No announcements yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Announcements Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(data.pagination.pages, page + 1))}
            disabled={page === data.pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
