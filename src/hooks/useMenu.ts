import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  menuAPI,
  CreateMenuItemRequest,
  MenuCategory,
} from "@/services/api/menu";
import { toast } from "sonner";

export function useMenuItems(params?: {
  category?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["menu", "items", params],
    queryFn: () => menuAPI.getItems(params),
    // placeholderData: { data: mockMenuItems, pagination: undefined },
  });
}

export function useMenuCategories() {
  return useQuery({
    queryKey: ["menu", "categories"],
    queryFn: () => menuAPI.getCategories(),
    // placeholderData: [
    //   { id: "1", name: "Rice Dishes", displayOrder: 0, isActive: true },
    //   { id: "2", name: "Proteins", displayOrder: 1, isActive: true },
    //   { id: "3", name: "Soups", displayOrder: 2, isActive: true },
    //   { id: "4", name: "Swallows", displayOrder: 3, isActive: true },
    // ],
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuItemRequest) => menuAPI.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Menu item created");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create menu item",
      );
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateMenuItemRequest>;
    }) => menuAPI.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Menu item updated");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update menu item",
      );
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuAPI.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Menu item deleted");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete menu item",
      );
    },
  });
}

export function useToggleAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      isAvailable,
      stock,
    }: {
      id: string;
      isAvailable: boolean;
      stock?: number;
    }) => menuAPI.updateAvailability(id, { isAvailable, stock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update availability",
      );
    },
  });
}
export function useUpdateMenuCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        name: string;
        description: string;
        image: string;
        displayOrder: number;
        isActive: boolean;
      }>;
    }) => menuAPI.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "categories"] });
      toast.success("Category updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update category");
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MenuCategory>) => menuAPI.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "categories"] });
      toast.success("Category created");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "categories"] });
      toast.success("Category deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });
}
