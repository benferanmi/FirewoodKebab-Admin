import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { seoAPI, contentAPI } from "@/services/api/content";
import { toast } from "sonner";
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

// ════ SEO HOOKS ══════════════════════════════════════════════════════════

export function useGlobalSeo() {
  return useQuery({
    queryKey: ["seo", "global"],
    queryFn: seoAPI.getGlobalSeo,
  });
}

export function useUpdateGlobalSeo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seoAPI.updateGlobalSeo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "global"] });
      toast.success("Global SEO saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save global SEO");
    },
  });
}

export function useAllPagesSeo() {
  return useQuery({
    queryKey: ["seo", "pages"],
    queryFn: seoAPI.getAllPagesSeo,
  });
}

export function usePageSeo(page: PageSlug) {
  return useQuery({
    queryKey: ["seo", "pages", page],
    queryFn: () => seoAPI.getPageSeo(page),
  });
}

export function useUpdatePageSeo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ page, data }: { page: PageSlug; data: ISeoPageMetadata }) =>
      seoAPI.updatePageSeo(page, data),
    onSuccess: (_, { page }) => {
      queryClient.invalidateQueries({ queryKey: ["seo", "pages"] });
      queryClient.invalidateQueries({ queryKey: ["seo", "pages", page] });
      toast.success("Page SEO saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save page SEO");
    },
  });
}

export function useLocalSeo() {
  return useQuery({
    queryKey: ["seo", "local"],
    queryFn: seoAPI.getLocalSeo,
  });
}

export function useUpdateLocalSeo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seoAPI.updateLocalSeo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "local"] });
      toast.success("Local SEO saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save local SEO");
    },
  });
}

export function useStructuredData() {
  return useQuery({
    queryKey: ["seo", "structured-data"],
    queryFn: seoAPI.getStructuredData,
  });
}

export function useUpdateStructuredData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seoAPI.updateStructuredData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "structured-data"] });
      toast.success("Structured data saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save structured data");
    },
  });
}

export function useRobotsTxt() {
  return useQuery({
    queryKey: ["seo", "robots"],
    queryFn: seoAPI.getRobotsTxt,
  });
}

export function useUpdateRobotsTxt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seoAPI.updateRobotsTxt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "robots"] });
      toast.success("robots.txt saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save robots.txt");
    },
  });
}

export function useRedirects() {
  return useQuery({
    queryKey: ["seo", "redirects"],
    queryFn: seoAPI.getRedirects,
  });
}

export function useCreateRedirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seoAPI.createRedirect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "redirects"] });
      toast.success("Redirect added");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add redirect");
    },
  });
}

export function useDeleteRedirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seoAPI.deleteRedirect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "redirects"] });
      toast.success("Redirect deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete redirect");
    },
  });
}

// ════ CONTENT HOOKS ══════════════════════════════════════════════════════

export function usePageContent(page: PageSlug) {
  return useQuery({
    queryKey: ["content", page],
    queryFn: () => contentAPI.getPageContent(page),
  });
}

export function useUpdatePageContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ page, data }: { page: PageSlug; data: Partial<IPageContent> }) =>
      contentAPI.updatePageContent(page, data),
    onSuccess: (_, { page }) => {
      queryClient.invalidateQueries({ queryKey: ["content", page] });
      toast.success(`${page} content saved`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save content");
    },
  });
}