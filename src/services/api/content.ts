import client from "./client";
import {
  ISeoGlobal,
  ISeoPageMetadata,
  ILocalSeo,
  IStructuredDataSettings,
  IRedirect,
  IPageContent,
  PageSlug,
  CreateRedirectDTO,
  UpdateRobotsTxtDTO,
} from "@/types/admin";

// ════ SEO API ════════════════════════════════════════════════════════════
export const seoAPI = {
  // Global SEO
  getGlobalSeo: () => client.get("/admin/seo/global").then(r => r.data.data as ISeoGlobal),
  updateGlobalSeo: (data: ISeoGlobal) => client.put("/admin/seo/global", data).then(r => r.data.data as ISeoGlobal),

  // Pages SEO
  getAllPagesSeo: () => client.get("/admin/seo/pages").then(r => r.data.data),
  getPageSeo: (page: PageSlug) => client.get(`/admin/seo/pages/${page}`).then(r => r.data.data as ISeoPageMetadata),
  updatePageSeo: (page: PageSlug, data: ISeoPageMetadata) => client.put(`/admin/seo/pages/${page}`, data).then(r => r.data.data as ISeoPageMetadata),

  // Local SEO
  getLocalSeo: () => client.get("/admin/seo/local").then(r => r.data.data as ILocalSeo),
  updateLocalSeo: (data: ILocalSeo) => client.put("/admin/seo/local", data).then(r => r.data.data as ILocalSeo),

  // Structured Data
  getStructuredData: () => client.get("/admin/seo/structured-data").then(r => r.data.data as IStructuredDataSettings),
  updateStructuredData: (data: IStructuredDataSettings) => client.put("/admin/seo/structured-data", data).then(r => r.data.data as IStructuredDataSettings),

  // Robots.txt
  getRobotsTxt: () => client.get("/admin/seo/robots").then(r => r.data.data as { robotsTxt: string }),
  updateRobotsTxt: (data: UpdateRobotsTxtDTO) => client.put("/admin/seo/robots", data).then(r => r.data.data),

  // Redirects
  getRedirects: () => client.get("/admin/seo/redirects").then(r => r.data.data as IRedirect[]),
  createRedirect: (data: CreateRedirectDTO) => client.post("/admin/seo/redirects", data).then(r => r.data.data as IRedirect),
  deleteRedirect: (redirectId: string) => client.delete(`/admin/seo/redirects/${redirectId}`).then(r => r.data),

  // Sitemap
  generateSitemap: () => client.post("/admin/seo/sitemap/generate").then(r => r.data),
};

// ════ CONTENT API ════════════════════════════════════════════════════════
export const contentAPI = {
  getPageContent: (page: PageSlug) => client.get(`/admin/content/${page}`).then(r => r.data.data as IPageContent),
  updatePageContent: (page: PageSlug, data: Partial<IPageContent>) => client.put(`/admin/content/${page}`, data).then(r => r.data.data as IPageContent),
};