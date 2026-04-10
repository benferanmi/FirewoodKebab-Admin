import { useState } from "react";
import {
  Plus,
  Loader,
  Edit2,
  Upload,
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useBanners,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
} from "@/hooks/usePromotions";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bannerSchema,
  BannerFormData,
} from "@/validations/promotions";
import { uploadAPI } from "@/services/api/uploadapi";
import { toast } from "sonner";

interface BannerWithId {
  _id?: string;
  id?: string;
  [key: string]: any;
}

const normalizeId = (item: any) => ({
  ...item,
  id: item.id || item._id,
});

export default function BannerComponent() {
  const { hasPermission } = useAuthStore();
  const { data: bannersData, isLoading: bannersLoading } = useBanners();
  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();
  const deleteBannerMutation = useDeleteBanner();

  const [addBannerDialog, setAddBannerDialog] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState("");
  const [bannerImageUploading, setBannerImageUploading] = useState(false);
  const [updatingBannerId, setUpdatingBannerId] = useState<string | null>(null);

  const banners = (bannersData || []).map(normalizeId);

  // ─── Banner Form ─────────────────────────────────────────────────────────────

  const bannerForm = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      image: "",
      isActive: true,
      description: "",
      ctaText: "",
      ctaLink: "",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmitBanner = (data: BannerFormData) => {
    if (editingBannerId) {
      updateBannerMutation.mutate(
        { id: editingBannerId, data },
        { onSuccess: () => closeBannerDialog() },
      );
    } else {
      createBannerMutation.mutate(data as any, {
        onSuccess: () => closeBannerDialog(),
      });
    }
  };

  const openEditBanner = (banner: BannerWithId) => {
    setEditingBannerId(banner.id || banner._id);
    setBannerImagePreview(banner.image);
    bannerForm.reset({
      title: banner.title,
      description: banner.description || "",
      image: banner.image,
      ctaText: banner.ctaText || "",
      ctaLink: banner.ctaLink || "",
      isActive: banner.isActive,
      startDate: banner.startDate
        ? new Date(banner.startDate).toISOString().split("T")[0]
        : "",
      endDate: banner.endDate
        ? new Date(banner.endDate).toISOString().split("T")[0]
        : "",
    });
    setAddBannerDialog(true);
  };

  const closeBannerDialog = () => {
    setAddBannerDialog(false);
    setEditingBannerId(null);
    bannerForm.reset();
    setBannerImagePreview("");
  };

  const handleBannerImageUpload = async (
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
    setBannerImagePreview(URL.createObjectURL(file));
    setBannerImageUploading(true);
    try {
      const uploadedUrl = await uploadAPI.uploadFile(file);
      bannerForm.setValue("image", uploadedUrl, { shouldValidate: true });
      setBannerImagePreview(uploadedUrl);
    } catch {
      toast.error("Failed to upload image. Please try again.");
      setBannerImagePreview(bannerForm.getValues("image") || "");
    } finally {
      setBannerImageUploading(false);
      e.target.value = "";
    }
  };

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

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
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
                description: "",
                ctaText: "",
                ctaLink: "",
                startDate: "",
                endDate: "",
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
        <div className="glass-card rounded-xl p-8 text-center">
          <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
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

      {/* ── ADD/EDIT BANNER DIALOG ──────────────────────────────────────────── */}
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
            onSubmit={bannerForm.handleSubmit(onSubmitBanner, (errors) => {
              const firstError = Object.values(errors)[0];
              if (firstError?.message)
                toast.error(firstError.message as string);
            })}
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

            {/* Banner Image Upload */}
            <div className="space-y-2">
              <Label className="text-xs">Banner Image</Label>
              {bannerImagePreview && (
                <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden border border-border">
                  <img
                    src={bannerImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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
              {bannerForm.formState.errors.image && (
                <p className="text-xs text-destructive">
                  {bannerForm.formState.errors.image.message}
                </p>
              )}
            </div>

            {/* CTA */}
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

            {/* Dates */}
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

            {/* Active */}
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
                  bannerImageUploading
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