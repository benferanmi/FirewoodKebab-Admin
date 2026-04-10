import { useState } from "react";
import {
  Plus,
  Loader,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Bell,
  Mail,
  Upload,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCoupons,
  useCreateCoupon,
  useDeleteCoupon,
  useUpdateCoupon,
} from "@/hooks/usePromotions";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema, CouponFormData } from "@/validations/promotions";
import { uploadAPI } from "@/services/api/uploadapi";
import { toast } from "sonner";

interface CouponWithId {
  _id?: string;
  id?: string;
  [key: string]: any;
}

const normalizeId = (item: any) => ({
  ...item,
  id: item.id || item._id,
});

type NotificationMethod = "email" | "inApp" | "banner" | "all" | "none";

// Get selected methods from notification method value
const getSelectedMethods = (value: NotificationMethod): Set<string> => {
  if (!value || value === "none") return new Set();
  if (value === "all") return new Set(["email", "inApp", "banner"]);
  return new Set([value]);
};

// Convert set of methods to notification method value
const setToNotificationMethod = (methods: Set<string>): NotificationMethod => {
  if (methods.size === 0) return "none";
  if (methods.size === 3) return "all";
  if (methods.size === 1) return Array.from(methods)[0] as NotificationMethod;
  // If 2 are selected, treat as "all" for now (or store the combo if backend supports)
  return "all";
};

const COUPON_DEFAULT: CouponFormData = {
  code: "",
  type: "percentage",
  value: 0,
  isActive: true,
  startDate: "",
  endDate: "",
  description: "",
  minOrderAmount: undefined,
  maxTotalUsage: undefined,
  notificationMethod: "none",
  targetAudience: "all_users",
  bannerImage: "",
  bannerText: "",
};

export default function CouponComponent() {
  const { hasPermission } = useAuthStore();
  const { data: couponsData, isLoading: couponsLoading } = useCoupons();
  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();
  const deleteCouponMutation = useDeleteCoupon();

  const [addCouponDialog, setAddCouponDialog] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [couponBannerPreview, setCouponBannerPreview] = useState("");
  const [couponBannerUploading, setCouponBannerUploading] = useState(false);
  const [couponPage, setCouponPage] = useState(1);
  const [couponStatus, setCouponStatus] = useState<string | undefined>();
  const [updatingCouponId, setUpdatingCouponId] = useState<string | null>(null);

  const coupons = (couponsData?.data || []).map(normalizeId);
  const pagination = couponsData?.pagination;

  // ─── Coupon Form ────────────────────────────────────────────────────────────

  const couponForm = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: COUPON_DEFAULT,
  });

  const watchedNotifMethod = couponForm.watch(
    "notificationMethod",
  ) as NotificationMethod;

  // Get currently selected methods
  const selectedMethods = getSelectedMethods(watchedNotifMethod);

  // Check if banner is selected
  const isBannerSelected = selectedMethods.has("banner");

  // Check if only banner is selected (no email/inApp)
  const isBannerOnly = selectedMethods.size === 1 && isBannerSelected;

  // Show target audience only when email or inApp is selected (not for banner-only)
  const shouldShowTargetAudience =
    watchedNotifMethod !== "none" && !isBannerOnly;

  // Handle notification method checkbox toggle
  const handleNotifCheckbox = (method: string, checked: boolean) => {
    const next = new Set(selectedMethods);
    if (checked) {
      next.add(method);
    } else {
      next.delete(method);
    }
    couponForm.setValue("notificationMethod", setToNotificationMethod(next), {
      shouldValidate: true,
    });
  };

  const onSubmitCoupon = (data: CouponFormData) => {
    // If banner-only, ensure targetAudience is all_users
    if (isBannerOnly) {
      data.targetAudience = "all_users";
    }

    if (editingCouponId) {
      updateCouponMutation.mutate(
        { id: editingCouponId, data },
        {
          onSuccess: () => {
            closeCouponDialog();
          },
        },
      );
    } else {
      createCouponMutation.mutate(data as any, {
        onSuccess: () => {
          closeCouponDialog();
        },
      });
    }
  };

  const openEditCoupon = (coupon: CouponWithId) => {
    setEditingCouponId(coupon.id || coupon._id);
    setCouponBannerPreview(coupon.bannerImage || "");
    couponForm.reset({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description || "",
      minOrderAmount: coupon.minOrderAmount,
      maxTotalUsage: coupon.maxTotalUsage,
      startDate: new Date(coupon.startDate).toISOString().split("T")[0],
      endDate: new Date(coupon.endDate).toISOString().split("T")[0],
      isActive: coupon.isActive,
      notificationMethod: coupon.notificationMethod || "none",
      targetAudience: coupon.targetAudience || "all_users",
      bannerImage: coupon.bannerImage || "",
      bannerText: coupon.bannerText || "",
    });
    setAddCouponDialog(true);
  };

  const closeCouponDialog = () => {
    setAddCouponDialog(false);
    setEditingCouponId(null);
    couponForm.reset(COUPON_DEFAULT);
    setCouponBannerPreview("");
  };

  const handleCouponBannerImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    setCouponBannerPreview(URL.createObjectURL(file));
    setCouponBannerUploading(true);
    try {
      const uploadedUrl = await uploadAPI.uploadFile(file);
      couponForm.setValue("bannerImage", uploadedUrl, { shouldValidate: true });
      setCouponBannerPreview(uploadedUrl);
    } catch {
      toast.error("Failed to upload image. Please try again.");
      setCouponBannerPreview(couponForm.getValues("bannerImage") || "");
    } finally {
      setCouponBannerUploading(false);
      e.target.value = "";
    }
  };

  const handleToggleCouponStatus = async (
    coupon: CouponWithId,
    newStatus: boolean,
  ) => {
    const couponId = coupon.id || coupon._id;
    setUpdatingCouponId(couponId);
    try {
      await updateCouponMutation.mutateAsync({
        id: couponId,
        data: { isActive: newStatus },
      });
    } finally {
      setUpdatingCouponId(null);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Select
            value={couponStatus || "all"}
            onValueChange={(v) => {
              setCouponStatus(v === "all" ? undefined : v);
              setCouponPage(1);
            }}
          >
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasPermission("CREATE_COUPON") && (
          <Button
            size="sm"
            className="h-9 text-xs"
            onClick={() => {
              setEditingCouponId(null);
              couponForm.reset(COUPON_DEFAULT);
              setCouponBannerPreview("");
              setAddCouponDialog(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Coupon
          </Button>
        )}
      </div>

      {couponsLoading ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading coupons...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No coupons yet</p>
        </div>
      ) : (
        <>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {[
                      "Code",
                      "Type",
                      "Value",
                      "Min Order",
                      "Usage",
                      "Notifications",
                      "Expiry",
                      "Active",
                      "Actions",
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
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-primary">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className="text-[10px] capitalize"
                        >
                          {coupon.type.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {coupon.type === "percentage"
                          ? `${coupon.value}%`
                          : `$${coupon.value.toLocaleString()}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                        {coupon.minOrderAmount
                          ? `$${coupon.minOrderAmount.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium">
                          {coupon.currentUsageCount}
                        </span>
                        <span className="text-muted-foreground">
                          /{coupon.maxTotalUsage || "∞"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {coupon.notificationsSent ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-green-50 text-green-700 border-green-200"
                          >
                            <Bell className="h-2.5 w-2.5 mr-1" />
                            {coupon.recipientCount}
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(coupon.endDate).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0"
                          onClick={() =>
                            handleToggleCouponStatus(coupon, !coupon.isActive)
                          }
                          disabled={
                            updatingCouponId === coupon.id ||
                            updateCouponMutation.isPending
                          }
                        >
                          {updatingCouponId === coupon.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Switch
                              checked={coupon.isActive}
                              className="scale-75"
                            />
                          )}
                        </Button>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        {hasPermission("EDIT_COUPON") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 h-7"
                            onClick={() => openEditCoupon(coupon)}
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        )}
                        {hasPermission("DELETE_COUPON") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-destructive h-7"
                            onClick={() =>
                              deleteCouponMutation.mutate(coupon.id)
                            }
                            disabled={deleteCouponMutation.isPending}
                          >
                            {deleteCouponMutation.isPending ? (
                              <Loader className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {couponPage} of {pagination.totalPages} ({pagination.total}{" "}
                total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setCouponPage(Math.max(1, couponPage - 1))}
                  disabled={couponPage === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() =>
                    setCouponPage(
                      Math.min(pagination.totalPages, couponPage + 1),
                    )
                  }
                  disabled={couponPage === pagination.totalPages}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── ADD/EDIT COUPON DIALOG ──────────────────────────────────────────── */}
      <Dialog
        open={addCouponDialog}
        onOpenChange={(open) => {
          if (!open) closeCouponDialog();
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCouponId ? "Edit Coupon" : "Add Coupon"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={couponForm.handleSubmit(onSubmitCoupon, (errors) => {
              const firstError = Object.values(errors)[0];
              if (firstError?.message)
                toast.error(firstError.message as string);
            })}
            className="space-y-4"
          >
            {/* Code */}
            <div className="space-y-2">
              <Label className="text-xs">Code <span className="text-primary">*</span></Label>
              <Input
                {...couponForm.register("code")}
                className="h-9 text-sm font-mono"
                placeholder="SAVE20"
                disabled={editingCouponId !== null}
              />
              {couponForm.formState.errors.code && (
                <p className="text-xs text-destructive">
                  {couponForm.formState.errors.code.message}
                </p>
              )}
            </div>

            {/* Type + Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Type <span className="text-primary">*</span></Label>
                <Select
                  onValueChange={(v) =>
                    couponForm.setValue("type", v as any, {
                      shouldValidate: true,
                    })
                  }
                  value={couponForm.watch("type")}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Value <span className="text-primary">*</span></Label>
                <Input
                  type="number"
                  {...couponForm.register("value", { valueAsNumber: true })}
                  className="h-9 text-sm"
                />
                {couponForm.formState.errors.value && (
                  <p className="text-xs text-destructive">
                    {couponForm.formState.errors.value.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs">Description <span className="text-primary">*</span></Label>
              <Input
                {...couponForm.register("description")}
                className="h-9 text-sm"
                placeholder="description"
              />
            </div>

            {/* Min Order + Max Usage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Min Order ($) <span className="text-primary">*</span></Label>
                <Input
                  type="number"
                  {...couponForm.register("minOrderAmount", {
                    valueAsNumber: true,
                  })}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Max Total Usage <span className="text-primary">*</span></Label>
                <Input
                  type="number"
                  {...couponForm.register("maxTotalUsage", {
                    valueAsNumber: true,
                  })}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Start Date <span className="text-primary">*</span></Label>
                <Input
                  type="date"
                  {...couponForm.register("startDate")}
                  className="h-9 text-sm"
                />
                {couponForm.formState.errors.startDate && (
                  <p className="text-xs text-destructive">
                    {couponForm.formState.errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">End Date <span className="text-primary">*</span></Label>
                <Input
                  type="date"
                  {...couponForm.register("endDate")}
                  className="h-9 text-sm"
                />
                {couponForm.formState.errors.endDate && (
                  <p className="text-xs text-destructive">
                    {couponForm.formState.errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="coupon-active"
                checked={couponForm.watch("isActive")}
                onCheckedChange={(checked) =>
                  couponForm.setValue("isActive", checked as boolean)
                }
              />
              <Label htmlFor="coupon-active" className="text-xs cursor-pointer">
                Active
              </Label>
            </div>

            {/* Notifications */}
            {watchedNotifMethod !== "none" && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold">Notifications</h4>
                </div>

                {/* Notification checkboxes */}
                <div className="space-y-2">
                  {[
                    {
                      id: "email",
                      label: "Email Notification",
                      icon: <Mail className="h-3.5 w-3.5" />,
                    },
                    {
                      id: "inApp",
                      label: "In-App Notification",
                      icon: <Bell className="h-3.5 w-3.5" />,
                    },
                    {
                      id: "banner",
                      label: "Banner Display",
                      icon: <Image className="h-3.5 w-3.5" />,
                    },
                  ].map(({ id, label, icon }) => (
                    <div
                      key={id}
                      className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded"
                    >
                      <Checkbox
                        id={`notif-${id}`}
                        checked={selectedMethods.has(id)}
                        onCheckedChange={(checked) =>
                          handleNotifCheckbox(id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`notif-${id}`}
                        className="text-xs cursor-pointer flex items-center gap-1"
                      >
                        {icon}
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Target Audience - Only show for email/inApp, NOT for banner-only */}
                {shouldShowTargetAudience && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs">Target Audience</Label>
                    <Select
                      onValueChange={(v) =>
                        couponForm.setValue("targetAudience", v as any)
                      }
                      value={couponForm.watch("targetAudience")}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_users">
                          All Active Users
                        </SelectItem>
                        <SelectItem value="new_users">
                          New Users (Last 30 Days)
                        </SelectItem>
                        <SelectItem value="returning_users">
                          Returning Customers
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Banner Image - Only show when banner is selected */}
                {isBannerSelected && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs">Banner Image</Label>
                    {couponBannerPreview && (
                      <div className="relative w-full h-24 bg-muted rounded-lg overflow-hidden border border-border mb-2">
                        <img
                          src={couponBannerPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <label className="flex items-center justify-center w-full h-9 px-3 border border-dashed border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCouponBannerImageUpload}
                        disabled={couponBannerUploading}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {couponBannerUploading ? (
                          <>
                            <Loader className="h-3.5 w-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5" />
                            <span>Click to upload</span>
                          </>
                        )}
                      </div>
                    </label>
                    {couponForm.formState.errors.bannerImage && (
                      <p className="text-xs text-destructive">
                        {couponForm.formState.errors.bannerImage.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Banner Text - Only show when banner is selected */}
                {isBannerSelected && (
                  <div className="space-y-2">
                    <Label className="text-xs">Banner Text</Label>
                    <Input
                      {...couponForm.register("bannerText")}
                      className="h-9 text-sm"
                      placeholder="e.g., Get 20% Off!"
                    />
                    {couponForm.formState.errors.bannerText && (
                      <p className="text-xs text-destructive">
                        {couponForm.formState.errors.bannerText.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Default notification toggle - when no notifications selected */}
            {watchedNotifMethod === "none" && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Notifications</h4>
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      id: "email",
                      label: "Email Notification",
                      icon: <Mail className="h-3.5 w-3.5" />,
                    },
                    {
                      id: "inApp",
                      label: "In-App Notification",
                      icon: <Bell className="h-3.5 w-3.5" />,
                    },
                    {
                      id: "banner",
                      label: "Banner Display",
                      icon: <Image className="h-3.5 w-3.5" />,
                    },
                  ].map(({ id, label, icon }) => (
                    <div
                      key={id}
                      className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded"
                    >
                      <Checkbox
                        id={`notif-${id}`}
                        checked={selectedMethods.has(id)}
                        onCheckedChange={(checked) =>
                          handleNotifCheckbox(id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`notif-${id}`}
                        className="text-xs cursor-pointer flex items-center gap-1"
                      >
                        {icon}
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeCouponDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  createCouponMutation.isPending ||
                  updateCouponMutation.isPending ||
                  couponBannerUploading
                }
              >
                {createCouponMutation.isPending ||
                updateCouponMutation.isPending ? (
                  <>
                    <Loader className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    {editingCouponId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editingCouponId ? "Update Coupon" : "Create Coupon"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
