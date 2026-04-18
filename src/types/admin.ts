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
  MANAGE_DELIVERY_ZONES: "MANAGE_DELIVERY_ZONES",
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

export interface IStatusHistoryEntry {
  status: string;
  updatedAt: Date;
  updatedBy?: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: UserData;
  guestName?: string;
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
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  deliveryType: "delivery" | "collection";
  zoneName?: string;
  specialInstructions?: string;
  totalAmountCharged: number;
  couponCode?: string;
  couponId?: string;
  createdAt: string;
  paymentReference?: string;
  tipAmount: number;
  totalWithTip: number;
  paymentAttempts: number;
  updatedAt: Date;
  cancelledAt?: Date;
  statusHistory: IStatusHistoryEntry[];
  estimatedDeliveryTime?: Date;
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
  seoTitle?: string; // ← new
  seoDescription?: string; // ← new
  seoKeywords?: string[]; // ← new
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
      zipCode: string;
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
export interface ISeoPageMetadata {
  title: string; // max 60 chars
  description: string; // max 160 chars
  ogImage?: string; // Cloudinary URL
  canonical?: string;
}

export interface ISeoGlobal {
  siteTitle: string;
  metaDescription: string;
  ogImageUrl?: string;
  googleAnalyticsId?: string;
  googleSearchConsoleCode?: string;
}

export interface ILocalSeo {
  name: string;
  address: string;
  phone: string;
  googleBusinessUrl?: string;
  yelpUrl?: string;
  tripadvisorUrl?: string;
  serviceArea?: string;
  cuisineType?: string[];
}

export interface IStructuredDataSettings {
  enableRestaurantSchema: boolean;
  enableMenuSchema: boolean;
  enableBreadcrumbs: boolean;
}

export interface IRedirect {
  _id?: string;
  from: string;
  to: string;
  statusCode: number;
}

export interface ISeoSettings {
  _id: string;

  // Global SEO
  globalSeo: ISeoGlobal;

  // Per-page SEO
  pagesSeo: {
    home?: ISeoPageMetadata;
    menu?: ISeoPageMetadata;
    about?: ISeoPageMetadata;
    contact?: ISeoPageMetadata;
    catering?: ISeoPageMetadata;
  };

  // Local SEO
  localSeo: ILocalSeo;

  // Structured Data
  structuredData: IStructuredDataSettings;

  // Robots.txt
  robotsTxt?: string;

  // Redirects
  redirects: IRedirect[];

  createdAt: Date;
  updatedAt: Date;
}

// ===== Page Content Types =====
export interface IAboutContent {
  heroHeading: string;
  heroSubheading: string;
  storyText: string;
  stats: Array<{
    value: string;
    label: string;
  }>;
  values: Array<{
    title: string;
    description: string;
    icon: string; // lucide-react icon name or emoji
  }>;
  team: Array<{
    name: string;
    role: string;
    bio?: string;
    image: string; // Cloudinary URL
  }>;
}

export interface IContactContent {
  heroHeading: string;
  heroText: string;
}

export interface ICateringContent {
  heroHeading: string;
  heroText: string;
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export type PageSlug = "home" | "about" | "contact" | "catering" | "menu";

export interface IPageContent {
  _id: string;
  pageSlug: PageSlug;
  home?: {
    heroHeading: string;
    heroTagline: string;
    heroDescription: string;
  };
  // Page-specific content
  about?: IAboutContent;
  contact?: IContactContent;
  catering?: ICateringContent;

  createdAt: Date;
  updatedAt: Date;
}

// ===== Extended MenuItem SEO =====
export interface IMenuItemSeo {
  seoTitle?: string; // Page title for /menu/:id
  seoDescription?: string; // Meta description
  seoKeywords?: string[];
}

// Add to existing IMenuItem:
// seo?: IMenuItemSeo;

// ===== Homepage SEO Schema Response =====
export interface IHomepageSeoData {
  title: string;
  description: string;
  ogImage?: string;
  canonical: string;
  restaurantSchema: Record<string, any>; // JSON-LD
  breadcrumbSchema: Record<string, any>; // JSON-LD
}

// ===== API Response DTOs =====
export interface CreateOrUpdateSeoGlobalDTO {
  siteTitle: string;
  metaDescription: string;
  ogImageUrl?: string;
  googleAnalyticsId?: string;
  googleSearchConsoleCode?: string;
}

// export interface CreateOrUpdatePageSeoDTO extends ISeoPageMetadata {}

// export interface CreateOrUpdateLocalSeoDTO extends ILocalSeo {}

// export interface CreateOrUpdateStructuredDataDTO extends IStructuredDataSettings {}

export interface CreateRedirectDTO {
  from: string;
  to: string;
  statusCode?: number;
}

export interface UpdateRobotsTxtDTO {
  robotsTxt: string;
}

export interface CreateOrUpdatePageContentDTO {
  pageSlug: PageSlug;
  about?: IAboutContent;
  contact?: IContactContent;
  catering?: ICateringContent;
}

export interface IAboutStat {
  value: string;
  label: string;
}

export interface IAboutValue {
  title: string;
  description: string;
  icon: string;
}

export interface IAboutTeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface IAboutSeoData {
  title: string;
  description: string;
  ogImage?: string;
  canonical: string;
  organizationSchema?: any;
  personSchemas?: any[];
  breadcrumbSchema?: any;
}

// Announcement Types
export interface IAnnouncement {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  backgroundColor?: string;
  ctaText?: string;
  ctaLink?: string;
  isBroadcast: boolean; // true = all users, false = specific users
  targetUserIds?: string[]; // User IDs if not broadcast
  adminId: string;
  createdByAdmin: true;
  type: "announcement";
  isRead?: boolean;
  readAt?: Date;
  expiresAt?: Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface INotification {
  _id?: string;
  userId?: string;
  orderId?: string;
  couponId?: string;
  type:
    | "order_confirmation"
    | "order_update"
    | "delivery"
    | "review"
    | "promotion"
    | "announcement";
  title: string;
  message: string;
  data?: any;
  isRead?: boolean;
  readAt?: Date;
  channels?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
  isBroadcast?: boolean;
  expiresAt?: Date;
  createdByAdmin?: boolean;
  adminId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  backgroundColor?: string;
  ctaText?: string;
  ctaLink?: string;
  isBroadcast: boolean;
  targetUserIds?: string[];
}

export interface UpdateAnnouncementRequest {
  title?: string;
  message?: string;
  backgroundColor?: string;
  ctaText?: string;
  ctaLink?: string;
  isBroadcast?: boolean;
  targetUserIds?: string[];
  expiresAt?: string;
}
