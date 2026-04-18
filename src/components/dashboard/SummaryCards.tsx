import { useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  Users,
  Star,
  Tag,
} from "lucide-react";
import { useDashboardSummaryCards } from "@/hooks/useDashboard";
import { SummaryCards as SummaryCardsType } from "@/services/api/dashboard";

interface CardProps {
  title: string;
  icon: React.ElementType;
  isLoading: boolean;
  href: string;
  rows: { label: string; value: string | number; accent?: boolean }[];
}

function SummaryCard({ title, icon: Icon, isLoading, href, rows }: CardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(href)}
      className="glass-card rounded-xl p-5 text-left w-full hover:ring-2 hover:ring-primary/30 transition-all duration-150 group"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-5 bg-muted/60 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span
                className={`text-xs font-semibold tabular-nums ${
                  row.accent ? "text-amber-500" : "text-foreground"
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

export function SummaryCards() {
  const { data, isLoading } = useDashboardSummaryCards();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Menu Items"
        icon={UtensilsCrossed}
        isLoading={isLoading}
        href="/admin/menu"
        rows={[
          { label: "Published", value: data?.menu.published ?? 0 },
          { label: "Categories", value: data?.menu.categories ?? 0 },
          {
            label: "Unavailable",
            value: data?.menu.unavailable ?? 0,
            accent: (data?.menu.unavailable ?? 0) > 0,
          },
        ]}
      />

      <SummaryCard
        title="Customers"
        icon={Users}
        isLoading={isLoading}
        href="/admin/customers"
        rows={[
          { label: "Total", value: data?.customers.total ?? 0 },
          { label: "New Today", value: data?.customers.newToday ?? 0 },
          {
            label: "Blocked",
            value: data?.customers.blocked ?? 0,
            accent: (data?.customers.blocked ?? 0) > 0,
          },
        ]}
      />

      <SummaryCard
        title="Reviews"
        icon={Star}
        isLoading={isLoading}
        href="/admin/reviews"
        rows={[
          { label: "Approved", value: data?.reviews.approved ?? 0 },
          {
            label: "Pending Approval",
            value: data?.reviews.pending ?? 0,
            accent: (data?.reviews.pending ?? 0) > 0,
          },
          {
            label: "Avg Rating",
            value: data?.reviews.averageRating
              ? `${data.reviews.averageRating} ★`
              : "—",
          },
        ]}
      />

      <SummaryCard
        title="Promotions"
        icon={Tag}
        isLoading={isLoading}
        href="/admin/promotions"
        rows={[
          { label: "Active Coupons", value: data?.promotions.activeCoupons ?? 0 },
          { label: "Active Banners", value: data?.promotions.activeBanners ?? 0 },
          {
            label: "Announcements",
            value: data?.promotions.activeAnnouncements ?? 0,
          },
        ]}
      />
    </div>
  );
}