import { Bell, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/menu": "Menu Management",
  "/admin/customers": "Customers",
  "/admin/promotions": "Promotions",
  "/admin/reviews": "Reviews",
  "/admin/analytics": "Analytics",
  "/admin/team": "Team Management",
  "/admin/settings": "Settings",
  "/admin/content": "Content",
  "/admin/notifications": "Notifications",
};

export function AdminHeader() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* s */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-0.5 -top-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-destructive text-destructive-foreground border-2 border-background">
            3
          </Badge>
        </Button>
      </div>
    </header>
  );
}
