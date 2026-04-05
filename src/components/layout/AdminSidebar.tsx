import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Tag,
  Star, BarChart3, UserCog, Settings, FileText, Bell, LogOut, ChefHat,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { PERMISSIONS } from "@/types/admin";

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard", permission: PERMISSIONS.VIEW_ORDERS },
  { to: "/admin/orders", icon: ShoppingBag, label: "Orders", permission: PERMISSIONS.VIEW_ORDERS },
  { to: "/admin/menu", icon: UtensilsCrossed, label: "Menu", permission: PERMISSIONS.VIEW_MENU },
  { to: "/admin/customers", icon: Users, label: "Customers", permission: PERMISSIONS.VIEW_CUSTOMERS },
  { to: "/admin/promotions", icon: Tag, label: "Promotions", permission: PERMISSIONS.VIEW_PROMOTIONS },
  { to: "/admin/reviews", icon: Star, label: "Reviews", permission: PERMISSIONS.VIEW_REVIEWS },
  // { to: "/admin/analytics", icon: BarChart3, label: "Analytics", permission: PERMISSIONS.VIEW_ANALYTICS },
  { to: "/admin/team", icon: UserCog, label: "Team", permission: PERMISSIONS.MANAGE_ADMIN_USERS },
  { to: "/admin/settings", icon: Settings, label: "Settings", permission: PERMISSIONS.MANAGE_SETTINGS },
  // { to: "/admin/content", icon: FileText, label: "Content", permission: PERMISSIONS.MANAGE_CONTENT },
  { to: "/admin/notifications", icon: Bell, label: "Notifications", permission: PERMISSIONS.SEND_NOTIFICATIONS },
];

export function AdminSidebar() {
  const { hasPermission, logout, admin } = useAuthStore();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar sidebar-glow">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <ChefHat className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-sidebar-accent-foreground">Firewoodkebabadmin</h1>
          <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          if (!hasPermission(item.permission)) return null;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-primary/15 text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-sidebar-primary")} />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-pulse-dot" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            {admin?.firstName?.[0]}{admin?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
              {admin?.firstName} {admin?.lastName}
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 capitalize">{admin?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
