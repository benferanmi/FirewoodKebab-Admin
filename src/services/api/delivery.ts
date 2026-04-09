import client from "./client";

export interface IDeliveryZone {
  _id?: string;
  name: string;
  description?: string;
  type: "zipcode" | "radius";
  coverage: {
    zipCodePrefixes?: string[];
    centerLatitude?: number;
    centerLongitude?: number;
    radiusKm?: number;
  };
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTimeMin: number;
  estimatedDeliveryTimeMax: number;
  active: boolean;
  priority: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeliveryZonesResponse {
  data: IDeliveryZone[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const adminDeliveryZonesAPI = {
  // List all zones with filters, pagination, search, sorting
  getZones: (filters: {
    page?: number;
    limit?: number;
    search?: string;
    type?: "zipcode" | "radius" | "all";
    status?: "active" | "inactive" | "all";
    sortBy?: "name" | "fee" | "minOrder" | "createdAt";
    sortOrder?: "asc" | "desc";
  }) => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.search) params.append("search", filters.search);
    if (filters.type) params.append("type", filters.type);
    if (filters.status) params.append("status", filters.status);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    return client
      .get(`/admin/delivery-zones?${params.toString()}`)
      .then((r) => r.data.data as DeliveryZonesResponse);
  },

  // Get single zone
  getZone: (id: string) =>
    client
      .get(`/admin/delivery-zones/${id}`)
      .then((r) => r.data.data as IDeliveryZone),

  // Create zone
  createZone: (data: Partial<IDeliveryZone>) =>
    client
      .post("/admin/delivery-zones", data)
      .then((r) => r.data.data as IDeliveryZone),

  // Update zone
  updateZone: (id: string, data: Partial<IDeliveryZone>) =>
    client
      .put(`/admin/delivery-zones/${id}`, data)
      .then((r) => r.data.data as IDeliveryZone),

  // Delete zone
  deleteZone: (id: string) =>
    client.delete(`/admin/delivery-zones/${id}`).then((r) => r.data),

  // Toggle active status
  toggleZoneActive: (id: string) =>
    client
      .patch(`/admin/delivery-zones/${id}/toggle-active`)
      .then((r) => r.data.data as IDeliveryZone),
};