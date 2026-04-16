import client from "./client";
import { API_ENDPOINTS } from "@/config/api";
import { MenuItem } from "@/types/admin";

export interface MenuCategory {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateMenuItemRequest {
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  variants?: {
    groupName: string;
    options: { name: string; additionalPrice: number }[];
  }[];
  dietaryTags?: string[];
  isFeatured?: boolean;
  isAvailable?: boolean;
  isCatering?: boolean;
  stock?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export const menuAPI = {
  // Categories
  getCategories: () =>
    client
      .get(API_ENDPOINTS.MENU_CATEGORIES)
      .then((r) => r.data.data as MenuCategory[]),

  createCategory: (data: Partial<MenuCategory>) =>
    client
      .post(API_ENDPOINTS.MENU_CATEGORIES, data)
      .then((r) => r.data.data as MenuCategory),

  updateCategory: (id: string, data: Partial<MenuCategory>) =>
    client
      .put(`${API_ENDPOINTS.MENU_CATEGORIES}/${id}`, data)
      .then((r) => r.data.data as MenuCategory),

  deleteCategory: (id: string) =>
    client.delete(`${API_ENDPOINTS.MENU_CATEGORIES}/${id}`).then((r) => r.data),

  reorderCategories: (order: { id: string; displayOrder: number }[]) =>
    client
      .put(API_ENDPOINTS.MENU_CATEGORIES_REORDER, { order })
      .then((r) => r.data),

  // Items
  getItems: (params?: { category?: string; page?: number; limit?: number }) =>
    client
      .get(API_ENDPOINTS.MENU_ITEMS, { params })
      .then((r) => r.data as { data: MenuItem[]; pagination?: any }),

  getItem: (id: string) =>
    client
      .get(API_ENDPOINTS.MENU_ITEM(id))
      .then((r) => r.data.data as MenuItem),

  createItem: (data: CreateMenuItemRequest) =>
    client
      .post(API_ENDPOINTS.MENU_ITEMS, data)
      .then((r) => r.data.data as MenuItem),

  updateItem: (id: string, data: Partial<CreateMenuItemRequest>) =>
    client
      .put(API_ENDPOINTS.MENU_ITEM(id), data)
      .then((r) => r.data.data as MenuItem),

  deleteItem: (id: string) =>
    client.delete(API_ENDPOINTS.MENU_ITEM(id)).then((r) => r.data),

  updateAvailability: (
    id: string,
    data: { isAvailable: boolean; stock?: number },
  ) =>
    client
      .put(API_ENDPOINTS.MENU_ITEM_AVAILABILITY(id), data)
      .then((r) => r.data.data as MenuItem),

  bulkUpdateAvailability: (data: {
    categoryId: string;
    isAvailable: boolean;
  }) =>
    client
      .put(API_ENDPOINTS.MENU_ITEMS_BULK_AVAILABILITY, data)
      .then((r) => r.data),
};
