export type AdminRole =
  | "superadmin"
  | "admin"
  | "manager"
  | "kitchen"
  | "delivery";

export const PERMISSIONS = {
  VIEW_ORDERS: "VIEW_ORDERS",
  UPDATE_ORDER_STATUS: "UPDATE_ORDER_STATUS",
  CANCEL_ORDER: "CANCEL_ORDER",
  REFUND_ORDER: "REFUND_ORDER",
  VIEW_MENU: "VIEW_MENU",
  CREATE_MENU_ITEM: "CREATE_MENU_ITEM",
  EDIT_MENU_ITEM: "EDIT_MENU_ITEM",
  DELETE_MENU_ITEM: "DELETE_MENU_ITEM",
  MANAGE_CATEGORIES: "MANAGE_CATEGORIES",
  VIEW_CUSTOMERS: "VIEW_CUSTOMERS",
  EDIT_CUSTOMER: "EDIT_CUSTOMER",
  BLOCK_CUSTOMER: "BLOCK_CUSTOMER",
  VIEW_PROMOTIONS: "VIEW_PROMOTIONS",
  CREATE_COUPON: "CREATE_COUPON",
  EDIT_COUPON: "EDIT_COUPON",
  DELETE_COUPON: "DELETE_COUPON",
  VIEW_REVIEWS: "VIEW_REVIEWS",
  APPROVE_REVIEW: "APPROVE_REVIEW",
  DELETE_REVIEW: "DELETE_REVIEW",
  VIEW_ANALYTICS: "VIEW_ANALYTICS",
  EXPORT_DATA: "EXPORT_DATA",
  MANAGE_SETTINGS: "MANAGE_SETTINGS",
  MANAGE_ADMIN_USERS: "MANAGE_ADMIN_USERS",
  MANAGE_CONTENT: "MANAGE_CONTENT",
  SEND_NOTIFICATIONS: "SEND_NOTIFICATIONS",
} as const;

export type Permission = keyof typeof PERMISSIONS;

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  superadmin: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS,
  manager: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.CANCEL_ORDER,
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.CREATE_MENU_ITEM,
    PERMISSIONS.EDIT_MENU_ITEM,
    PERMISSIONS.DELETE_MENU_ITEM,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMER,
    PERMISSIONS.VIEW_PROMOTIONS,
    PERMISSIONS.VIEW_REVIEWS,
  ],
  kitchen: [PERMISSIONS.VIEW_ORDERS, PERMISSIONS.UPDATE_ORDER_STATUS],
  delivery: [PERMISSIONS.VIEW_ORDERS, PERMISSIONS.UPDATE_ORDER_STATUS],
};

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: AdminRole;
  isActive: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
export type PaymentStatus =
  | "pending"
  | "initiated"
  | "successful"
  | "failed"
  | "refunded";

export interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: UserData;
  items: {
    menuItemId: string;
    menuItemName: string;
    quantity: number;
    price: number;
    _id: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  deliveryType: "delivery" | "collection";
  createdAt: string;
  paymentReference?: string;
}

export interface VariantOption {
  _id: string;
  name: string;
  additionalPrice: number;
}

export interface VariantGroup {
  _id: string;
  groupName: string;
  options: VariantOption[];
}
export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  categoryName: string;
  isAvailable: boolean;
  isFeatured: boolean;
  dietaryTags: string[];
  averageRating: number;
  reviewCount: number;
  stock: number;
  isCatering: boolean;
  variants: VariantGroup[];
  createdAt: string; // ← new
  updatedAt: string; // ← new
}

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  addresses: [
    {
      label: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      _id: string;
      isDefault: boolean;
    },
  ];
  createdAt: string;
  isBlocked: boolean;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  orderNumber: string;
  menuItemName?: string;
  isApproved: boolean;
  isHidden: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "fixed_amount" | "percentage";
  value: number;
  description?: string;
  minOrderAmount?: number;
  maxUsagePerUser?: number;
  maxTotalUsage?: number;
  currentUsageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
