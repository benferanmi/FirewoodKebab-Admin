import { Tag, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BannerComponent from "@/components/promotion/BannerComponent";
import CouponComponent from "@/components/promotion/CouponComponent";

export default function PromotionsPage() {
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

        {/* ── COUPONS TAB ────────────────────────────────────────────────────── */}
        <TabsContent value="coupons" className="space-y-4">
          <CouponComponent />
        </TabsContent>

        {/* ── BANNERS TAB ─────────────────────────────────────────────────────── */}
        <TabsContent value="banners" className="space-y-4">
          <BannerComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}