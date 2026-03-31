import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contentAPI } from "@/services/api/content";
import { toast } from "sonner";

export function useHomeContent() {
  return useQuery({
    queryKey: ["content", "home"],
    queryFn: () => contentAPI.getHomeContent(),
    placeholderData: {
      heroTitle: "Delicious Food, Delivered Fast",
      heroSubtitle: "Order from the best restaurant in Lagos. Fresh ingredients, authentic recipes, and speedy delivery right to your door.",
      heroImage: "",
    },
  });
}

export function useUpdateHomeContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contentAPI.updateHomeContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content", "home"] });
      toast.success("Hero content saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save content");
    },
  });
}

export function useGallery() {
  return useQuery({
    queryKey: ["content", "gallery"],
    queryFn: () => contentAPI.getGallery(),
    placeholderData: [],
  });
}

export function useUploadGalleryImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => contentAPI.uploadGalleryImage(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content", "gallery"] });
      toast.success("Image uploaded");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to upload image");
    },
  });
}

export function useDeleteGalleryImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentAPI.deleteGalleryImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content", "gallery"] });
      toast.success("Image deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete image");
    },
  });
}
