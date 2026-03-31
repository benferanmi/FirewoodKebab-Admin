import client from "./client";
import { API_ENDPOINTS } from "@/config/api";

export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  menuSectionTitle?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
}

export const contentAPI = {
  getHomeContent: () =>
    client.get(API_ENDPOINTS.CONTENT_HOME).then((r) => r.data.data as HomeContent),

  updateHomeContent: (data: Partial<HomeContent>) =>
    client.put(API_ENDPOINTS.CONTENT_HOME, data).then((r) => r.data.data as HomeContent),

  getGallery: () =>
    client.get(API_ENDPOINTS.CONTENT_GALLERY).then((r) => r.data.data as GalleryImage[]),

  uploadGalleryImage: (formData: FormData) =>
    client.post(API_ENDPOINTS.CONTENT_GALLERY, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data as GalleryImage),

  deleteGalleryImage: (id: string) =>
    client.delete(API_ENDPOINTS.CONTENT_GALLERY_ITEM(id)).then((r) => r.data),
};
