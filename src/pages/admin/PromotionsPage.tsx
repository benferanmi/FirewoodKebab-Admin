import { useState } from "react";
import { Plus, Tag, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoupons, useCreateCoupon, useDeleteCoupon, useBanners, useCreateBanner, useDeleteBanner } from "@/hooks/usePromotions";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema, CouponFormData, bannerSchema, BannerFormData } from "@/validations/promotions";

export default function PromotionsPage() {
  const { hasPermission } = useAuthStore();
  const { data: couponsData } = useCoupons();
  const { data: bannersData } = useBanners();
  const createCouponMutation = useCreateCoupon();
  const deleteCouponMutation = useDeleteCoupon();
  const createBannerMutation = useCreateBanner();
  const deleteBannerMutation = useDeleteBanner();

  const [addCouponDialog, setAddCouponDialog] = useState(false);
  const [addBannerDialog, setAddBannerDialog] = useState(false);

  const coupons = couponsData?.data || [];
  const banners = bannersData || [];

  const couponForm = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: { code: "", type: "percentage", value: 0, isActive: true, startDate: "", endDate: "" },
  });

  const bannerForm = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { title: "", image: "", isActive: true, startDate: "", endDate: "" },
  });

  const onSubmitCoupon = (data: CouponFormData) => {
    createCouponMutation.mutate(data as any, {
      onSuccess: () => { setAddCouponDialog(false); couponForm.reset(); },
    });
  };

  const onSubmitBanner = (data: BannerFormData) => {
    createBannerMutation.mutate(data as any, {
      onSuccess: () => { setAddBannerDialog(false); bannerForm.reset(); },
    });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="coupons">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="coupons" className="text-xs"><Tag className="h-3.5 w-3.5 mr-1.5" />Coupons</TabsTrigger>
          <TabsTrigger value="banners" className="text-xs"><Image className="h-3.5 w-3.5 mr-1.5" />Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-end">
            {hasPermission("CREATE_COUPON") && (
              <Button size="sm" className="h-9 text-xs" onClick={() => setAddCouponDialog(true)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />Add Coupon
              </Button>
            )}
          </div>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Min Order</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Usage</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Expiry</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active</th>
                  {hasPermission("DELETE_COUPON") && <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-sm font-semibold text-primary">{coupon.code}</span></td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px] capitalize">{coupon.type.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3 text-sm font-medium">{coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value.toLocaleString()}`}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{coupon.minOrderAmount ? `$${coupon.minOrderAmount.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 text-sm"><span className="font-medium">{coupon.currentUsageCount}</span><span className="text-muted-foreground">/{coupon.maxTotalUsage || "∞"}</span></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(coupon.endDate).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="px-4 py-3"><Switch checked={coupon.isActive} className="scale-75" /></td>
                    {hasPermission("DELETE_COUPON") && (
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-destructive h-7"
                          onClick={() => deleteCouponMutation.mutate(coupon.id)}
                          disabled={deleteCouponMutation.isPending}
                        >
                          Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="banners" className="space-y-4">
          <div className="flex justify-end">
            {hasPermission("CREATE_COUPON") && (
              <Button size="sm" className="h-9 text-xs" onClick={() => setAddBannerDialog(true)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />Add Banner
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {banners.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-muted-foreground">No banners yet</div>
            )}
            {banners.map((banner) => (
              <div key={banner.id} className="glass-card rounded-xl overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-primary/20 to-info/10 flex items-center justify-center">
                  {banner.image ? <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" /> : <span className="text-sm text-muted-foreground">Banner Image</span>}
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-semibold">{banner.title}</h4>
                  <p className="text-xs text-muted-foreground">{banner.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">{banner.isActive ? "Active" : "Inactive"}</Badge>
                    {hasPermission("DELETE_COUPON") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive h-7"
                        onClick={() => deleteBannerMutation.mutate(banner.id)}
                        disabled={deleteBannerMutation.isPending}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Coupon Dialog */}
      <Dialog open={addCouponDialog} onOpenChange={setAddCouponDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Coupon</DialogTitle></DialogHeader>
          <form onSubmit={couponForm.handleSubmit(onSubmitCoupon)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Code</Label>
              <Input {...couponForm.register("code")} className="h-9 text-sm font-mono" placeholder="SAVE20" />
              {couponForm.formState.errors.code && <p className="text-xs text-destructive">{couponForm.formState.errors.code.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select onValueChange={(v) => couponForm.setValue("type", v as any)} value={couponForm.watch("type")}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Value</Label>
                <Input type="number" {...couponForm.register("value")} className="h-9 text-sm" />
                {couponForm.formState.errors.value && <p className="text-xs text-destructive">{couponForm.formState.errors.value.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Input {...couponForm.register("description")} className="h-9 text-sm" placeholder="Optional description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Min Order ($)</Label>
                <Input type="number" {...couponForm.register("minOrderAmount")} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Max Total Usage</Label>
                <Input type="number" {...couponForm.register("maxTotalUsage")} className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Start Date</Label>
                <Input type="date" {...couponForm.register("startDate")} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">End Date</Label>
                <Input type="date" {...couponForm.register("endDate")} className="h-9 text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddCouponDialog(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={createCouponMutation.isPending}>
                {createCouponMutation.isPending ? "Creating..." : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Banner Dialog */}
      <Dialog open={addBannerDialog} onOpenChange={setAddBannerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Banner</DialogTitle></DialogHeader>
          <form onSubmit={bannerForm.handleSubmit(onSubmitBanner)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Title</Label>
              <Input {...bannerForm.register("title")} className="h-9 text-sm" placeholder="Banner title" />
              {bannerForm.formState.errors.title && <p className="text-xs text-destructive">{bannerForm.formState.errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea {...bannerForm.register("description")} className="text-sm min-h-[60px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Image URL</Label>
              <Input {...bannerForm.register("image")} className="h-9 text-sm" placeholder="https://..." />
              {bannerForm.formState.errors.image && <p className="text-xs text-destructive">{bannerForm.formState.errors.image.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">CTA Text</Label>
                <Input {...bannerForm.register("ctaText")} className="h-9 text-sm" placeholder="Shop Now" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">CTA Link</Label>
                <Input {...bannerForm.register("ctaLink")} className="h-9 text-sm" placeholder="https://..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Start Date</Label>
                <Input type="date" {...bannerForm.register("startDate")} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">End Date</Label>
                <Input type="date" {...bannerForm.register("endDate")} className="h-9 text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddBannerDialog(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={createBannerMutation.isPending}>
                {createBannerMutation.isPending ? "Creating..." : "Create Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
