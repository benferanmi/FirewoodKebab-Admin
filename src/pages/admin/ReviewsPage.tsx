import { Star, Check, EyeOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReviews, useApproveReview, useHideReview, useDeleteReview } from "@/hooks/useReviews";
import { useFiltersStore } from "@/store/filtersStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export default function ReviewsPage() {
  const { reviewFilters, setReviewFilters } = useFiltersStore();
  const { hasPermission } = useAuthStore();

  const { data: reviewsData, isLoading } = useReviews({
    status: reviewFilters.status === "all" ? undefined : reviewFilters.status as any,
    page: reviewFilters.page,
    limit: reviewFilters.limit,
  });

  const approveMutation = useApproveReview();
  const hideMutation = useHideReview();
  const deleteMutation = useDeleteReview();

  const reviews = reviewsData?.data || [];

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4 flex items-center gap-3">
        <Select value={reviewFilters.status} onValueChange={(v) => setReviewFilters({ status: v as any, page: 1 })}>
          <SelectTrigger className="w-[160px] h-9 text-sm bg-muted/50 border-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{reviews.length} reviews</span>
      </div>

      <div className="space-y-3">
        {isLoading && <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>}
        {reviews.map((review) => (
          <div key={review.id} className="glass-card rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{review.customerName}</span>
                  <Badge variant={review.isApproved ? "secondary" : review.isHidden ? "destructive" : "outline"} className="text-[10px]">
                    {review.isApproved ? "Approved" : review.isHidden ? "Hidden" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("h-3.5 w-3.5", i < review.rating ? "fill-warning text-warning" : "text-border")} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">{review.rating}/5</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-muted-foreground">{review.orderNumber}</span>
                {review.menuItemName && <p className="text-[10px] text-muted-foreground">{review.menuItemName}</p>}
              </div>
            </div>
            <p className="text-sm text-foreground/80 mb-3">{review.comment}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <div className="flex gap-1">
                {hasPermission("APPROVE_REVIEW") && !review.isApproved && !review.isHidden && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-success"
                    onClick={() => approveMutation.mutate({ id: review.id })}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="h-3 w-3 mr-1" />Approve
                  </Button>
                )}
                {hasPermission("APPROVE_REVIEW") && !review.isHidden && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-warning"
                    onClick={() => hideMutation.mutate({ id: review.id, reason: "Hidden by admin" })}
                    disabled={hideMutation.isPending}
                  >
                    <EyeOff className="h-3 w-3 mr-1" />Hide
                  </Button>
                )}
                {hasPermission("DELETE_REVIEW") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive"
                    onClick={() => deleteMutation.mutate(review.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
