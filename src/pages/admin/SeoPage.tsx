// src/pages/admin/SeoPage.tsx
import { useState, useEffect } from "react";
import { Save, Copy, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import client from "@/services/api/client";
import {
  PageSlug,
  ISeoGlobal,
  ISeoPageMetadata,
  ILocalSeo,
  IStructuredDataSettings,
  IRedirect,
} from "@/types/admin";
import {
  useGlobalSeo,
  useAllPagesSeo,
  useLocalSeo,
  useStructuredData,
  useRobotsTxt,
  useRedirects,
  useUpdateGlobalSeo,
  useUpdatePageSeo,
  useUpdateLocalSeo,
  useUpdateStructuredData,
  useUpdateRobotsTxt,
  useCreateRedirect,
  useDeleteRedirect,
} from "@/hooks/useContent";

const PAGES: { id: PageSlug; label: string }[] = [
  { id: "home", label: "Homepage" },
  { id: "menu", label: "Menu Page" },
  { id: "about", label: "About Page" },
  { id: "contact", label: "Contact Page" },
  { id: "catering", label: "Catering Page" },
];

export default function SeoPage() {
  // ── Global SEO State ────────────────────────────────────────────────────
  const [selectedPage, setSelectedPage] = useState<PageSlug>("home");
  const [newRedirectFrom, setNewRedirectFrom] = useState("");
  const [newRedirectTo, setNewRedirectTo] = useState("");
  const [localSeoForm, setLocalSeoForm] = useState<ILocalSeo>({
    name: "",
    address: "",
    phone: "",
  });
  const [structuredDataForm, setStructuredDataForm] =
    useState<IStructuredDataSettings>({
      enableRestaurantSchema: true,
      enableMenuSchema: true,
      enableBreadcrumbs: true,
    });
  const [globalSeoForm, setGlobalSeoForm] = useState<ISeoGlobal>({
    siteTitle: "",
    metaDescription: "",
  });
  const {
    data: globalSeo = { siteTitle: "", metaDescription: "" },
    isLoading: globalLoading,
  } = useGlobalSeo();
  const { data: pagesSeo = {}, isLoading: pagesLoading } = useAllPagesSeo();
  const {
    data: localSeo = { name: "", address: "", phone: "" },
    isLoading: localLoading,
  } = useLocalSeo();
  const {
    data: structuredData = {
      enableRestaurantSchema: true,
      enableMenuSchema: true,
      enableBreadcrumbs: true,
    },
    isLoading: structuredLoading,
  } = useStructuredData();
  const { data: robotsData = { robotsTxt: "" }, isLoading: robotsDataLoading } =
    useRobotsTxt();
  const { data: redirects = [], isLoading: redirectsLoading } = useRedirects();

  const updateGlobalSeo = useUpdateGlobalSeo();
  const updatePageSeo = useUpdatePageSeo();
  const updateLocalSeo = useUpdateLocalSeo();
  const updateStructuredData = useUpdateStructuredData();
  const updateRobotsTxt = useUpdateRobotsTxt();
  const createRedirect = useCreateRedirect();
  const deleteRedirect = useDeleteRedirect();

  const [robotsTxt, setRobotsTxt] = useState("");
  const [pagesSeoForm, setPagesSeoForm] = useState<ISeoPageMetadata>({
    title: "",
    description: "",
    ogImage: "",
    canonical: "",
  });

  // Load page data when selected page changes
  useEffect(() => {
    if (pagesSeo[selectedPage]) {
      setPagesSeoForm(pagesSeo[selectedPage]);
    } else {
      setPagesSeoForm({
        title: "",
        description: "",
        ogImage: "",
        canonical: "",
      });
    }
  }, [selectedPage, pagesSeo]);
  useEffect(() => {
    if (robotsData?.robotsTxt) setRobotsTxt(robotsData.robotsTxt);
  }, [robotsData]);

  // ── Global SEO Handlers ─────────────────────────────────────────────────
  const handleSaveGlobalSeo = () => {
    updateGlobalSeo.mutate(globalSeo);
  };

  // ── Pages SEO Handlers ──────────────────────────────────────────────────
  const currentPageSeo = pagesSeo[selectedPage] || {
    title: "",
    description: "",
    ogImage: "",
    canonical: "",
  };

  const handleSavePageSeo = () => {
    updatePageSeo.mutate({ page: selectedPage, data: currentPageSeo });
  };

  // ── Local SEO Handlers ──────────────────────────────────────────────────
  const handleSaveLocalSeo = () => {
    updateLocalSeo.mutate(localSeoForm);
  };

  // ── Structured Data Handlers ────────────────────────────────────────────
  const handleSaveStructuredData = () => {
    updateStructuredData.mutate(structuredDataForm);
  };

  // ── Robots.txt Handlers ─────────────────────────────────────────────────
  const handleSaveRobotsTxt = () => {
    updateRobotsTxt.mutate({ robotsTxt });
  };

  // ── Redirects Handlers ──────────────────────────────────────────────────
  const handleAddRedirect = () => {
    if (!newRedirectFrom || !newRedirectTo) {
      toast.error("Fill in both from and to URLs");
      return;
    }
    createRedirect.mutate({ from: newRedirectFrom, to: newRedirectTo });
    setNewRedirectFrom("");
    setNewRedirectTo("");
  };

  const handleDeleteRedirect = (id: string) => {
    deleteRedirect.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SEO Manager</h1>
        <p className="text-muted-foreground">
          Manage your website's SEO settings, meta tags, and structured data.
        </p>
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="global">Global SEO</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="local">Local SEO</TabsTrigger>
          <TabsTrigger value="structured">Structured Data</TabsTrigger>
          <TabsTrigger value="robots">Robots.txt</TabsTrigger>
          <TabsTrigger value="redirects">Redirects</TabsTrigger>
        </TabsList>

        {/* ── GLOBAL SEO ────────────────────────────────────────────────*/}
        <TabsContent value="global">
          <div className="glass-card rounded-xl p-6 space-y-5 max-w-2xl">
            <h3 className="text-sm font-semibold">Global SEO Settings</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">
                  Site Title ({globalSeo.siteTitle.length}/60)
                </Label>
                <Input
                  maxLength={60}
                  value={globalSeo.siteTitle}
                  onChange={(e) =>
                    setGlobalSeoForm((p) => ({
                      ...p,
                      siteTitle: e.target.value,
                    }))
                  }
                  placeholder="Your restaurant name"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">
                  Meta Description ({globalSeo.metaDescription.length}/160)
                </Label>
                <Textarea
                  maxLength={160}
                  value={globalSeo.metaDescription}
                  onChange={(e) =>
                    setGlobalSeoForm((p) => ({
                      ...p,
                      metaDescription: e.target.value,
                    }))
                  }
                  placeholder="Brief description of your restaurant"
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">OG Image URL</Label>
                <Input
                  value={globalSeo.ogImageUrl || ""}
                  onChange={(e) =>
                    setGlobalSeoForm((p) => ({
                      ...p,
                      ogImageUrl: e.target.value,
                    }))
                  }
                  placeholder="https://cloudinary.com/..."
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Google Analytics ID</Label>
                <Input
                  value={globalSeo.googleAnalyticsId || ""}
                  onChange={(e) =>
                    setGlobalSeoForm((p) => ({
                      ...p,
                      googleAnalyticsId: e.target.value,
                    }))
                  }
                  placeholder="G-XXXXXXXXXX"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Google Search Console Code</Label>
                <Input
                  value={globalSeo.googleSearchConsoleCode || ""}
                  onChange={(e) =>
                    setGlobalSeoForm((p) => ({
                      ...p,
                      googleSearchConsoleCode: e.target.value,
                    }))
                  }
                  placeholder="Verification code"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleSaveGlobalSeo}
              disabled={updateGlobalSeo.isPending}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {updateGlobalSeo.isPending ? "Saving..." : "Save Global SEO"}
            </Button>
          </div>
        </TabsContent>

        {/* ── PAGES SEO ──────────────────────────────────────────────────*/}
        <TabsContent value="pages">
          <div className="glass-card rounded-xl p-6 space-y-5 max-w-2xl">
            <h3 className="text-sm font-semibold">Page-Specific SEO</h3>

            {/* Page selector */}
            <div className="flex gap-2 flex-wrap">
              {PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    selectedPage === page.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>

            {/* Page SEO form */}
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label className="text-xs">
                  Title ({currentPageSeo.title?.length || 0}/60)
                </Label>
                <Input
                  maxLength={60}
                  value={currentPageSeo.title || ""}
                 onChange={(e) => setPagesSeoForm((p) => ({ ...p, title: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">
                  Description ({currentPageSeo.description?.length || 0}/160)
                </Label>
                <Textarea
                  maxLength={160}
                  value={currentPageSeo.description || ""}
                  onChange={(e) => setPagesSeoForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">OG Image URL</Label>
                <Input
                  value={currentPageSeo.ogImage || ""}
                  onChange={(e) => setPagesSeoForm((p) => ({ ...p, ogImage: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Canonical URL</Label>
                <Input
                  value={currentPageSeo.canonical || ""}
                  onChange={(e) => setPagesSeoForm((p) => ({ ...p, canonical: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              {/* Preview snippet */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs font-semibold mb-2 text-muted-foreground">
                  Google Preview
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-600">
                    {currentPageSeo.title || "[No title]"}
                  </p>
                  <p className="text-xs text-green-700">
                    example.com › {selectedPage}
                  </p>
                  <p className="text-xs text-gray-600">
                    {currentPageSeo.description || "[No description provided]"}
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleSavePageSeo}
              disabled={updatePageSeo.isPending}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {updatePageSeo.isPending
                ? "Saving..."
                : `Save ${selectedPage} SEO`}
            </Button>
          </div>
        </TabsContent>

        {/* ── LOCAL SEO ────────────────────────────────────────────────*/}
        <TabsContent value="local">
          <div className="glass-card rounded-xl p-6 space-y-5 max-w-2xl">
            <h3 className="text-sm font-semibold">Local SEO (NAP)</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Business Name</Label>
                <Input
                  value={localSeo.name}
                  onChange={(e) =>
                    setLocalSeoForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Address</Label>
                <Input
                  value={localSeo.address}
                  onChange={(e) =>
                    setLocalSeoForm((p) => ({ ...p, address: e.target.value }))
                  }
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Phone</Label>
                <Input
                  value={localSeo.phone}
                  onChange={(e) =>
                    setLocalSeoForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Google Business Profile URL</Label>
                <Input
                  value={localSeo.googleBusinessUrl || ""}
                  onChange={(e) =>
                    setLocalSeoForm((p) => ({
                      ...p,
                      googleBusinessUrl: e.target.value,
                    }))
                  }
                  placeholder="https://business.google.com/..."
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Yelp URL</Label>
                <Input
                  value={localSeo.yelpUrl || ""}
                  onChange={(e) =>
                    setLocalSeoForm((p) => ({ ...p, yelpUrl: e.target.value }))
                  }
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">TripAdvisor URL</Label>
                <Input
                  value={localSeo.tripadvisorUrl || ""}
                  onChange={(e) =>
                    setLocalSeoForm((p) => ({
                      ...p,
                      tripadvisorUrl: e.target.value,
                    }))
                  }
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Service Area</Label>
                <Input
                  value={localSeo.serviceArea || ""}
                  onChange={(e) =>
                    setLocalSeoForm((p) => ({
                      ...p,
                      serviceArea: e.target.value,
                    }))
                  }
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">
                  Cuisine Types (comma-separated)
                </Label>
                <Input
                  value={localSeo.cuisineType?.join(", ") || ""}
                  onChange={(e) =>
                    setLocalSeoForm((p) => ({
                      ...p,
                      cuisineType: e.target.value
                        .split(",")
                        .map((c) => c.trim()),
                    }))
                  }
                  placeholder="Kebab, Mediterranean, Grilled"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleSaveLocalSeo}
              disabled={updateLocalSeo.isPending}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {updateLocalSeo.isPending ? "Saving..." : "Save Local SEO"}
            </Button>
          </div>
        </TabsContent>

        {/* ── STRUCTURED DATA ───────────────────────────────────────────*/}
        <TabsContent value="structured">
          <div className="glass-card rounded-xl p-6 space-y-5 max-w-2xl">
            <h3 className="text-sm font-semibold">Structured Data Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">Restaurant Schema</p>
                  <p className="text-xs text-muted-foreground">
                    Enable JSON-LD restaurant structured data
                  </p>
                </div>
                <Switch
                  checked={structuredData.enableRestaurantSchema}
                  onCheckedChange={(v) =>
                    setStructuredDataForm((p) => ({
                      ...p,
                      enableRestaurantSchema: v,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">Menu Schema</p>
                  <p className="text-xs text-muted-foreground">
                    Enable JSON-LD menu structured data
                  </p>
                </div>
                <Switch
                  checked={structuredData.enableMenuSchema}
                  onCheckedChange={(v) =>
                    setStructuredDataForm((p) => ({
                      ...p,
                      enableMenuSchema: v,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">Breadcrumb Schema</p>
                  <p className="text-xs text-muted-foreground">
                    Enable breadcrumb navigation structured data
                  </p>
                </div>
                <Switch
                  checked={structuredData.enableBreadcrumbs}
                  onCheckedChange={(v) =>
                    setStructuredDataForm((p) => ({
                      ...p,
                      enableBreadcrumbs: v,
                    }))
                  }
                />
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleSaveStructuredData}
              disabled={updateStructuredData.isPending}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {structuredLoading ? "Saving..." : "Save Structured Data"}
            </Button>
          </div>
        </TabsContent>

        {/* ── ROBOTS.TXT ────────────────────────────────────────────────*/}
        <TabsContent value="robots">
          <div className="glass-card rounded-xl p-6 space-y-5 max-w-2xl">
            <h3 className="text-sm font-semibold">robots.txt</h3>

            <div className="space-y-2">
              <Label className="text-xs">Content</Label>
              <Textarea
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                rows={10}
                className="text-sm font-mono resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveRobotsTxt}
                disabled={updateRobotsTxt.isPending}
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {updateRobotsTxt.isPending ? "Saving..." : "Save robots.txt"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── REDIRECTS ────────────────────────────────────────────────*/}
        <TabsContent value="redirects">
          <div className="glass-card rounded-xl p-6 space-y-5 max-w-2xl">
            <h3 className="text-sm font-semibold">301 Redirects</h3>

            {/* Add new redirect */}
            <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-xs font-semibold">Add New Redirect</p>
              <div className="grid sm:grid-cols-2 gap-2">
                <Input
                  placeholder="From URL (e.g., /old-page)"
                  value={newRedirectFrom}
                  onChange={(e) => setNewRedirectFrom(e.target.value)}
                  className="h-9 text-sm"
                />
                <Input
                  placeholder="To URL (e.g., /new-page)"
                  value={newRedirectTo}
                  onChange={(e) => setNewRedirectTo(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <Button
                size="sm"
                onClick={handleAddRedirect}
                disabled={createRedirect.isPending || deleteRedirect.isPending}
              >
                Add Redirect
              </Button>
            </div>

            {/* Redirects list */}
            {redirects.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {redirects.length} redirect{redirects.length !== 1 ? "s" : ""}
                </p>
                <div className="space-y-2">
                  {redirects.map((redirect) => (
                    <div
                      key={redirect._id?.toString()}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-muted-foreground break-all">
                          {redirect.from} → {redirect.to}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleDeleteRedirect(redirect._id?.toString() || "")
                        }
                        disabled={
                          createRedirect.isPending || deleteRedirect.isPending
                        }
                        className="ml-2"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No redirects configured
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
