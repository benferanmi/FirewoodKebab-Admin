import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsAPI, ReviewFilters } from "@/services/api/reviews";
import { toast } from "sonner";

export function useReviews(params?: ReviewFilters) {
  return useQuery({
    queryKey: ["reviews", params],
    queryFn: () => reviewsAPI.getReviews(params),
    // placeholderData: { data: mockReviews, pagination: undefined },
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminNotes }: { id: string; adminNotes?: string }) =>
      reviewsAPI.approveReview(id, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review approved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to approve review");
    },
  });
}

export function useHideReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reviewsAPI.hideReview(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review hidden");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to hide review");
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsAPI.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete review");
    },
  });
}
