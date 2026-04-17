import { Tag, Image, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BannerComponent from "@/components/promotion/BannerComponent";
import CouponComponent from "@/components/promotion/CouponComponent";
import AnnouncementComponent from "@/components/promotion/AnnouncementComponent";

export default function MarketingPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Tag className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Marketing</h1>
          <p className="text-sm text-muted-foreground">
            Manage coupons, banners, and announcements
          </p>
        </div>
      </div>

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
          <TabsTrigger value="announcements" className="text-xs">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Announcements
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

        {/* ── ANNOUNCEMENTS TAB ────────────────────────────────────────────────── */}
        <TabsContent value="announcements" className="space-y-4">
          <AnnouncementComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
