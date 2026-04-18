import { create } from "zustand";
import { OrderStatus, PaymentStatus } from "@/types/admin";

interface OrderFilters {
  status?: OrderStatus | "all";
  paymentStatus?: PaymentStatus | "all";
  search: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc"; 
}

interface CustomerFilters {
  search: string;
  status?: "all" | "active" | "blocked";
  sortBy?: "name" | "spend" | "orders";
  page: number;
  limit: number;
}

interface ReviewFilters {
  status: "all" | "pending" | "approved" | "hidden";
  page: number;
  limit: number;
}

interface AnalyticsFilters {
  period: "7d" | "30d" | "90d";
  startDate?: string;
  endDate?: string;
}

interface DeliveryZoneFilters {
  search: string;
  type: "zipcode" | "radius" | "all";
  status: "active" | "inactive" | "all";
  sortBy: "name" | "fee" | "minOrder" | "createdAt";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

interface FiltersState {
  orderFilters: OrderFilters;
  customerFilters: CustomerFilters;
  reviewFilters: ReviewFilters;
  analyticsFilters: AnalyticsFilters;
  deliveryZoneFilters: DeliveryZoneFilters;
  setOrderFilters: (filters: Partial<OrderFilters>) => void;
  setCustomerFilters: (filters: Partial<CustomerFilters>) => void;
  setReviewFilters: (filters: Partial<ReviewFilters>) => void;
  setAnalyticsFilters: (filters: Partial<AnalyticsFilters>) => void;
  setDeliveryZoneFilters: (filters: Partial<DeliveryZoneFilters>) => void;
  resetOrderFilters: () => void;
  resetCustomerFilters: () => void;
  resetDeliveryZoneFilters: () => void;
}

const defaultOrderFilters: OrderFilters = {
  status: "all",
  paymentStatus: "all",
  search: "",
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const defaultCustomerFilters: CustomerFilters = {
  search: "",
  status: "all",
  page: 1,
  limit: 20,
};

const defaultReviewFilters: ReviewFilters = {
  status: "all",
  page: 1,
  limit: 20,
};

const defaultAnalyticsFilters: AnalyticsFilters = {
  period: "7d",
};

const defaultDeliveryZoneFilters: DeliveryZoneFilters = {
  search: "",
  type: "all",
  status: "all",
  sortBy: "name",
  sortOrder: "asc",
  page: 1,
  limit: 20,
};

export const useFiltersStore = create<FiltersState>()((set) => ({
  orderFilters: defaultOrderFilters,
  customerFilters: defaultCustomerFilters,
  reviewFilters: defaultReviewFilters,
  analyticsFilters: defaultAnalyticsFilters,
  deliveryZoneFilters: defaultDeliveryZoneFilters,

  setOrderFilters: (filters) =>
    set((state) => ({ orderFilters: { ...state.orderFilters, ...filters } })),

  setCustomerFilters: (filters) =>
    set((state) => ({
      customerFilters: { ...state.customerFilters, ...filters },
    })),

  setReviewFilters: (filters) =>
    set((state) => ({ reviewFilters: { ...state.reviewFilters, ...filters } })),

  setAnalyticsFilters: (filters) =>
    set((state) => ({
      analyticsFilters: { ...state.analyticsFilters, ...filters },
    })),

  setDeliveryZoneFilters: (filters) =>
    set((state) => ({
      deliveryZoneFilters: {
        ...state.deliveryZoneFilters,
        ...filters,
      },
    })),

  resetOrderFilters: () => set({ orderFilters: defaultOrderFilters }),
  resetCustomerFilters: () => set({ customerFilters: defaultCustomerFilters }),
  resetDeliveryZoneFilters: () =>
    set({ deliveryZoneFilters: defaultDeliveryZoneFilters }),
}));
