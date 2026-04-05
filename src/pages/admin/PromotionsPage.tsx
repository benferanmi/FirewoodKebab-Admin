import { useState } from "react";
import {
  Plus,
  Tag,
  Image,
  Upload,
  Loader,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  useBanners,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
} from "@/hooks/usePromotions";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  couponSchema,
  CouponFormData,
  bannerSchema,
  BannerFormData,
} from "@/validations/promotions";
import { uploadAPI } from "@/services/api/uploadapi";
import { toast } from "sonner";

interface CouponWithId {
  _id?: string;
  id?: string;
  [key: string]: any;
}

interface BannerWithId {
  _id?: string;
  id?: string;
  [key: string]: any;
}

// Helper to normalize _id to id
const normalizeId = (item: any) => ({
  ...item,
  id: item.id || item._id,
});

export default function PromotionsPage() {
  const { hasPermission } = useAuthStore();
  const { data: couponsData, isLoading: couponsLoading } = useCoupons();
  const { data: bannersData, isLoading: bannersLoading } = useBanners();
  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();
  const deleteCouponMutation = useDeleteCoupon();
  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();
  const deleteBannerMutation = useDeleteBanner();

  const [addCouponDialog, setAddCouponDialog] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [addBannerDialog, setAddBannerDialog] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerImageUploading, setBannerImageUploading] = useState(false);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>("");
  const [couponPage, setCouponPage] = useState(1);
  const [couponStatus, setCouponStatus] = useState<string | undefined>();
  const [updatingCouponId, setUpdatingCouponId] = useState<string | null>(null);
  const [updatingBannerId, setUpdatingBannerId] = useState<string | null>(null);

  // Normalize coupon data
  const coupons = (couponsData?.data || []).map(normalizeId);
  const pagination = couponsData?.pagination;

  // Normalize banner data
  const banners = (bannersData || []).map(normalizeId);

  const couponForm = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      type: "percentage",
      value: 0,
      isActive: true,
      startDate: "",
      endDate: "",
      description: "",
      minOrderAmount: undefined,
      maxTotalUsage: undefined,
    },
  });

  const bannerForm = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      image: "",
      isActive: true,
      startDate: "",
      endDate: "",
      description: "",
      ctaText: "",
      ctaLink: "",
    },
  });

  // Handle coupon form submission (create or update)
  const onSubmitCoupon = (data: CouponFormData) => {
    if (editingCouponId) {
      // Update mode
      updateCouponMutation.mutate(
        { id: editingCouponId, data },
        {
          onSuccess: () => {
            setAddCouponDialog(false);
            setEditingCouponId(null);
            couponForm.reset();
          },
        },
      );
    } else {
      // Create mode
      createCouponMutation.mutate(data as any, {
        onSuccess: () => {
          setAddCouponDialog(false);
          couponForm.reset();
        },
      });
    }
  };

  // Handle banner form submission (create or update)
  const onSubmitBanner = (data: BannerFormData) => {
    if (editingBannerId) {
      // Update mode
      updateBannerMutation.mutate(
        { id: editingBannerId, data },
        {
          onSuccess: () => {
            setAddBannerDialog(false);
            setEditingBannerId(null);
            bannerForm.reset();
            setBannerImagePreview("");
          },
        },
      );
    } else {
      // Create mode
      createBannerMutation.mutate(data as any, {
        onSuccess: () => {
          setAddBannerDialog(false);
          bannerForm.reset();
          setBannerImagePreview("");
        },
      });
    }
  };

  // Open edit coupon dialog
  const openEditCoupon = (coupon: CouponWithId) => {
    setEditingCouponId(coupon.id || coupon._id);
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
    });
    setAddCouponDialog(true);
  };

  // Open edit banner dialog
  const openEditBanner = (banner: BannerWithId) => {
    setEditingBannerId(banner.id || banner._id);
    setBannerImagePreview(banner.image);
    bannerForm.reset({
      title: banner.title,
      description: banner.description || "",
      image: banner.image,
      ctaText: banner.ctaText || "",
      ctaLink: banner.ctaLink || "",
      startDate: new Date(banner.startDate).toISOString().split("T")[0],
      endDate: new Date(banner.endDate).toISOString().split("T")[0],
      isActive: banner.isActive,
    });
    setAddBannerDialog(true);
  };

  // Handle banner image upload
  const handleBannerImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    setBannerImageUploading(true);
    try {
      const uploadedUrl = await uploadAPI.uploadFile(file);
      bannerForm.setValue("image", uploadedUrl);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setBannerImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setBannerImageUploading(false);
    }
  };

  // Toggle coupon active status
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

  // Toggle banner active status
  const handleToggleBannerStatus = async (
    banner: BannerWithId,
    newStatus: boolean,
  ) => {
    const bannerId = banner.id || banner._id;
    setUpdatingBannerId(bannerId);
    try {
      await updateBannerMutation.mutateAsync({
        id: bannerId,
        data: { isActive: newStatus },
      });
    } finally {
      setUpdatingBannerId(null);
    }
  };

  // Close dialogs and reset forms
  const closeCouponDialog = () => {
    setAddCouponDialog(false);
    setEditingCouponId(null);
    couponForm.reset();
  };

  const closeBannerDialog = () => {
    setAddBannerDialog(false);
    setEditingBannerId(null);
    bannerForm.reset();
    setBannerImagePreview("");
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="coupons">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="coupons" className="text-xs">
            <Tag className="h-3.5 w-3.5 mr-1.5" />
            Coupons
          </TabsTrigger>
          <TabsTrigger value="banners" className="text-xs">
            <Image className="h-3.5 w-3.5 mr-1.5" />
            Banners
          </TabsTrigger>
        </TabsList>

        {/* COUPONS TAB */}
        <TabsContent value="coupons" className="space-y-4">
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
                  couponForm.reset({
                    code: "",
                    type: "percentage",
                    value: 0,
                    isActive: true,
                    startDate: "",
                    endDate: "",
                    description: "",
                    minOrderAmount: undefined,
                    maxTotalUsage: undefined,
                  });
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
              <p className="text-sm text-muted-foreground">
                Loading coupons...
              </p>
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
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Min Order
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Usage
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Expiry
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Active
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
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
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(coupon.endDate).toLocaleDateString(
                              "en-NG",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0"
                              onClick={() =>
                                handleToggleCouponStatus(
                                  coupon,
                                  !coupon.isActive,
                                )
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

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Page {couponPage} of {pagination.totalPages} (
                    {pagination.total} total)
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
        </TabsContent>

        {/* BANNERS TAB */}
        <TabsContent value="banners" className="space-y-4">
          <div className="flex justify-end">
            {hasPermission("MANAGE_CONTENT") && (
              <Button
                size="sm"
                className="h-9 text-xs"
                onClick={() => {
                  setEditingBannerId(null);
                  setBannerImagePreview("");
                  bannerForm.reset({
                    title: "",
                    image: "",
                    isActive: true,
                    startDate: "",
                    endDate: "",
                    description: "",
                    ctaText: "",
                    ctaLink: "",
                  });
                  setAddBannerDialog(true);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Banner
              </Button>
            )}
          </div>

          {bannersLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="glass-card rounded-xl overflow-hidden p-8 text-center">
                <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Loading banners...
                </p>
              </div>
            </div>
          ) : banners.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
              No banners yet
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="glass-card rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-info/10 flex items-center justify-center overflow-hidden">
                    {banner.image ? (
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Banner Image
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col">
                    <h4 className="text-sm font-semibold">{banner.title}</h4>
                    <p className="text-xs text-muted-foreground flex-1">
                      {banner.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {banner.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0"
                          onClick={() =>
                            handleToggleBannerStatus(banner, !banner.isActive)
                          }
                          disabled={
                            updatingBannerId === banner.id ||
                            updateBannerMutation.isPending
                          }
                        >
                          {updatingBannerId === banner.id ? (
                            <Loader className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Switch
                              checked={banner.isActive}
                              className="scale-75"
                            />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      {hasPermission("MANAGE_CONTENT") && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 h-7 flex-1"
                            onClick={() => openEditBanner(banner)}
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-destructive h-7 flex-1"
                            onClick={() =>
                              deleteBannerMutation.mutate(banner.id)
                            }
                            disabled={deleteBannerMutation.isPending}
                          >
                            {deleteBannerMutation.isPending ? (
                              <Loader className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Coupon Dialog */}
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
            onSubmit={couponForm.handleSubmit(onSubmitCoupon)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="text-xs">Code</Label>
              <Input
                {...couponForm.register("code")}
                className="h-9 text-sm font-mono uppercase"
                placeholder="SAVE20"
                disabled={editingCouponId !== null}
              />
              {couponForm.formState.errors.code && (
                <p className="text-xs text-destructive">
                  {couponForm.formState.errors.code.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select
                  onValueChange={(v) => couponForm.setValue("type", v as any)}
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
                <Label className="text-xs">Value</Label>
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

            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Input
                {...couponForm.register("description")}
                className="h-9 text-sm"
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Min Order ($)</Label>
                <Input
                  type="number"
                  {...couponForm.register("minOrderAmount", {
                    valueAsNumber: true,
                  })}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Max Total Usage</Label>
                <Input
                  type="number"
                  {...couponForm.register("maxTotalUsage", {
                    valueAsNumber: true,
                  })}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Start Date</Label>
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
                <Label className="text-xs">End Date</Label>
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
                  !couponForm.formState.isValid
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

      {/* Add/Edit Banner Dialog */}
      <Dialog
        open={addBannerDialog}
        onOpenChange={(open) => {
          if (!open) closeBannerDialog();
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBannerId ? "Edit Banner" : "Add Banner"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={bannerForm.handleSubmit(onSubmitBanner)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="text-xs">Title</Label>
              <Input
                {...bannerForm.register("title")}
                className="h-9 text-sm"
                placeholder="Banner title"
              />
              {bannerForm.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {bannerForm.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                {...bannerForm.register("description")}
                className="text-sm min-h-[60px]"
                placeholder="Banner description"
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label className="text-xs">Banner Image</Label>
              <div className="space-y-2">
                {/* Preview */}
                {(bannerImagePreview || bannerForm.watch("image")) && (
                  <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden border border-border">
                    <img
                      src={bannerImagePreview || bannerForm.watch("image")}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Upload Input */}
                <label className="flex items-center justify-center w-full h-9 px-3 border border-dashed border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageUpload}
                    disabled={bannerImageUploading}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {bannerImageUploading ? (
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
              </div>
              {bannerForm.formState.errors.image && (
                <p className="text-xs text-destructive">
                  {bannerForm.formState.errors.image.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">CTA Text</Label>
                <Input
                  {...bannerForm.register("ctaText")}
                  className="h-9 text-sm"
                  placeholder="Shop Now"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">CTA Link</Label>
                <Input
                  {...bannerForm.register("ctaLink")}
                  className="h-9 text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  {...bannerForm.register("startDate")}
                  className="h-9 text-sm"
                />
                {bannerForm.formState.errors.startDate && (
                  <p className="text-xs text-destructive">
                    {bannerForm.formState.errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  {...bannerForm.register("endDate")}
                  className="h-9 text-sm"
                />
                {bannerForm.formState.errors.endDate && (
                  <p className="text-xs text-destructive">
                    {bannerForm.formState.errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="banner-active"
                checked={bannerForm.watch("isActive")}
                onCheckedChange={(checked) =>
                  bannerForm.setValue("isActive", checked as boolean)
                }
              />
              <Label htmlFor="banner-active" className="text-xs cursor-pointer">
                Active
              </Label>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeBannerDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  createBannerMutation.isPending ||
                  updateBannerMutation.isPending ||
                  bannerImageUploading ||
                  !bannerForm.formState.isValid
                }
              >
                {createBannerMutation.isPending ||
                updateBannerMutation.isPending ? (
                  <>
                    <Loader className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    {editingBannerId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editingBannerId ? "Update Banner" : "Create Banner"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
