import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  isLoading = false,
}: StatsCardProps) {
  const isPositive = change && change > 0;

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-5 stat-gradient">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg animate-pulse",
              iconColor || "bg-muted",
            )}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5 stat-gradient">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-success" : "text-destructive",
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(change)}% vs last week
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            iconColor || "bg-primary/10",
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              iconColor ? "text-foreground" : "text-primary",
            )}
          />
        </div>
      </div>
    </div>
  );
}
